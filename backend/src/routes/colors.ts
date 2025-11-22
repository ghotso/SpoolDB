import { Router } from 'express';
import { colorRepository } from '../repositories/ColorRepository.js';
import db from '../db/database.js';
import type { Color } from '../types/index.js';
import { z } from 'zod';

const router = Router();

const createColorSchema = z.object({
  name: z.string().min(1).max(255),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable()
});

const updateColorSchema = z.object({
  name: z.string().min(1).max(255),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable()
});

/**
 * @swagger
 * /api/colors:
 *   get:
 *     summary: Get all colors
 *     tags: [Colors]
 *     responses:
 *       200:
 *         description: List of colors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Color'
 *       500:
 *         description: Server error
 */
// GET /api/colors
router.get('/', (req, res) => {
  try {
    const colors = colorRepository.findAll();
    res.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({ error: 'Failed to fetch colors' });
  }
});

/**
 * @swagger
 * /api/colors/most-used:
 *   get:
 *     summary: Get most used colors
 *     tags: [Colors]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Maximum number of colors to return
 *     responses:
 *       200:
 *         description: List of most used colors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Color'
 *       500:
 *         description: Server error
 */
// GET /api/colors/most-used (must be before /:id route)
router.get('/most-used', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 15;
    const stmt = db.prepare(`
      SELECT c.id, c.name, c.hex, c.is_custom, COUNT(s.id) as usage_count
      FROM colors c
      INNER JOIN spools s ON c.id = s.color_id
      WHERE c.hex IS NOT NULL
      GROUP BY c.id, c.name, c.hex, c.is_custom
      ORDER BY usage_count DESC, c.name ASC
      LIMIT ?
    `);
    const colors = stmt.all(limit) as Array<Color & { usage_count: number }>;
    res.json(colors.map(c => ({ id: c.id, name: c.name, hex: c.hex, is_custom: c.is_custom })));
  } catch (error) {
    console.error('Error fetching most used colors:', error);
    res.status(500).json({ error: 'Failed to fetch most used colors' });
  }
});

/**
 * @swagger
 * /api/colors/{id}:
 *   get:
 *     summary: Get a color by ID
 *     tags: [Colors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Color ID
 *     responses:
 *       200:
 *         description: Color details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Color'
 *       400:
 *         description: Invalid color ID
 *       404:
 *         description: Color not found
 *       500:
 *         description: Server error
 */
// GET /api/colors/:id
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid color ID' });
    }

    const color = colorRepository.findById(id);
    if (!color) {
      return res.status(404).json({ error: 'Color not found' });
    }

    res.json(color);
  } catch (error) {
    console.error('Error fetching color:', error);
    res.status(500).json({ error: 'Failed to fetch color' });
  }
});

/**
 * @swagger
 * /api/colors:
 *   post:
 *     summary: Create a new color
 *     tags: [Colors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "#FF5733"
 *               hex:
 *                 type: string
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *                 nullable: true
 *                 example: "#FF5733"
 *     responses:
 *       201:
 *         description: Color created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Color'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Color with this name already exists
 *       500:
 *         description: Server error
 */
// POST /api/colors
router.post('/', (req, res) => {
  try {
    const validated = createColorSchema.parse(req.body);
    
    // Check if color already exists
    const existing = colorRepository.findByName(validated.name);
    if (existing) {
      return res.status(409).json({ error: 'Color with this name already exists' });
    }

    const color = colorRepository.create(validated);
    res.status(201).json(color);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating color:', error);
    res.status(500).json({ error: 'Failed to create color' });
  }
});

/**
 * @swagger
 * /api/colors/{id}:
 *   put:
 *     summary: Update a color
 *     tags: [Colors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Color ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "#FF5733"
 *               hex:
 *                 type: string
 *                 pattern: "^#[0-9A-Fa-f]{6}$"
 *                 nullable: true
 *                 example: "#FF5733"
 *     responses:
 *       200:
 *         description: Color updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Color'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Color not found
 *       409:
 *         description: Color with this name already exists
 *       500:
 *         description: Server error
 */
// PUT /api/colors/:id
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid color ID' });
    }

    const validated = updateColorSchema.parse(req.body);
    
    // Check if color exists
    const existing = colorRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Color not found' });
    }

    // Check if name is already taken by another color
    const nameExists = colorRepository.findByName(validated.name);
    if (nameExists && nameExists.id !== id) {
      return res.status(409).json({ error: 'Color with this name already exists' });
    }

    const color = colorRepository.update(id, validated.name, validated.hex);
    res.json(color);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating color:', error);
    res.status(500).json({ error: 'Failed to update color' });
  }
});

/**
 * @swagger
 * /api/colors/{id}:
 *   delete:
 *     summary: Delete a color
 *     tags: [Colors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Color ID
 *     responses:
 *       204:
 *         description: Color deleted successfully
 *       400:
 *         description: Invalid color ID
 *       403:
 *         description: Cannot delete predefined color
 *       404:
 *         description: Color not found
 *       409:
 *         description: Color is in use and cannot be deleted
 *       500:
 *         description: Server error
 */
// DELETE /api/colors/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid color ID' });
    }

    const color = colorRepository.findById(id);
    if (!color) {
      return res.status(404).json({ error: 'Color not found' });
    }

    if (!color.is_custom) {
      return res.status(403).json({ error: 'Cannot delete predefined color' });
    }

    if (colorRepository.isInUse(id)) {
      return res.status(409).json({ error: 'Color is in use and cannot be deleted' });
    }

    const deleted = colorRepository.delete(id);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete color' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting color:', error);
    res.status(500).json({ error: 'Failed to delete color' });
  }
});

export default router;
