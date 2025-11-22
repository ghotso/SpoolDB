import db from '../db/database.js';
import type { Spool, CreateSpoolInput, UpdateSpoolInput } from '../types/index.js';

export class SpoolRepository {
  findAll(includeArchived: boolean = false): Spool[] {
    let query = `
      SELECT s.*
      FROM spools s
    `;
    
    if (!includeArchived) {
      query += ' WHERE s.archived = 0';
    }
    
    query += ' ORDER BY s.created_at DESC';
    
    const stmt = db.prepare(query);
    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      filament_id: row.filament_id,
      starting_weight_g: row.starting_weight_g,
      empty_weight_g: row.empty_weight_g,
      weight_g: row.weight_g,
      archived: row.archived === 1,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at
    }));
  }

  findByFilamentId(filamentId: number, includeArchived: boolean = false): Spool[] {
    let query = `
      SELECT s.*
      FROM spools s
      WHERE s.filament_id = ?
    `;
    
    if (!includeArchived) {
      query += ' AND s.archived = 0';
    }
    
    query += ' ORDER BY s.created_at DESC';
    
    const stmt = db.prepare(query);
    const rows = stmt.all(filamentId) as any[];
    
    return rows.map(row => ({
      id: row.id,
      filament_id: row.filament_id,
      starting_weight_g: row.starting_weight_g,
      empty_weight_g: row.empty_weight_g,
      weight_g: row.weight_g,
      archived: row.archived === 1,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at
    }));
  }

  findById(id: number): Spool | null {
    const stmt = db.prepare('SELECT * FROM spools WHERE id = ?');
    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      filament_id: row.filament_id,
      starting_weight_g: row.starting_weight_g,
      empty_weight_g: row.empty_weight_g,
      weight_g: row.weight_g,
      archived: row.archived === 1,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at
    };
  }

  create(input: CreateSpoolInput): Spool {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO spools (filament_id, starting_weight_g, empty_weight_g, weight_g, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.filament_id,
      input.starting_weight_g,
      input.empty_weight_g || null,
      input.weight_g,
      now
    );
    return this.findById(result.lastInsertRowid as number)!;
  }

  update(input: UpdateSpoolInput): Spool | null {
    const existing = this.findById(input.id);
    if (!existing) return null;

    // Calculate the new weight and empty weight
    const newWeight = input.weight_g !== undefined ? input.weight_g : existing.weight_g;
    const newEmptyWeight = input.empty_weight_g !== undefined ? input.empty_weight_g : existing.empty_weight_g;
    
    // Calculate remaining weight (weight_g - empty_weight_g)
    const remainingWeight = newWeight - (newEmptyWeight || 0);
    
    // Auto-archive if remaining weight is 0g or less
    const shouldArchive = remainingWeight <= 0;
    const archived = input.archived !== undefined 
      ? input.archived 
      : (shouldArchive ? true : existing.archived);

    const now = new Date().toISOString();
    const stmt = db.prepare(`
      UPDATE spools 
      SET starting_weight_g = COALESCE(?, starting_weight_g),
          empty_weight_g = ?,
          weight_g = COALESCE(?, weight_g),
          archived = ?,
          updated_at = ?
      WHERE id = ?
    `);
    stmt.run(
      input.starting_weight_g !== undefined ? input.starting_weight_g : existing.starting_weight_g,
      newEmptyWeight,
      newWeight,
      archived ? 1 : 0,
      now,
      input.id
    );
    return this.findById(input.id);
  }

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM spools WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  archive(id: number, archived: boolean): Spool | null {
    return this.update({ id, archived });
  }

  archiveByFilamentId(filamentId: number, archived: boolean): void {
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE spools SET archived = ?, updated_at = ? WHERE filament_id = ?');
    stmt.run(archived ? 1 : 0, now, filamentId);
  }
}

export const spoolRepository = new SpoolRepository();
