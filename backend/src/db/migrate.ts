import db from './database.js';
import { createSchema } from './schema.js';
import { seedDatabase } from './seed.js';

/**
 * Migration script to handle schema changes
 * This will migrate from the old "spools" table structure to the new "filaments" + "spools" structure
 */
export function migrate() {
  console.log('Starting database migration...');

  // Check if migration is needed
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name IN ('spools', 'filaments')
  `).all() as Array<{ name: string }>;

  const tableNames = tables.map(t => t.name);
  const hasOldSpoolsTable = tableNames.includes('spools');
  const hasNewFilamentsTable = tableNames.includes('filaments');

  // If we already have the new structure, skip migration
  if (hasNewFilamentsTable && !hasOldSpoolsTable) {
    console.log('Database already migrated, skipping...');
    createSchema(); // Ensure all tables exist
    seedDatabase(); // Ensure default data exists
    return;
  }

  // If we have the old structure, migrate it
  if (hasOldSpoolsTable && !hasNewFilamentsTable) {
    console.log('Migrating from old schema to new schema...');

    // Check if old spools table has the old structure (with remaining_weight_g)
    const oldTableInfo = db.prepare(`PRAGMA table_info(spools)`).all() as Array<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: any;
      pk: number;
    }>;

    const hasRemainingWeight = oldTableInfo.some(col => col.name === 'remaining_weight_g');

    if (hasRemainingWeight) {
      console.log('Detected old schema, performing migration...');

      // Step 1: Create new tables (but not spools yet, we'll recreate it)
      db.exec(`
        CREATE TABLE IF NOT EXISTS materials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          is_custom INTEGER NOT NULL DEFAULT 0
        )
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS colors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          hex TEXT,
          is_custom INTEGER NOT NULL DEFAULT 0
        )
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS templates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          material_id INTEGER NOT NULL,
          manufacturer TEXT,
          starting_weight_g REAL NOT NULL,
          empty_weight_g REAL,
          notes TEXT,
          FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT
        )
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS filaments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          material_id INTEGER NOT NULL,
          color_id INTEGER NOT NULL,
          manufacturer TEXT,
          template_id INTEGER,
          archived INTEGER NOT NULL DEFAULT 0,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE RESTRICT,
          FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE RESTRICT,
          FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL
        )
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS consumption_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filament_id INTEGER NOT NULL,
          amount_g REAL NOT NULL,
          amount_m REAL,
          print_name TEXT,
          type TEXT NOT NULL CHECK(type IN ('success', 'failed', 'test', 'manual')),
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (filament_id) REFERENCES filaments(id) ON DELETE CASCADE
        )
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filament_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          message TEXT NOT NULL,
          is_read INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (filament_id) REFERENCES filaments(id) ON DELETE CASCADE
        )
      `);

      // Step 2: Rename old spools table to backup
      console.log('Renaming old spools table to backup...');
      db.exec(`DROP TABLE IF EXISTS spools_old_backup`);
      db.exec(`ALTER TABLE spools RENAME TO spools_old_backup`);

      // Step 3: Migrate data from old spools to new filaments
      const oldSpools = db.prepare(`
        SELECT * FROM spools_old_backup
      `).all() as any[];

      console.log(`Migrating ${oldSpools.length} spools to filaments...`);

      for (const oldSpool of oldSpools) {
        // Insert into filaments table (without weight columns)
        const insertFilament = db.prepare(`
          INSERT INTO filaments (
            id, name, material_id, color_id, manufacturer, 
            template_id, archived, notes, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertFilament.run(
          oldSpool.id,
          oldSpool.name,
          oldSpool.material_id,
          oldSpool.color_id,
          oldSpool.manufacturer,
          oldSpool.template_id,
          oldSpool.archived,
          oldSpool.notes,
          oldSpool.created_at
        );
      }

      // Step 4: Create new spools table and migrate child spool data
      console.log('Creating new spools table...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS spools (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filament_id INTEGER NOT NULL,
          starting_weight_g REAL NOT NULL,
          empty_weight_g REAL,
          weight_g REAL NOT NULL,
          archived INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (filament_id) REFERENCES filaments(id) ON DELETE CASCADE
        )
      `);

      // Create child spool entries from backup
      const insertSpool = db.prepare(`
        INSERT INTO spools (filament_id, starting_weight_g, empty_weight_g, weight_g, archived, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const oldSpool of oldSpools) {
        const now = new Date().toISOString();
        insertSpool.run(
          oldSpool.id, // filament_id (same as old spool id)
          oldSpool.starting_weight_g, // starting_weight_g
          oldSpool.empty_weight_g || null, // empty_weight_g
          oldSpool.remaining_weight_g || oldSpool.starting_weight_g, // weight_g (current weight)
          oldSpool.archived,
          oldSpool.created_at,
          now // updated_at (set to now for existing spools)
        );
      }

      // Step 5: Migrate consumption entries (change spool_id to filament_id)
      const oldConsumption = db.prepare(`
        SELECT * FROM consumption_entries
      `).all() as any[];

      console.log(`Migrating ${oldConsumption.length} consumption entries...`);

      // Drop old consumption table and recreate with new structure
      db.exec(`DROP TABLE IF EXISTS consumption_entries`);

      db.exec(`
        CREATE TABLE IF NOT EXISTS consumption_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filament_id INTEGER NOT NULL,
          amount_g REAL NOT NULL,
          amount_m REAL,
          print_name TEXT,
          type TEXT NOT NULL CHECK(type IN ('success', 'failed', 'test', 'manual')),
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (filament_id) REFERENCES filaments(id) ON DELETE CASCADE
        )
      `);

      // Re-insert consumption entries with filament_id
      const insertConsumption = db.prepare(`
        INSERT INTO consumption_entries (
          id, filament_id, amount_g, amount_m, print_name, type, notes, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const entry of oldConsumption) {
        // The spool_id in old entries corresponds to filament_id in new structure
        insertConsumption.run(
          entry.id,
          entry.spool_id, // This becomes filament_id
          entry.amount_g,
          entry.amount_m,
          entry.print_name,
          entry.type,
          entry.notes,
          entry.created_at
        );
      }

      // Step 6: Drop backup table
      console.log('Dropping old spools backup table...');
      db.exec(`DROP TABLE IF EXISTS spools_old_backup`);

      console.log('Migration completed successfully!');
    } else {
      // Old table exists but doesn't have remaining_weight_g, so it's already the new structure
      console.log('Table structure already matches new schema, ensuring all tables exist...');
      createSchema();
    }
  } else {
    // Fresh database, just create schema
    console.log('Fresh database, creating schema...');
    createSchema();
  }

  // Always seed to ensure default data exists
  seedDatabase();

  // Add updated_at column to spools if it doesn't exist (for existing databases)
  try {
    const spoolsTableInfo = db.prepare(`PRAGMA table_info(spools)`).all() as Array<{
      name: string;
    }>;
    const hasUpdatedAt = spoolsTableInfo.some(col => col.name === 'updated_at');
    
    if (!hasUpdatedAt) {
      console.log('Adding updated_at column to spools table...');
      db.exec(`ALTER TABLE spools ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'))`);
      // Update all existing spools to have updated_at = created_at
      db.exec(`UPDATE spools SET updated_at = created_at WHERE updated_at IS NULL`);
    }
  } catch (error) {
    // Table might not exist yet, which is fine
    console.log('Note: Could not check/update spools table for updated_at column:', error);
  }

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_filaments_material ON filaments(material_id);
    CREATE INDEX IF NOT EXISTS idx_filaments_color ON filaments(color_id);
    CREATE INDEX IF NOT EXISTS idx_filaments_template ON filaments(template_id);
    CREATE INDEX IF NOT EXISTS idx_filaments_archived ON filaments(archived);
    CREATE INDEX IF NOT EXISTS idx_spools_filament ON spools(filament_id);
    CREATE INDEX IF NOT EXISTS idx_spools_archived ON spools(archived);
    CREATE INDEX IF NOT EXISTS idx_consumption_filament ON consumption_entries(filament_id);
    CREATE INDEX IF NOT EXISTS idx_consumption_created ON consumption_entries(created_at);
  `);

  console.log('Database migration completed.');
}
