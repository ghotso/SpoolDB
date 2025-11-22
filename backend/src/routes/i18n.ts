import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { strictLimiter } from '../middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Resolve locales path: in dev it's at root, in production it's at /app/locales
const localesPath = process.env.LOCALES_PATH || (() => {
  // Try relative to routes (for dev: backend/src/routes -> ../../../locales)
  const devPath = path.join(__dirname, '../../../locales');
  if (fs.existsSync(devPath)) {
    console.log(`[i18n] Using dev locales path: ${devPath}`);
    return devPath;
  }
  // Try relative to dist (for production: dist/routes -> ../../locales)
  const prodPath = path.join(__dirname, '../../locales');
  if (fs.existsSync(prodPath)) {
    console.log(`[i18n] Using prod locales path: ${prodPath}`);
    return prodPath;
  }
  // Fallback
  const fallbackPath = path.join(__dirname, '../../../locales');
  console.log(`[i18n] Using fallback locales path: ${fallbackPath} (exists: ${fs.existsSync(fallbackPath)})`);
  return fallbackPath;
})();

/**
 * @swagger
 * /api/i18n/list:
 *   get:
 *     summary: Get list of available languages
 *     tags: [i18n]
 *     responses:
 *       200:
 *         description: List of available language codes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["en", "de", "fr"]
 *       500:
 *         description: Server error
 */
// GET /api/i18n/list
router.get('/list', strictLimiter, (req, res) => {
  try {
    if (!fs.existsSync(localesPath)) {
      return res.json([]);
    }

    const files = fs.readdirSync(localesPath);
    const languages = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
      .sort();

    res.json(languages);
  } catch (error) {
    console.error('Error listing languages:', error);
    res.status(500).json({ error: 'Failed to list languages' });
  }
});

/**
 * @swagger
 * /api/i18n/{language}:
 *   get:
 *     summary: Get translations for a specific language
 *     tags: [i18n]
 *     parameters:
 *       - in: path
 *         name: language
 *         required: true
 *         schema:
 *           type: string
 *           pattern: "^[a-z0-9-]+$"
 *         description: Language code (e.g., en, de, fr)
 *     responses:
 *       200:
 *         description: Translation object for the language
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *               example:
 *                 app:
 *                   title: "SpoolDB"
 *                 spool:
 *                   add: "Add Spool"
 *       400:
 *         description: Invalid language code
 *       404:
 *         description: Language not found
 *       500:
 *         description: Server error
 */
// GET /api/i18n/:language
router.get('/:language', strictLimiter, (req, res) => {
  try {
    const language = req.params.language;
    
    // Security: only allow alphanumeric and hyphens
    if (!/^[a-z0-9-]+$/i.test(language)) {
      return res.status(400).json({ error: 'Invalid language code' });
    }

    // Construct file path
    const fileName = `${language}.json`;
    const filePath = path.join(localesPath, fileName);
    
    // Security: Resolve to absolute path and ensure it's within localesPath
    // This prevents directory traversal attacks (e.g., ../../../etc/passwd)
    const resolvedPath = path.resolve(filePath);
    const resolvedLocalesPath = path.resolve(localesPath);
    
    // Ensure the resolved path is within the locales directory
    if (!resolvedPath.startsWith(resolvedLocalesPath)) {
      return res.status(400).json({ error: 'Invalid language code' });
    }
    
    // Additional check: ensure filename doesn't contain path separators
    if (fileName.includes(path.sep) || fileName.includes('/') || fileName.includes('\\')) {
      return res.status(400).json({ error: 'Invalid language code' });
    }
    
    console.log(`[i18n] Loading language: ${language} from: ${resolvedPath}`);
    
    if (!fs.existsSync(resolvedPath)) {
      console.error(`[i18n] File not found: ${resolvedPath}`);
      return res.status(404).json({ error: 'Language not found' });
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');
    const translations = JSON.parse(content);
    
    console.log(`[i18n] Loaded ${Object.keys(translations).length} top-level keys for ${language}`);
    
    res.json(translations);
  } catch (error) {
    console.error('Error loading language:', error);
    res.status(500).json({ error: 'Failed to load language' });
  }
});

export default router;
