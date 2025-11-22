import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SpoolDB API',
      version: '1.0.0',
      description: 'API documentation for SpoolDB - Filament Inventory Management System',
      contact: {
        name: 'SpoolDB',
        url: 'https://github.com/ghotso/SpoolDB',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Materials', description: 'Material management endpoints' },
      { name: 'Colors', description: 'Color management endpoints' },
      { name: 'Templates', description: 'Template management endpoints' },
      { name: 'Filaments', description: 'Filament management endpoints' },
      { name: 'Spools', description: 'Spool management endpoints (child of filaments)' },
      { name: 'Consumption', description: 'Consumption entry management endpoints' },
      { name: 'i18n', description: 'Internationalization endpoints' },
    ],
    components: {
      schemas: {
        Material: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            is_custom: { type: 'boolean' },
          },
        },
        Color: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            hex: { type: 'string', nullable: true },
            is_custom: { type: 'boolean' },
          },
        },
        Template: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            material_id: { type: 'integer' },
            manufacturer: { type: 'string', nullable: true },
            starting_weight_g: { type: 'number' },
            empty_weight_g: { type: 'number', nullable: true },
            notes: { type: 'string', nullable: true },
          },
        },
        Filament: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            material_id: { type: 'integer' },
            color_id: { type: 'integer' },
            manufacturer: { type: 'string', nullable: true },
            template_id: { type: 'integer', nullable: true },
            archived: { type: 'boolean' },
            notes: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            remaining_weight_g: { type: 'number' },
            material: { $ref: '#/components/schemas/Material' },
            color: { $ref: '#/components/schemas/Color' },
            template: { $ref: '#/components/schemas/Template' },
            spools: {
              type: 'array',
              items: { $ref: '#/components/schemas/Spool' },
            },
          },
        },
        Spool: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            filament_id: { type: 'integer' },
            starting_weight_g: { type: 'number' },
            empty_weight_g: { type: 'number', nullable: true },
            weight_g: { type: 'number' },
            archived: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        ConsumptionEntry: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            filament_id: { type: 'integer' },
            amount_g: { type: 'number' },
            amount_m: { type: 'number', nullable: true },
            print_name: { type: 'string', nullable: true },
            type: { type: 'string', enum: ['success', 'failed', 'test', 'manual'] },
            notes: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            filament: { $ref: '#/components/schemas/Filament' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'], // Path to the API files (both TS and compiled JS)
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'SpoolDB API Documentation',
  }));
  
  // Also serve the JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

