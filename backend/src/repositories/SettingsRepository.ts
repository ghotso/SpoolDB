import db from '../db/database.js';

export class SettingsRepository {
  get(key: string, defaultValue: string = ''): string {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key) as { value: string } | undefined;
    return result?.value || defaultValue;
  }

  set(key: string, value: string): void {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) 
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = ?
    `);
    stmt.run(key, value, value);
  }

  getAll(): Record<string, string> {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as Array<{ key: string; value: string }>;
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
  }
}

export const settingsRepository = new SettingsRepository();

