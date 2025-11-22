import { Router } from 'express';
import { filamentRepository } from '../repositories/FilamentRepository.js';
import { materialRepository } from '../repositories/MaterialRepository.js';
import { colorRepository } from '../repositories/ColorRepository.js';
import { z } from 'zod';

const router = Router();

const createFilamentSchema = z.object({
  name: z.string().min(1).max(255),
  material_id: z.number().int().positive(),
  color_id: z.number().int().positive(),
  manufacturer: z.string().max(255).optional().nullable(),
  template_id: z.number().int().positive().optional().nullable(),
  notes: z.string().optional().nullable(),
  // Optional: when creating a filament, also create initial spool with these weights
  starting_weight_g: z.number().positive().optional(),
  empty_weight_g: z.number().nonnegative().optional().nullable()
});

const updateFilamentSchema = createFilamentSchema.partial().extend({
  id: z.number().int().positive(),
  archived: z.boolean().optional()
});

/**
 * @swagger
 * /api/filaments:
 *   get:
 *     summary: Get all filaments
 *     tags: [Filaments]
 *     parameters:
 *       - in: query
 *         name: archived
 *         schema:
 *           type: boolean
 *         description: Include archived filaments
 *     responses:
 *       200:
 *         description: List of filaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Filament'
 *       500:
 *         description: Server error
 */
// GET /api/filaments
router.get('/', (req, res) => {
  try {
    const includeArchived = req.query.archived === 'true';
    const filaments = filamentRepository.findAll(includeArchived);
    res.json(filaments);
  } catch (error) {
    console.error('Error fetching filaments:', error);
    res.status(500).json({ error: 'Failed to fetch filaments' });
  }
});

/**
 * @swagger
 * /api/filaments/{id}:
 *   get:
 *     summary: Get a filament by ID
 *     tags: [Filaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filament ID
 *     responses:
 *       200:
 *         description: Filament details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Filament'
 *       400:
 *         description: Invalid filament ID
 *       404:
 *         description: Filament not found
 *       500:
 *         description: Server error
 */
// GET /api/filaments/:id
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid filament ID' });
    }

    const filament = filamentRepository.findById(id);
    if (!filament) {
      return res.status(404).json({ error: 'Filament not found' });
    }

    res.json(filament);
  } catch (error) {
    console.error('Error fetching filament:', error);
    res.status(500).json({ error: 'Failed to fetch filament' });
  }
});

/**
 * @swagger
 * /api/filaments:
 *   post:
 *     summary: Create a new filament
 *     tags: [Filaments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - material_id
 *               - color_id
 *               - starting_weight_g
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "PLA Red"
 *               material_id:
 *                 type: integer
 *                 example: 1
 *               color_id:
 *                 type: integer
 *                 example: 1
 *               manufacturer:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 example: "Polymaker"
 *               starting_weight_g:
 *                 type: number
 *                 minimum: 0
 *                 example: 1000
 *               empty_weight_g:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 example: 250
 *               template_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *               notes:
 *                 type: string
 *                 nullable: true
 *                 example: "High quality PLA"
 *     responses:
 *       201:
 *         description: Filament created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Filament'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Material or color not found
 *       500:
 *         description: Server error
 */
// POST /api/filaments
router.post('/', (req, res) => {
  try {
    const validated = createFilamentSchema.parse(req.body);
    
    // Verify material exists
    const material = materialRepository.findById(validated.material_id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Verify color exists
    const color = colorRepository.findById(validated.color_id);
    if (!color) {
      return res.status(404).json({ error: 'Color not found' });
    }

    const filament = filamentRepository.create(validated);
    res.status(201).json(filament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating filament:', error);
    res.status(500).json({ error: 'Failed to create filament' });
  }
});

/**
 * @swagger
 * /api/filaments/{id}:
 *   put:
 *     summary: Update a filament
 *     tags: [Filaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               material_id:
 *                 type: integer
 *               color_id:
 *                 type: integer
 *               manufacturer:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *               starting_weight_g:
 *                 type: number
 *                 minimum: 0
 *               empty_weight_g:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *               template_id:
 *                 type: integer
 *                 nullable: true
 *               archived:
 *                 type: boolean
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Filament updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Filament'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Filament, material, or color not found
 *       500:
 *         description: Server error
 */
// PUT /api/filaments/:id
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid filament ID' });
    }

    const validated = updateFilamentSchema.parse({ ...req.body, id });
    
    // Check if filament exists
    const existing = filamentRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Filament not found' });
    }

    // Verify material exists if provided
    if (validated.material_id) {
      const material = materialRepository.findById(validated.material_id);
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
    }

    // Verify color exists if provided
    if (validated.color_id) {
      const color = colorRepository.findById(validated.color_id);
      if (!color) {
        return res.status(404).json({ error: 'Color not found' });
      }
    }

    const filament = filamentRepository.update(validated);
    res.json(filament);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating filament:', error);
    res.status(500).json({ error: 'Failed to update filament' });
  }
});

