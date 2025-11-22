import db from '../db/database.js';
import type { ConsumptionEntry, CreateConsumptionInput, UpdateConsumptionInput } from '../types/index.js';
import { filamentRepository } from './FilamentRepository.js';
import { spoolRepository } from './SpoolRepository.js';

export class ConsumptionRepository {
  // Deduct consumption from filament's spools
  // Priority: spools that have been used (weight_g < starting_weight_g), or if all are unused, the last created one
  private deductFromFilament(filamentId: number, amountG: number): void {
    const spools = spoolRepository.findByFilamentId(filamentId, false); // Only non-archived
    if (spools.length === 0) return;

    let remaining = amountG;

    // Find spools that have been used (weight_g < starting_weight_g)
    const usedSpools = spools.filter(spool => spool.weight_g < spool.starting_weight_g);
    
    let targetSpools: typeof spools;
    if (usedSpools.length > 0) {
      // Use spools that have been used, sorted by updated_at descending (most recently used first)
      targetSpools = [...usedSpools].sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } else {
      // All spools are unused, use the last created one
      targetSpools = [...spools].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    // Deduct from the first (most recently used or last created) spool
    const targetSpool = targetSpools[0];
    if (targetSpool.weight_g >= remaining) {
      // This spool has enough, deduct and we're done
      const newWeight = Math.max(0, targetSpool.weight_g - remaining);
      spoolRepository.update({ id: targetSpool.id, weight_g: newWeight });
      remaining = 0;
    } else {
      // This spool doesn't have enough, empty it
      remaining -= targetSpool.weight_g;
      spoolRepository.update({ id: targetSpool.id, weight_g: 0 });
      
      // If there's still remaining, continue with other spools (heaviest first)
      if (remaining > 0) {
        const otherSpools = targetSpools.slice(1).sort((a, b) => b.weight_g - a.weight_g);
        for (const spool of otherSpools) {
          if (remaining <= 0) break;
          
          if (spool.weight_g >= remaining) {
            const newWeight = Math.max(0, spool.weight_g - remaining);
            spoolRepository.update({ id: spool.id, weight_g: newWeight });
            remaining = 0;
          } else {
            remaining -= spool.weight_g;
            spoolRepository.update({ id: spool.id, weight_g: 0 });
          }
        }
      }
    }
  }

  // Restore consumption to filament's spools (add to the lightest spool)
  private restoreToFilament(filamentId: number, amountG: number): void {
    const spools = spoolRepository.findByFilamentId(filamentId, false); // Only non-archived
    
    if (spools.length === 0) {
      // No spools, create a new one
        spoolRepository.create({ 
          filament_id: filamentId, 
          starting_weight_g: amountG,
          empty_weight_g: null,
          weight_g: amountG 
        });
      return;
    }

    // Sort by weight ascending, add to the lightest
    const sortedSpools = [...spools].sort((a, b) => a.weight_g - b.weight_g);
    const lightestSpool = sortedSpools[0];
    spoolRepository.update({ 
      id: lightestSpool.id, 
      weight_g: lightestSpool.weight_g + amountG 
    });
  }

  findAll(filters?: {
    filament_id?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): ConsumptionEntry[] {
    let query = `
      SELECT c.*, 
             f.id as filament_id, f.name as filament_name,
             m.id as material_id, m.name as material_name,
             col.id as color_id, col.name as color_name, col.hex as color_hex
      FROM consumption_entries c
      JOIN filaments f ON c.filament_id = f.id
      JOIN materials m ON f.material_id = m.id
      JOIN colors col ON f.color_id = col.id
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.filament_id) {
      conditions.push('c.filament_id = ?');
      params.push(filters.filament_id);
    }

    if (filters?.type) {
      conditions.push('c.type = ?');
      params.push(filters.type);
    }

    if (filters?.startDate) {
      conditions.push('c.created_at >= ?');
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      conditions.push('c.created_at <= ?');
      params.push(filters.endDate);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.created_at DESC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => {
      const filament = filamentRepository.findById(row.filament_id);
      return {
        id: row.id,
        filament_id: row.filament_id,
        amount_g: row.amount_g,
        amount_m: row.amount_m,
        print_name: row.print_name,
        type: row.type as 'success' | 'failed' | 'test' | 'manual',
        notes: row.notes,
        created_at: row.created_at,
        filament: filament || undefined
      };
    });
  }

  findById(id: number): ConsumptionEntry | null {
    const stmt = db.prepare(`
      SELECT c.*, 
             f.id as filament_id, f.name as filament_name,
             m.id as material_id, m.name as material_name,
             col.id as color_id, col.name as color_name, col.hex as color_hex
      FROM consumption_entries c
      JOIN filaments f ON c.filament_id = f.id
      JOIN materials m ON f.material_id = m.id
      JOIN colors col ON f.color_id = col.id
      WHERE c.id = ?
    `);
    const row = stmt.get(id) as any;
    if (!row) return null;

    const filament = filamentRepository.findById(row.filament_id);
    return {
      id: row.id,
      filament_id: row.filament_id,
      amount_g: row.amount_g,
      amount_m: row.amount_m,
      print_name: row.print_name,
      type: row.type as 'success' | 'failed' | 'test' | 'manual',
      notes: row.notes,
      created_at: row.created_at,
      filament: filament || undefined
    };
  }

  create(input: CreateConsumptionInput): ConsumptionEntry {
    // Create the entry
    const stmt = db.prepare(`
      INSERT INTO consumption_entries (filament_id, amount_g, amount_m, print_name, type, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      input.filament_id,
      input.amount_g,
      input.amount_m || null,
      input.print_name || null,
      input.type,
      input.notes || null
    );

    // Deduct from filament's spools
    this.deductFromFilament(input.filament_id, input.amount_g);

    return this.findById(result.lastInsertRowid as number)!;
  }

  update(input: UpdateConsumptionInput): ConsumptionEntry | null {
    const existing = this.findById(input.id);
    if (!existing) return null;

    // Calculate weight difference if amount_g changed
    const weightDiff = input.amount_g !== undefined 
      ? input.amount_g - existing.amount_g 
      : 0;

    // Update the entry
    const stmt = db.prepare(`
      UPDATE consumption_entries 
      SET filament_id = COALESCE(?, filament_id),
          amount_g = COALESCE(?, amount_g),
          amount_m = ?,
          print_name = ?,
          type = COALESCE(?, type),
          notes = ?
      WHERE id = ?
    `);
    stmt.run(
      input.filament_id || existing.filament_id,
      input.amount_g || existing.amount_g,
      input.amount_m !== undefined ? input.amount_m : existing.amount_m,
      input.print_name !== undefined ? input.print_name : existing.print_name,
      input.type || existing.type,
      input.notes !== undefined ? input.notes : existing.notes,
      input.id
    );

    // Update filament weights if amount changed or filament changed
    if (weightDiff !== 0) {
      const filamentId = input.filament_id || existing.filament_id;
      if (weightDiff > 0) {
        // More consumed, deduct
        this.deductFromFilament(filamentId, weightDiff);
      } else {
        // Less consumed, restore
        this.restoreToFilament(filamentId, -weightDiff);
      }
    }

    // If filament changed, restore old filament and deduct from new filament
    if (input.filament_id && input.filament_id !== existing.filament_id) {
      this.restoreToFilament(existing.filament_id, existing.amount_g); // Restore
      this.deductFromFilament(input.filament_id, input.amount_g!); // Deduct from new
    }

    return this.findById(input.id);
  }

  delete(id: number): boolean {
    const entry = this.findById(id);
    if (!entry) return false;

    // Restore weight to filament's spools
    this.restoreToFilament(entry.filament_id, entry.amount_g);

    // Delete the entry
    const stmt = db.prepare('DELETE FROM consumption_entries WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const consumptionRepository = new ConsumptionRepository();
