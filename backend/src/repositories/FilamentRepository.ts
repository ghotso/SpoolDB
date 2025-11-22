import db from '../db/database.js';
import type { Filament, CreateFilamentInput, UpdateFilamentInput } from '../types/index.js';
import { materialRepository } from './MaterialRepository.js';
import { colorRepository } from './ColorRepository.js';
import { templateRepository } from './TemplateRepository.js';
import { spoolRepository } from './SpoolRepository.js';

export class FilamentRepository {
  // Calculate remaining weight from sum of all non-archived spools
  private calculateRemainingWeight(filamentId: number): number {
    const stmt = db.prepare(`
      SELECT COALESCE(SUM(weight_g), 0) as total
      FROM spools
      WHERE filament_id = ? AND archived = 0
    `);
    const result = stmt.get(filamentId) as { total: number };
    return result.total;
  }

  findAll(includeArchived: boolean = false): Filament[] {
    let query = `
      SELECT f.*, 
             m.id as material_id, m.name as material_name, m.is_custom as material_is_custom,
             c.id as color_id, c.name as color_name, c.hex as color_hex, c.is_custom as color_is_custom,
             t.id as template_id, t.name as template_name
      FROM filaments f
      JOIN materials m ON f.material_id = m.id
      JOIN colors c ON f.color_id = c.id
      LEFT JOIN templates t ON f.template_id = t.id
    `;
    
    if (!includeArchived) {
      query += ' WHERE f.archived = 0';
    }
    
    query += ' ORDER BY f.created_at DESC';
    
    const stmt = db.prepare(query);
    const rows = stmt.all() as any[];
    
    return rows.map(row => {
      const filamentId = row.id;
      const remainingWeight = this.calculateRemainingWeight(filamentId);
      const spools = spoolRepository.findByFilamentId(filamentId);
      
      return {
        id: filamentId,
        name: row.name,
        material_id: row.material_id,
        color_id: row.color_id,
        manufacturer: row.manufacturer,
        template_id: row.template_id,
        archived: row.archived === 1,
        notes: row.notes,
        created_at: row.created_at,
        remaining_weight_g: remainingWeight,
        spools: spools,
        material: {
          id: row.material_id,
          name: row.material_name,
          is_custom: row.material_is_custom === 1
        },
        color: {
          id: row.color_id,
          name: row.color_name,
          hex: row.color_hex,
          is_custom: row.color_is_custom === 1
        },
        template: row.template_id ? {
          id: row.template_id,
          name: row.template_name,
          material_id: row.material_id,
          manufacturer: null,
          starting_weight_g: 0,
          empty_weight_g: null,
          notes: null
        } : undefined
      };
    });
  }

  findById(id: number): Filament | null {
    const stmt = db.prepare(`
      SELECT f.*, 
             m.id as material_id, m.name as material_name, m.is_custom as material_is_custom,
             c.id as color_id, c.name as color_name, c.hex as color_hex, c.is_custom as color_is_custom,
             t.id as template_id, t.name as template_name
      FROM filaments f
      JOIN materials m ON f.material_id = m.id
      JOIN colors c ON f.color_id = c.id
      LEFT JOIN templates t ON f.template_id = t.id
      WHERE f.id = ?
    `);
    const row = stmt.get(id) as any;
    if (!row) return null;

    const remainingWeight = this.calculateRemainingWeight(id);
    const spools = spoolRepository.findByFilamentId(id);

    return {
      id: row.id,
      name: row.name,
      material_id: row.material_id,
      color_id: row.color_id,
      manufacturer: row.manufacturer,
      template_id: row.template_id,
      archived: row.archived === 1,
      notes: row.notes,
      created_at: row.created_at,
      remaining_weight_g: remainingWeight,
      spools: spools,
      material: {
        id: row.material_id,
        name: row.material_name,
        is_custom: row.material_is_custom === 1
      },
      color: {
        id: row.color_id,
        name: row.color_name,
        hex: row.color_hex,
        is_custom: row.color_is_custom === 1
      },
      template: row.template_id ? {
        id: row.template_id,
        name: row.template_name,
        material_id: row.material_id,
        manufacturer: null,
        starting_weight_g: 0,
        empty_weight_g: null,
        notes: null
      } : undefined
    };
  }

  create(input: CreateFilamentInput): Filament {
    const stmt = db.prepare(`
      INSERT INTO filaments (name, material_id, color_id, manufacturer, template_id, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.name,
      input.material_id,
      input.color_id,
      input.manufacturer || null,
      input.template_id || null,
      input.notes || null
    );
    
    const filamentId = result.lastInsertRowid as number;
    
    // Create initial spool with starting_weight_g if provided
    if (input.starting_weight_g !== undefined) {
      spoolRepository.create({
        filament_id: filamentId,
        starting_weight_g: input.starting_weight_g,
        empty_weight_g: input.empty_weight_g || null,
        weight_g: input.starting_weight_g
      });
    }
    
    return this.findById(filamentId)!;
  }

  update(input: UpdateFilamentInput): Filament | null {
    const existing = this.findById(input.id);
    if (!existing) return null;

    const stmt = db.prepare(`
      UPDATE filaments 
      SET name = COALESCE(?, name),
          material_id = COALESCE(?, material_id),
          color_id = COALESCE(?, color_id),
          manufacturer = ?,
          template_id = ?,
          archived = COALESCE(?, archived),
          notes = ?
      WHERE id = ?
    `);
    stmt.run(
      input.name || existing.name,
      input.material_id || existing.material_id,
      input.color_id || existing.color_id,
      input.manufacturer !== undefined ? input.manufacturer : existing.manufacturer,
      input.template_id !== undefined ? input.template_id : existing.template_id,
      input.archived !== undefined ? (input.archived ? 1 : 0) : (existing.archived ? 1 : 0),
      input.notes !== undefined ? input.notes : existing.notes,
      input.id
    );

    // If filament is archived, archive all its spools
    if (input.archived === true) {
      spoolRepository.archiveByFilamentId(input.id, true);
    }

    return this.findById(input.id);
  }

  delete(id: number, force: boolean = false): boolean {
    // Check if filament has consumption entries
    const entryCheck = db.prepare('SELECT COUNT(*) as count FROM consumption_entries WHERE filament_id = ?').get(id) as { count: number };
    
    if (entryCheck.count > 0 && !force) {
      return false; // Has entries, need force delete
    }

    // If force delete, entries and spools will be deleted via CASCADE
    const stmt = db.prepare('DELETE FROM filaments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  archive(id: number, archived: boolean): Filament | null {
    const filament = this.update({ id, archived });
    // Archive all spools when filament is archived
    if (archived) {
      spoolRepository.archiveByFilamentId(id, true);
    }
    return filament;
  }

  hasConsumptionEntries(id: number): boolean {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM consumption_entries WHERE filament_id = ?');
    const result = stmt.get(id) as { count: number };
    return result.count > 0;
  }

  restock(id: number, quantity: number, weight_per_spool_g: number, empty_weight_g: number | null): Filament | null {
    const filament = this.findById(id);
    if (!filament) return null;

    // Create multiple spools with the specified quantity
    for (let i = 0; i < quantity; i++) {
      spoolRepository.create({
        filament_id: id,
        starting_weight_g: weight_per_spool_g,
        empty_weight_g: empty_weight_g,
        weight_g: weight_per_spool_g
      });
    }

    // Clear any notifications for this filament
    // Note: We'll need to implement notification clearing in a notifications repository
    // For now, just return the updated filament
    return this.findById(id);
  }
}

export const filamentRepository = new FilamentRepository();

