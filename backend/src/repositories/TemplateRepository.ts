import db from '../db/database.js';
import type { Template, CreateTemplateInput, UpdateTemplateInput } from '../types/index.js';
import { materialRepository } from './MaterialRepository.js';

export class TemplateRepository {
  findAll(): Template[] {
    const stmt = db.prepare(`
      SELECT t.*, m.id as material_id, m.name as material_name, m.is_custom as material_is_custom
      FROM templates t
      JOIN materials m ON t.material_id = m.id
      ORDER BY t.name ASC
    `);
    const rows = stmt.all() as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      material_id: row.material_id,
      manufacturer: row.manufacturer,
      starting_weight_g: row.starting_weight_g,
      empty_weight_g: row.empty_weight_g,
      notes: row.notes,
      material: {
        id: row.material_id,
        name: row.material_name,
        is_custom: row.material_is_custom === 1
      }
    }));
  }

  findById(id: number): Template | null {
    const stmt = db.prepare(`
      SELECT t.*, m.id as material_id, m.name as material_name, m.is_custom as material_is_custom
      FROM templates t
      JOIN materials m ON t.material_id = m.id
      WHERE t.id = ?
    `);
    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      material_id: row.material_id,
      manufacturer: row.manufacturer,
      starting_weight_g: row.starting_weight_g,
      empty_weight_g: row.empty_weight_g,
      notes: row.notes,
      material: {
        id: row.material_id,
        name: row.material_name,
        is_custom: row.material_is_custom === 1
      }
    };
  }

  findByName(name: string): Template | null {
    const stmt = db.prepare('SELECT * FROM templates WHERE name = ?');
    const result = stmt.get(name) as Template | undefined;
    return result || null;
  }

  create(input: CreateTemplateInput): Template {
    const stmt = db.prepare(`
      INSERT INTO templates (name, material_id, manufacturer, starting_weight_g, empty_weight_g, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.name,
      input.material_id,
      input.manufacturer || null,
      input.starting_weight_g,
      input.empty_weight_g || null,
      input.notes || null
    );
    return this.findById(result.lastInsertRowid as number)!;
  }

  update(input: UpdateTemplateInput): Template | null {
    const existing = this.findById(input.id);
    if (!existing) return null;

    const stmt = db.prepare(`
      UPDATE templates 
      SET name = COALESCE(?, name),
          material_id = COALESCE(?, material_id),
          manufacturer = ?,
          starting_weight_g = COALESCE(?, starting_weight_g),
          empty_weight_g = ?,
          notes = ?
      WHERE id = ?
    `);
    stmt.run(
      input.name || existing.name,
      input.material_id || existing.material_id,
      input.manufacturer !== undefined ? input.manufacturer : existing.manufacturer,
      input.starting_weight_g || existing.starting_weight_g,
      input.empty_weight_g !== undefined ? input.empty_weight_g : existing.empty_weight_g,
      input.notes !== undefined ? input.notes : existing.notes,
      input.id
    );
    return this.findById(input.id);
  }

  delete(id: number): boolean {
    // Check if template is in use
    const spoolCheck = db.prepare('SELECT COUNT(*) as count FROM spools WHERE template_id = ?').get(id) as { count: number };
    
    if (spoolCheck.count > 0) {
      return false; // Template is in use
    }

    const stmt = db.prepare('DELETE FROM templates WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  isInUse(id: number): boolean {
    const spoolCheck = db.prepare('SELECT COUNT(*) as count FROM spools WHERE template_id = ?').get(id) as { count: number };
    return spoolCheck.count > 0;
  }
}

export const templateRepository = new TemplateRepository();

