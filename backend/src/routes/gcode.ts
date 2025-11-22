import { Router } from 'express';
import multer from 'multer';
import { parseGCode } from '../utils/gcodeParser.js';
import { z } from 'zod';
import db from '../db/database.js';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept .gcode files
    if (file.mimetype === 'text/plain' || file.originalname.toLowerCase().endsWith('.gcode')) {
      cb(null, true);
    } else {
      cb(new Error('Only .gcode files are allowed'));
    }
  },
});

const uploadGCodeSchema = z.object({
  filament_id: z.number().int().positive(),
  type: z.enum(['success', 'failed', 'test', 'manual']).optional().default('success'),
});

/**
 * @swagger
 * /api/gcode/parse:
 *   post:
 *     summary: Parse G-code file and return metadata with suggested filament matches
 *     tags: [Consumption]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: G-code file to parse
 *     responses:
 *       200:
 *         description: G-code parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 metadata:
 *                   type: object
 *                   description: Parsed G-code metadata
 *                 suggestedFilaments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Filament'
 *                   description: Suggested filaments based on material and color
 *       400:
 *         description: Invalid file or parsing error
 *       500:
 *         description: Server error
 */
router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file size (limit to 10MB to prevent DoS)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (req.file.buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB' });
    }

    // Parse G-code file
    const fileContent = req.file.buffer.toString('utf-8');
    const parsed = parseGCode(fileContent);

    if (!parsed.success) {
      return res.status(400).json({ 
        error: parsed.error || 'Failed to parse G-code',
        metadata: parsed.metadata,
      });
    }

    // Try to match filaments based on material and color
    const suggestedFilaments = await findMatchingFilaments(parsed.metadata);

    res.json({
      metadata: parsed.metadata,
      suggestedFilaments,
    });
  } catch (error) {
    console.error('Error parsing G-code:', error);
    res.status(500).json({ error: 'Failed to parse G-code file' });
  }
});

/**
 * Find matching filaments based on G-code metadata
 */
async function findMatchingFilaments(metadata: any) {
  const { materialType, color } = metadata;
  
  if (!materialType) {
    return [];
  }

  // First, try to find material by name (case-insensitive)
  const materialStmt = db.prepare(`
    SELECT id, name, is_custom FROM materials 
    WHERE LOWER(name) = LOWER(?)
  `);
  const material = materialStmt.get(materialType) as { id: number; name: string; is_custom: number } | undefined;

  if (!material) {
    return [];
  }

  // Find filaments with matching material that are not archived
  // Calculate remaining weight from sum of spools
  let filamentStmt;
  let filaments: any[] = [];

  if (color) {
    // Try to match by material and color hex
    filamentStmt = db.prepare(`
      SELECT f.*, 
             m.id as material_id, m.name as material_name, m.is_custom as material_is_custom,
             c.id as color_id, c.name as color_name, c.hex as color_hex, c.is_custom as color_is_custom,
             COALESCE(SUM(CASE WHEN s.archived = 0 THEN s.weight_g ELSE 0 END), 0) as remaining_weight_g
      FROM filaments f
      INNER JOIN materials m ON f.material_id = m.id
      LEFT JOIN colors c ON f.color_id = c.id
      LEFT JOIN spools s ON f.id = s.filament_id
      WHERE f.material_id = ? 
        AND f.archived = 0
        AND c.hex = ?
      GROUP BY f.id
      HAVING remaining_weight_g > 0
      ORDER BY remaining_weight_g DESC
    `);
    filaments = filamentStmt.all(material.id, color) as any[];
  }

  // If no color match or no color in metadata, just match by material
  if (!filaments || filaments.length === 0) {
    filamentStmt = db.prepare(`
      SELECT f.*, 
             m.id as material_id, m.name as material_name, m.is_custom as material_is_custom,
             c.id as color_id, c.name as color_name, c.hex as color_hex, c.is_custom as color_is_custom,
             COALESCE(SUM(CASE WHEN s.archived = 0 THEN s.weight_g ELSE 0 END), 0) as remaining_weight_g
      FROM filaments f
      INNER JOIN materials m ON f.material_id = m.id
      LEFT JOIN colors c ON f.color_id = c.id
      LEFT JOIN spools s ON f.id = s.filament_id
      WHERE f.material_id = ? 
        AND f.archived = 0
      GROUP BY f.id
      HAVING remaining_weight_g > 0
      ORDER BY remaining_weight_g DESC
    `);
    filaments = filamentStmt.all(material.id) as any[];
  }

  // Format filaments to match Filament type
  return (filaments || []).map(row => ({
    id: row.id,
    name: row.name,
    material_id: row.material_id,
    color_id: row.color_id,
    manufacturer: row.manufacturer,
    starting_weight_g: row.starting_weight_g,
    empty_weight_g: row.empty_weight_g,
    template_id: row.template_id,
    archived: row.archived === 1,
    notes: row.notes,
    created_at: row.created_at,
    remaining_weight_g: row.remaining_weight_g,
    material: {
      id: row.material_id,
      name: row.material_name,
      is_custom: row.material_is_custom === 1,
    },
    color: {
      id: row.color_id,
      name: row.color_name,
      hex: row.color_hex,
      is_custom: row.color_is_custom === 1,
    },
  }));
}

