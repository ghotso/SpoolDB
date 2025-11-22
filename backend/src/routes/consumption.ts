import { Router } from 'express';
import { consumptionRepository } from '../repositories/ConsumptionRepository.js';
import { filamentRepository } from '../repositories/FilamentRepository.js';
import { z } from 'zod';

const router = Router();

const consumptionTypes = ['success', 'failed', 'test', 'manual'] as const;

const createConsumptionSchema = z.object({
  filament_id: z.number().int().positive(),
  amount_g: z.number().positive(),
  amount_m: z.number().nonnegative().optional().nullable(),
  print_name: z.string().max(255).optional().nullable(),
  type: z.enum(consumptionTypes),
  notes: z.string().optional().nullable()
});

const updateConsumptionSchema = createConsumptionSchema.partial().extend({
  id: z.number().int().positive()
});

/**
 * @swagger
 * /api/consumption:
 *   get:
 *     summary: Get all consumption entries
 *     tags: [Consumption]
 *     parameters:
 *       - in: query
 *         name: filament_id
 *         schema:
 *           type: integer
 *         description: Filter by filament ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [success, failed, test, manual]
 *         description: Filter by consumption type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter entries until this date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: List of consumption entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConsumptionEntry'
 *       500:
 *         description: Server error
 */
// GET /api/consumption
router.get('/', (req, res) => {
  try {
    const filters: any = {};
    
    if (req.query.filament_id) {
      filters.filament_id = parseInt(req.query.filament_id as string);
    }
    
    if (req.query.type) {
      filters.type = req.query.type as string;
    }
    
    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }

    const entries = consumptionRepository.findAll(Object.keys(filters).length > 0 ? filters : undefined);
    res.json(entries);
  } catch (error) {
    console.error('Error fetching consumption entries:', error);
    res.status(500).json({ error: 'Failed to fetch consumption entries' });
  }
});

/**
 * @swagger
 * /api/consumption/{id}:
 *   get:
 *     summary: Get a consumption entry by ID
 *     tags: [Consumption]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Consumption entry ID
 *     responses:
 *       200:
 *         description: Consumption entry details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsumptionEntry'
 *       400:
 *         description: Invalid consumption entry ID
 *       404:
 *         description: Consumption entry not found
 *       500:
 *         description: Server error
 */
// GET /api/consumption/:id
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid consumption entry ID' });
    }

    const entry = consumptionRepository.findById(id);
    if (!entry) {
      return res.status(404).json({ error: 'Consumption entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error fetching consumption entry:', error);
    res.status(500).json({ error: 'Failed to fetch consumption entry' });
  }
});

/**
 * @swagger
 * /api/consumption:
 *   post:
 *     summary: Create a new consumption entry
 *     tags: [Consumption]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filament_id
 *               - amount_g
 *               - type
 *             properties:
 *               filament_id:
 *                 type: integer
 *                 example: 1
 *               amount_g:
 *                 type: number
 *                 minimum: 0
 *                 example: 50.5
 *               amount_m:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 example: 10.2
 *               print_name:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 example: "Benchy"
 *               type:
 *                 type: string
 *                 enum: [success, failed, test, manual]
 *                 example: "success"
 *               notes:
 *                 type: string
 *                 nullable: true
 *                 example: "Perfect print"
 *     responses:
 *       201:
 *         description: Consumption entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsumptionEntry'
 *       400:
 *         description: Validation error or insufficient filament
 *       404:
 *         description: Filament not found
 *       500:
 *         description: Server error
 */
// POST /api/consumption
router.post('/', (req, res) => {
  try {
    const validated = createConsumptionSchema.parse(req.body);
    
    // Verify filament exists
    const filament = filamentRepository.findById(validated.filament_id);
    if (!filament) {
      return res.status(404).json({ error: 'Filament not found' });
    }

    // Check if filament has enough remaining weight
    const remainingWeight = filament.remaining_weight_g || 0;
    if (remainingWeight < validated.amount_g) {
      return res.status(400).json({ 
        error: 'Insufficient filament remaining',
        remaining: remainingWeight,
        requested: validated.amount_g
      });
    }

    const entry = consumptionRepository.create(validated);
    res.status(201).json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating consumption entry:', error);
    res.status(500).json({ error: 'Failed to create consumption entry' });
  }
});

/**
 * @swagger
 * /api/consumption/{id}:
 *   put:
 *     summary: Update a consumption entry
 *     tags: [Consumption]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Consumption entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filament_id:
 *                 type: integer
 *               amount_g:
 *                 type: number
 *                 minimum: 0
 *               amount_m:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *               print_name:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *               type:
 *                 type: string
 *                 enum: [success, failed, test, manual]
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Consumption entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConsumptionEntry'
 *       400:
 *         description: Validation error, insufficient filament, or invalid ID
 *       404:
 *         description: Consumption entry or filament not found
 *       500:
 *         description: Server error
 */
// PUT /api/consumption/:id
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid consumption entry ID' });
    }

    const validated = updateConsumptionSchema.parse({ ...req.body, id });
    
    // Check if entry exists
    const existing = consumptionRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Consumption entry not found' });
    }

    // Verify filament exists if provided
    const filamentId = validated.filament_id || existing.filament_id;
    const filament = filamentRepository.findById(filamentId);
    if (!filament) {
      return res.status(404).json({ error: 'Filament not found' });
    }

    // If amount_g is being updated, check if filament has enough remaining
    if (validated.amount_g !== undefined) {
      const currentFilament = filamentRepository.findById(filamentId);
      if (!currentFilament) {
        return res.status(404).json({ error: 'Filament not found' });
      }

      // Calculate what the remaining would be after update
      const weightDiff = validated.amount_g - existing.amount_g;
      const remainingWeight = currentFilament.remaining_weight_g || 0;
      const newRemaining = remainingWeight - weightDiff;
      
      if (newRemaining < 0) {
        return res.status(400).json({ 
          error: 'Insufficient filament remaining',
          remaining: remainingWeight,
          requested: validated.amount_g,
          current: existing.amount_g
        });
      }
    }

    const entry = consumptionRepository.update(validated);
    res.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating consumption entry:', error);
    res.status(500).json({ error: 'Failed to update consumption entry' });
  }
});

/**
 * @swagger
 * /api/consumption/{id}:
 *   delete:
 *     summary: Delete a consumption entry
 *     tags: [Consumption]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Consumption entry ID
 *     responses:
 *       204:
 *         description: Consumption entry deleted successfully
 *       400:
 *         description: Invalid consumption entry ID
 *       404:
 *         description: Consumption entry not found
 *       500:
 *         description: Server error
 */
// DELETE /api/consumption/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid consumption entry ID' });
    }

    const entry = consumptionRepository.findById(id);
    if (!entry) {
      return res.status(404).json({ error: 'Consumption entry not found' });
    }

    const deleted = consumptionRepository.delete(id);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete consumption entry' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting consumption entry:', error);
    res.status(500).json({ error: 'Failed to delete consumption entry' });
  }
});

export default router;
