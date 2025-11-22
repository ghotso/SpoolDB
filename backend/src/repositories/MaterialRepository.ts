import db from '../db/database.js';
import type { Material, CreateMaterialInput } from '../types/index.js';

export class MaterialRepository {
  findAll(): Material[] {
    const stmt = db.prepare('SELECT * FROM materials ORDER BY is_custom ASC, name ASC');
    return stmt.all() as Material[];
  }

  findById(id: number): Material | null {
    const stmt = db.prepare('SELECT * FROM materials WHERE id = ?');
    const result = stmt.get(id) as Material | undefined;
    return result || null;
  }

  findByName(name: string): Material | null {
    const stmt = db.prepare('SELECT * FROM materials WHERE name = ?');
    const result = stmt.get(name) as Material | undefined;
    return result || null;
  }

  create(input: CreateMaterialInput): Material {
    const stmt = db.prepare('INSERT INTO materials (name, is_custom) VALUES (?, 1)');
    const result = stmt.run(input.name);
    return this.findById(result.lastInsertRowid as number)!;
  }

  update(id: number, name: string): Material | null {
    const stmt = db.prepare('UPDATE materials SET name = ? WHERE id = ?');
    stmt.run(name, id);
    return this.findById(id);
  }

  delete(id: number): boolean {
    // Check if material is in use
    const spoolCheck = db.prepare('SELECT COUNT(*) as count FROM spools WHERE material_id = ?').get(id) as { count: number };
    const templateCheck = db.prepare('SELECT COUNT(*) as count FROM templates WHERE material_id = ?').get(id) as { count: number };
    
    if (spoolCheck.count > 0 || templateCheck.count > 0) {
      return false; // Material is in use
    }

    // Only allow deletion of custom materials
    const material = this.findById(id);
    if (!material || !material.is_custom) {
      return false;
    }

    const stmt = db.prepare('DELETE FROM materials WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  isInUse(id: number): boolean {
    const spoolCheck = db.prepare('SELECT COUNT(*) as count FROM spools WHERE material_id = ?').get(id) as { count: number };
    const templateCheck = db.prepare('SELECT COUNT(*) as count FROM templates WHERE material_id = ?').get(id) as { count: number };
    return spoolCheck.count > 0 || templateCheck.count > 0;
  }
}

export const materialRepository = new MaterialRepository();

