# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize database:**
   ```bash
   npm run migrate --workspace=backend
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on `http://localhost:8080`
   - Frontend dev server on `http://localhost:3000` (proxies to backend)

## Testing the API

Once the server is running, you can test the endpoints:

```bash
# Health check
curl http://localhost:8080/health

# List materials
curl http://localhost:8080/api/materials

# List colors
curl http://localhost:8080/api/colors

# Create a spool
curl -X POST http://localhost:8080/api/spools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Spool",
    "material_id": 1,
    "color_id": 1,
    "starting_weight_g": 1000,
    "empty_weight_g": 250
  }'

# List spools
curl http://localhost:8080/api/spools
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t spooldb .

# Run container
docker run -p 8080:8080 -v $(pwd)/data:/data spooldb
```

Or use docker-compose:

```bash
docker-compose up
```

## Project Structure

```
SpoolDB/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── db/        # Database schema, migrations, seed
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/    # API routes
│   │   ├── types/     # TypeScript types
│   │   └── server.ts  # Express server
│   └── package.json
├── frontend/          # React + TypeScript (Milestone 2)
│   └── src/
├── locales/           # i18n translation files
│   └── en.json
├── Dockerfile
├── docker-compose.yml
└── package.json       # Root workspace config
```

## Milestone 1 Status

✅ **Completed:**
- SQLite schema with all tables
- Repository layer for all entities
- REST API endpoints (CRUD for all resources)
- i18n structure with English translations
- Basic frontend structure
- Dockerfile for single-container deployment

⏳ **Next (Milestone 2):**
- Full UI implementation
- Spool management interface
- Consumption logging UI
- History view with filtering
- Template management UI

