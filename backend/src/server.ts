import express from 'express';
import cors from 'cors';
import { migrate } from './db/migrate.js';
import db from './db/database.js';
import { setupSwagger } from './swagger/swagger.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Routes
import materialsRouter from './routes/materials.js';
import colorsRouter from './routes/colors.js';
import templatesRouter from './routes/templates.js';
import filamentsRouter from './routes/filaments.js';
import consumptionRouter from './routes/consumption.js';
import i18nRouter from './routes/i18n.js';
import gcodeRouter from './routes/gcode.js';
import settingsRouter from './routes/settings.js';
import notificationsRouter from './routes/notifications.js';
import spoolsRouter from './routes/spools.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Initialize database with migration
console.log('Initializing database...');
migrate();
console.log('Database initialized');

// Swagger API Documentation
setupSwagger(app);

// API Routes
app.use('/api/materials', materialsRouter);
app.use('/api/colors', colorsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/filaments', filamentsRouter);
app.use('/api/consumption', consumptionRouter);
app.use('/api/i18n', i18nRouter);
app.use('/api/gcode', gcodeRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/spools', spoolsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production (frontend will be built here)
if (process.env.NODE_ENV === 'production') {
  import('path').then(pathModule => {
    import('url').then(urlModule => {
      const __filename = urlModule.fileURLToPath(import.meta.url);
      const __dirname = pathModule.dirname(__filename);
      const staticPath = pathModule.join(__dirname, '../../frontend/dist');
      
      // Serve static files
      app.use(express.static(staticPath));
      
      // SPA fallback - serve index.html for all non-API routes
      // Apply rate limiting to prevent abuse
      app.get('*', apiLimiter, (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
          return next();
        }
        res.sendFile(pathModule.join(staticPath, 'index.html'));
      });
    });
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SpoolDB server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  db.close();
  process.exit(0);
});

