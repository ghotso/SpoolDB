import { Router } from 'express';
import { spoolRepository } from '../repositories/SpoolRepository.js';
import { filamentRepository } from '../repositories/FilamentRepository.js';
import { z } from 'zod';

const router = Router();

const createSpoolSchema = z.object({
  filament_id: z.number().int().positive(),
  starting_weight_g: z.number().positive(),
  empty_weight_g: z.number().nonnegative().optional().nullable(),
  weight_g: z.number().positive(),
  archived: z.boolean().optional().default(false)
});

const updateSpoolSchema = z.object({
  id: z.number().int().positive(),
  starting_weight_g: z.number().positive().optional(),
  empty_weight_g: z.number().nonnegative().optional().nullable(),
  weight_g: z.number().positive().optional(),
  archived: z.boolean().optional()
});

/**
 * @swagger
 * /api/spools:
 *   get:
 *     summary: Get all child spools
 *     tags: [Spools]
 *     parameters:
 *       - in: query
 *         name: filament_id
 *         schema:
 *           type: integer
 *         description: Filter by filament ID
 *       - in: query
 *         name: archived
 *         schema:
 *           type: boolean
 *         description: Include archived spools
 *     responses:
 *       200:
 *         description: List of child spools
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Spool'
 *       500:
 *         description: Server error
 */
// GET /api/spools
router.get('/', (req, res) => {
  try {
    const includeArchived = req.query.archived === 'true';
    const filamentId = req.query.filament_id ? parseInt(req.query.filament_id as string) : undefined;
    
    let spools;
    if (filamentId) {
      spools = spoolRepository.findByFilamentId(filamentId, includeArchived);
    } else {
      spools = spoolRepository.findAll(includeArchived);
    }
    
    res.json(spools);
  } catch (error) {
    console.error('Error fetching spools:', error);
    res.status(500).json({ error: 'Failed to fetch spools' });
  }
});

/**
 * @swagger
 * /api/spools/{id}:
 *   get:
 *     summary: Get a child spool by ID
 *     tags: [Spools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Spool ID
 *     responses:
 *       200:
 *         description: Spool details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Spool'
 *       400:
 *         description: Invalid spool ID
 *       404:
 *         description: Spool not found
 *       500:
 *         description: Server error
 */
// GET /api/spools/:id
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid spool ID' });
    }

    const spool = spoolRepository.findById(id);
    if (!spool) {
      return res.status(404).json({ error: 'Spool not found' });
    }

    res.json(spool);
  } catch (error) {
    console.error('Error fetching spool:', error);
    res.status(500).json({ error: 'Failed to fetch spool' });
  }
});

/**
 * @swagger
 * /api/spools:
 *   post:
 *     summary: Create a new child spool
 *     tags: [Spools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filament_id
 *               - starting_weight_g
 *               - weight_g
 *             properties:
 *               filament_id:
 *                 type: integer
 *                 example: 1
 *               starting_weight_g:
 *                 type: number
 *                 minimum: 0
 *                 example: 1000
 *               empty_weight_g:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 example: 250
 *               weight_g:
 *                 type: number
 *                 minimum: 0
 *                 example: 750
 *               archived:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Spool created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Spool'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Filament not found
 *       500:
 *         description: Server error
 */
// POST /api/spools
router.post('/', (req, res) => {
  try {
    const validated = createSpoolSchema.parse(req.body);
    
    // Verify filament exists
    const filament = filamentRepository.findById(validated.filament_id);
    if (!filament) {
      return res.status(404).json({ error: 'Filament not found' });
    }

    const spool = spoolRepository.create(validated);
    res.status(201).json(spool);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating spool:', error);
    res.status(500).json({ error: 'Failed to create spool' });
  }
});

/**
 * @swagger
 * /api/spools/{id}:
 *   put:
 *     summary: Update a child spool
 *     tags: [Spools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Spool ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               starting_weight_g:
 *                 type: number
 *                 minimum: 0
 *               empty_weight_g:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *               weight_g:
 *                 type: number
 *                 minimum: 0
 *               archived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Spool updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Spool'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Spool not found
 *       500:
 *         description: Server error
 */
// PUT /api/spools/:id
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid spool ID' });
    }

    const validated = updateSpoolSchema.parse({ ...req.body, id });
    
    // Check if spool exists
    const existing = spoolRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Spool not found' });
    }

    const spool = spoolRepository.update(validated);
    res.json(spool);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating spool:', error);
    res.status(500).json({ error: 'Failed to update spool' });
  }
});

/**
 * @swagger
 * /api/spools/{id}:
 *   delete:
 *     summary: Delete a child spool
 *     tags: [Spools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Spool ID
 *     responses:
 *       204:
 *         description: Spool deleted successfully
 *       400:
 *         description: Invalid spool ID
 *       404:
 *         description: Spool not found
 *       500:
 *         description: Server error
 */
// DELETE /api/spools/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid spool ID' });
    }

    const spool = spoolRepository.findById(id);
    if (!spool) {
      return res.status(404).json({ error: 'Spool not found' });
    }

    const deleted = spoolRepository.delete(id);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete spool' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting spool:', error);
    res.status(500).json({ error: 'Failed to delete spool' });
  }
});

/**
 * @swagger
 * /api/spools/{id}/archive:
 *   patch:
 *     summary: Archive or unarchive a child spool
 *     tags: [Spools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Spool ID
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
 *         description: Spool archived/unarchived successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Spool'
 *       400:
 *         description: Invalid spool ID or invalid request body
 *       404:
 *         description: Spool not found
 *       500:
 *         description: Server error
 */
// PATCH /api/spools/:id/archive
router.patch('/:id/archive', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid spool ID' });
    }

    const { archived } = req.body;
    if (typeof archived !== 'boolean') {
      return res.status(400).json({ error: 'archived must be a boolean' });
    }

    const spool = spoolRepository.archive(id, archived);
    if (!spool) {
      return res.status(404).json({ error: 'Spool not found' });
    }

    res.json(spool);
  } catch (error) {
    console.error('Error archiving spool:', error);
    res.status(500).json({ error: 'Failed to archive spool' });
  }
});

export default router;
