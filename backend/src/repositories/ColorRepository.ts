import db from '../db/database.js';
import type { Color, CreateColorInput } from '../types/index.js';

export class ColorRepository {
  findAll(): Color[] {
    const stmt = db.prepare('SELECT * FROM colors ORDER BY is_custom ASC, name ASC');
    return stmt.all() as Color[];
  }

  findById(id: number): Color | null {
    const stmt = db.prepare('SELECT * FROM colors WHERE id = ?');
    const result = stmt.get(id) as Color | undefined;
    return result || null;
  }

  findByName(name: string): Color | null {
    const stmt = db.prepare('SELECT * FROM colors WHERE name = ?');
    const result = stmt.get(name) as Color | undefined;
    return result || null;
  }

  create(input: CreateColorInput): Color {
    const stmt = db.prepare('INSERT INTO colors (name, hex, is_custom) VALUES (?, ?, 1)');
    const result = stmt.run(input.name, input.hex || null);
    return this.findById(result.lastInsertRowid as number)!;
  }

  update(id: number, name: string, hex?: string | null): Color | null {
    const stmt = db.prepare('UPDATE colors SET name = ?, hex = ? WHERE id = ?');
    stmt.run(name, hex || null, id);
    return this.findById(id);
  }

  delete(id: number): boolean {
    // Check if color is in use
    const spoolCheck = db.prepare('SELECT COUNT(*) as count FROM spools WHERE color_id = ?').get(id) as { count: number };
    
    if (spoolCheck.count > 0) {
      return false; // Color is in use
    }

    // Only allow deletion of custom colors
    const color = this.findById(id);
    if (!color || !color.is_custom) {
      return false;
    }

    const stmt = db.prepare('DELETE FROM colors WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  isInUse(id: number): boolean {
    const spoolCheck = db.prepare('SELECT COUNT(*) as count FROM spools WHERE color_id = ?').get(id) as { count: number };
    return spoolCheck.count > 0;
  }
}

export const colorRepository = new ColorRepository();