/**
 * @swagger
 * /api/filaments/{id}:
 *   delete:
 *     summary: Delete a filament
 *     tags: [Filaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filament ID
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *         description: Force delete even if filament has consumption entries
 *     responses:
 *       204:
 *         description: Filament deleted successfully
 *       400:
 *         description: Invalid filament ID
 *       404:
 *         description: Filament not found
 *       409:
 *         description: Filament has consumption entries (use force=true to delete)
 *       500:
 *         description: Server error
 */
// DELETE /api/filaments/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid filament ID' });
    }

    const filament = filamentRepository.findById(id);
    if (!filament) {
      return res.status(404).json({ error: 'Filament not found' });
    }

    const force = req.query.force === 'true';
    const hasEntries = filamentRepository.hasConsumptionEntries(id);

    if (hasEntries && !force) {
      return res.status(409).json({ 
        error: 'Filament has consumption entries. Use force=true to delete.',
        hasEntries: true
      });
    }

    const deleted = filamentRepository.delete(id, force);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete filament' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting filament:', error);
    res.status(500).json({ error: 'Failed to delete filament' });
  }
});

/**
 * @swagger
 * /api/filaments/{id}/archive:
 *   patch:
 *     summary: Archive or unarchive a filament
 *     tags: [Filaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - archived
 *             properties:
 *               archived:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Filament archived/unarchived successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Filament'
 *       400:
 *         description: Invalid filament ID or invalid request body
 *       404:
 *         description: Filament not found
 *       500:
 *         description: Server error
 */
// PATCH /api/filaments/:id/archive
router.patch('/:id/archive', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid filament ID' });
    }

    const { archived } = req.body;
    if (typeof archived !== 'boolean') {
      return res.status(400).json({ error: 'archived must be a boolean' });
    }

    const filament = filamentRepository.archive(id, archived);
    if (!filament) {
      return res.status(404).json({ error: 'Filament not found' });
    }

    res.json(filament);
  } catch (error) {
    console.error('Error archiving filament:', error);
    res.status(500).json({ error: 'Failed to archive filament' });
  }
});

/**
 * @swagger
 * /api/filaments/{id}/restock:
 *   post:
 *     summary: Restock a filament by adding a new spool
 *     tags: [Filaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Filament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - weight_per_spool_g
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               weight_per_spool_g:
 *                 type: number
 *                 minimum: 0
 *                 example: 1000
 *               empty_weight_g:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 example: 250
 *     responses:
 *       200:
 *         description: Filament restocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Filament'
 *       400:
 *         description: Invalid filament ID or invalid restock amount
 *       404:
 *         description: Filament not found
 *       500:
 *         description: Server error
 */
// POST /api/filaments/:id/restock
router.post('/:id/restock', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid filament ID' });
    }

    const { quantity, weight_per_spool_g, empty_weight_g } = req.body;
    if (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: 'Invalid quantity. Must be a positive integer.' });
    }
    if (typeof weight_per_spool_g !== 'number' || weight_per_spool_g <= 0) {
      return res.status(400).json({ error: 'Invalid weight per spool. Must be a positive number.' });
    }
    if (empty_weight_g !== undefined && empty_weight_g !== null && (typeof empty_weight_g !== 'number' || empty_weight_g < 0)) {
      return res.status(400).json({ error: 'Invalid empty weight. Must be a non-negative number or null.' });
    }

    const updatedFilament = filamentRepository.restock(id, quantity, weight_per_spool_g, empty_weight_g || null);
    if (!updatedFilament) {
      return res.status(404).json({ error: 'Filament not found' });
    }

    res.json(updatedFilament);
  } catch (error) {
    console.error('Error restocking filament:', error);
    res.status(500).json({ error: 'Failed to restock filament' });
  }
});

export default router;

