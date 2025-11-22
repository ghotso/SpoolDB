import db from './database.js';

export function seedDatabase() {
  // Seed default settings
  const settingsStmt = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) 
    VALUES ('restock_threshold_g', '100')
  `);
  settingsStmt.run();
  // Check if already seeded
  const materialCount = db.prepare('SELECT COUNT(*) as count FROM materials').get() as { count: number };
  if (materialCount.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  const insertMaterial = db.prepare('INSERT INTO materials (name, is_custom) VALUES (?, ?)');
  const insertColor = db.prepare('INSERT INTO colors (name, hex, is_custom) VALUES (?, ?, ?)');

  // Predefined materials
  const materials = [
    'PLA',
    'PETG',
    'ABS',
    'TPU',
    'ASA',
    'PC',
    'Nylon',
    'Wood',
    'Metal',
    'Carbon Fiber'
  ];

  materials.forEach(name => {
    insertMaterial.run(name, 0);
  });

  // Predefined colors with HEX values
  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#00FF00' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Magenta', hex: '#FF00FF' }
  ];

  colors.forEach(({ name, hex }) => {
    insertColor.run(name, hex, 0);
  });

  console.log('Database seeded successfully');
}

