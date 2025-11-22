import { Router } from 'express';
import { templateRepository } from '../repositories/TemplateRepository.js';
import { materialRepository } from '../repositories/MaterialRepository.js';
import { z } from 'zod';

const router = Router();

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  material_id: z.number().int().positive(),
  manufacturer: z.string().max(255).optional().nullable(),
  starting_weight_g: z.number().positive(),
  empty_weight_g: z.number().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable()
});

const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.number().int().positive()
});

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get all templates
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: List of templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Template'
 *       500:
 *         description: Server error
 */
// GET /api/templates
router.get('/', (req, res) => {
  try {
    const templates = templateRepository.findAll();
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get a template by ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template'
 *       400:
 *         description: Invalid template ID
 *       404:
 *         description: Template not found
 *       500:
 *         description: Server error
 */
// GET /api/templates/:id
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const template = templateRepository.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Create a new template
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - material_id
 *               - starting_weight_g
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "PLA Standard"
 *               material_id:
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
 *               notes:
 *                 type: string
 *                 nullable: true
 *                 example: "Standard PLA template"
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Material not found
 *       409:
 *         description: Template with this name already exists
 *       500:
 *         description: Server error
 */
// POST /api/templates
router.post('/', (req, res) => {
  try {
    const validated = createTemplateSchema.parse(req.body);
    
    // Check if template name already exists
    const existing = templateRepository.findByName(validated.name);
    if (existing) {
      return res.status(409).json({ error: 'Template with this name already exists' });
    }

    // Verify material exists
    const material = materialRepository.findById(validated.material_id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const template = templateRepository.create(validated);
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update a template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
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
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Template'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Template or material not found
 *       409:
 *         description: Template with this name already exists
 *       500:
 *         description: Server error
 */
// PUT /api/templates/:id
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const validated = updateTemplateSchema.parse({ ...req.body, id });
    
    // Check if template exists
    const existing = templateRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if name is already taken by another template
    if (validated.name) {
      const nameExists = templateRepository.findByName(validated.name);
      if (nameExists && nameExists.id !== id) {
        return res.status(409).json({ error: 'Template with this name already exists' });
      }
    }

    // Verify material exists if provided
    if (validated.material_id) {
      const material = materialRepository.findById(validated.material_id);
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
    }

    const template = templateRepository.update(validated);
    res.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete a template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Template ID
 *     responses:
 *       204:
 *         description: Template deleted successfully
 *       400:
 *         description: Invalid template ID
 *       404:
 *         description: Template not found
 *       409:
 *         description: Template is in use and cannot be deleted
 *       500:
 *         description: Server error
 */
// DELETE /api/templates/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid template ID' });
    }

    const template = templateRepository.findById(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (templateRepository.isInUse(id)) {
      return res.status(409).json({ error: 'Template is in use and cannot be deleted' });
    }

    const deleted = templateRepository.delete(id);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete template' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default router;
