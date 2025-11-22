import { Router } from 'express';
import { materialRepository } from '../repositories/MaterialRepository.js';
import { z } from 'zod';

const router = Router();

const createMaterialSchema = z.object({
  name: z.string().min(1).max(255)
});

const updateMaterialSchema = z.object({
  name: z.string().min(1).max(255)
});

/**
 * @swagger
 * /api/materials:
 *   get:
 *     summary: Get all materials
 *     tags: [Materials]
 *     responses:
 *       200:
 *         description: List of materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/materials
router.get('/', (req, res) => {
  try {
    const materials = materialRepository.findAll();
    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

/**
 * @swagger
 * /api/materials/{id}:
 *   get:
 *     summary: Get a material by ID
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       400:
 *         description: Invalid material ID
 *       404:
 *         description: Material not found
 *       500:
 *         description: Server error
 */
// GET /api/materials/:id
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid material ID' });
    }

    const material = materialRepository.findById(id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Failed to fetch material' });
  }
});

/**
 * @swagger
 * /api/materials:
 *   post:
 *     summary: Create a new material
 *     tags: [Materials]
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
 *                 example: "PETG"
 *     responses:
 *       201:
 *         description: Material created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Material with this name already exists
 *       500:
 *         description: Server error
 */
// POST /api/materials
router.post('/', (req, res) => {
  try {
    const validated = createMaterialSchema.parse(req.body);
    
    // Check if material already exists
    const existing = materialRepository.findByName(validated.name);
    if (existing) {
      return res.status(409).json({ error: 'Material with this name already exists' });
    }

    const material = materialRepository.create(validated);
    res.status(201).json(material);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
});

/**
 * @swagger
 * /api/materials/{id}:
 *   put:
 *     summary: Update a material
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
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
 *                 example: "PETG"
 *     responses:
 *       200:
 *         description: Material updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Material'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Material not found
 *       409:
 *         description: Material with this name already exists
 *       500:
 *         description: Server error
 */
// PUT /api/materials/:id
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid material ID' });
    }

    const validated = updateMaterialSchema.parse(req.body);
    
    // Check if material exists
    const existing = materialRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Check if name is already taken by another material
    const nameExists = materialRepository.findByName(validated.name);
    if (nameExists && nameExists.id !== id) {
      return res.status(409).json({ error: 'Material with this name already exists' });
    }

    const material = materialRepository.update(id, validated.name);
    res.json(material);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating material:', error);
    res.status(500).json({ error: 'Failed to update material' });
  }
});

/**
 * @swagger
 * /api/materials/{id}:
 *   delete:
 *     summary: Delete a material
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
 *     responses:
 *       204:
 *         description: Material deleted successfully
 *       400:
 *         description: Invalid material ID
 *       403:
 *         description: Cannot delete predefined material
 *       404:
 *         description: Material not found
 *       409:
 *         description: Material is in use and cannot be deleted
 *       500:
 *         description: Server error
 */
// DELETE /api/materials/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid material ID' });
    }

    const material = materialRepository.findById(id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    if (!material.is_custom) {
      return res.status(403).json({ error: 'Cannot delete predefined material' });
    }

    if (materialRepository.isInUse(id)) {
      return res.status(409).json({ error: 'Material is in use and cannot be deleted' });
    }

    const deleted = materialRepository.delete(id);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete material' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

export default router;
