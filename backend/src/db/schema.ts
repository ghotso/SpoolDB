import db from './database.js';

export function createSchema() {
  // Materials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      is_custom INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Colors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      hex TEXT,
      is_custom INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Templates table
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

  // Filaments table (previously spools)
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

  // Spools table (child of filaments)
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

  // Consumption entries table
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

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Create indexes for better query performance
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
}

