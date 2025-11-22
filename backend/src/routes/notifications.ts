import { Router } from 'express';
import { settingsRepository } from '../repositories/SettingsRepository.js';
import { filamentRepository } from '../repositories/FilamentRepository.js';
import type { Filament } from '../types/index.js';

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications (filaments that need restocking)
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of filaments that need restocking
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Filament'
 */
router.get('/', (req, res) => {
  try {
    const threshold = parseFloat(settingsRepository.get('restock_threshold_g', '100'));
    
    // Get all non-archived filaments and filter by remaining weight
    const filaments = filamentRepository.findAll(false);
    
    // Filter filaments where total remaining weight (sum of all spools) <= threshold
    const notifications: Filament[] = filaments.filter(f => 
      (f.remaining_weight_g || 0) <= threshold && (f.remaining_weight_g || 0) > 0
    );
    
    // Sort by remaining weight ascending
    notifications.sort((a, b) => (a.remaining_weight_g || 0) - (b.remaining_weight_g || 0));
    
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