/**
 * @swagger
 * /api/gcode/upload:
 *   post:
 *     summary: Upload and parse G-code file to create consumption entry
 *     tags: [Consumption]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - filament_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: G-code file to upload
 *               filament_id:
 *                 type: integer
 *                 description: Filament ID to associate consumption with
 *               type:
 *                 type: string
 *                 enum: [success, failed, test, manual]
 *                 default: success
 *                 description: Consumption type
 *     responses:
 *       201:
 *         description: Consumption entry created successfully from G-code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 consumption:
 *                   $ref: '#/components/schemas/ConsumptionEntry'
 *                 metadata:
 *                   type: object
 *                   description: Parsed G-code metadata
 *       400:
 *         description: Invalid file or parsing error
 *       404:
 *         description: Filament not found
 *       500:
 *         description: Server error
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file size (limit to 10MB to prevent DoS)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (req.file.buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB' });
    }

    // Validate request body
    const body = uploadGCodeSchema.parse({
      filament_id: parseInt(req.body.filament_id),
      type: req.body.type || 'success',
    });

    // Parse G-code file
    const fileContent = req.file.buffer.toString('utf-8');
    const parsed = parseGCode(fileContent);

    if (!parsed.success) {
      return res.status(400).json({ 
        error: parsed.error || 'Failed to parse G-code',
        metadata: parsed.metadata,
      });
    }

    // Check if we have required data
    if (!parsed.metadata.usedFilamentG && !parsed.metadata.usedFilamentM) {
      return res.status(400).json({ 
        error: 'Could not extract filament usage from G-code',
        metadata: parsed.metadata,
      });
    }

    // Import consumption and filament repositories
    const { consumptionRepository } = await import('../repositories/ConsumptionRepository.js');
    const { filamentRepository } = await import('../repositories/FilamentRepository.js');

    // Verify filament exists
    const filament = filamentRepository.findById(body.filament_id);
    if (!filament) {
      return res.status(404).json({ error: 'Filament not found' });
    }

    // Use grams if available, otherwise calculate from meters
    let amountG = parsed.metadata.usedFilamentG;
    if (!amountG && parsed.metadata.usedFilamentM) {
      // Fallback: estimate using standard PLA density (1.24 g/cm³) and 1.75mm diameter
      const radiusCm = (1.75 / 10) / 2;
      const volumeCm3 = Math.PI * radiusCm * radiusCm * (parsed.metadata.usedFilamentM * 100);
      amountG = volumeCm3 * 1.24; // Standard PLA density
    }

    if (!amountG || amountG <= 0) {
      return res.status(400).json({ 
        error: 'Could not calculate filament weight from G-code',
        metadata: parsed.metadata,
      });
    }

    // Check if filament has enough remaining weight
    const remainingWeight = filament.remaining_weight_g || 0;
    if (remainingWeight < amountG) {
      return res.status(400).json({ 
        error: 'Insufficient filament remaining',
        remaining: remainingWeight,
        requested: amountG,
        metadata: parsed.metadata,
      });
    }

    // Create consumption entry
    const consumption = consumptionRepository.create({
      filament_id: body.filament_id,
      amount_g: amountG,
      amount_m: parsed.metadata.usedFilamentM,
      print_name: parsed.metadata.modelName || null,
      type: body.type,
      notes: parsed.metadata.printTime 
        ? `G-code upload from ${parsed.metadata.slicer}. Print time: ${parsed.metadata.printTime}`
        : `G-code upload from ${parsed.metadata.slicer}`,
    });

    res.status(201).json({
      consumption,
      metadata: parsed.metadata,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error processing G-code upload:', error);
    res.status(500).json({ error: 'Failed to process G-code file' });
  }
});

export default router;

