import { Router } from 'express';
import { settingsRepository } from '../repositories/SettingsRepository.js';
import { z } from 'zod';

const router = Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/', (req, res) => {
  try {
    const settings = settingsRepository.getAll();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     summary: Get a specific setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Setting value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 value:
 *                   type: string
 */
router.get('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const value = settingsRepository.get(key);
    res.json({ key, value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const updateSettingSchema = z.object({
  value: z.string(),
});

/**
 * @swagger
 * /api/settings/{key}:
 *   put:
 *     summary: Update a setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated setting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 value:
 *                   type: string
 */
router.put('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const validated = updateSettingSchema.parse(req.body);
    settingsRepository.set(key, validated.value);
    res.json({ key, value: validated.value });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;

