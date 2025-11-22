# SpoolDB

Filament inventory management system for 3D printing enthusiasts and makers.

## Features

- **Spool Management**: Track filament stock across multiple spools
- **Consumption Logging**: Manual logging of filament usage
- **Template System**: Reusable spool templates for quick creation
- **Custom Materials & Colors**: Extend predefined lists with your own
- **Consumption History**: Chronological log with filtering
- **Inventory Overview**: Dashboard with progress bars and low-stock indicators
- **Internationalization**: Multi-language support via JSON files
- **Single Container**: Deploy as one Docker container

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (better-sqlite3)
- **Frontend**: React + TypeScript + Vite
- **Validation**: Zod
- **Deployment**: Docker

## Development

### Prerequisites

**Option 1: Local Development**
- Node.js 18+
- npm or yarn
- **Windows users:** Visual Studio Build Tools with C++ workload (see [Windows Setup Guide](docs/WINDOWS_SETUP.md))

**Option 2: Docker Development (Recommended for Windows)**
- Docker Desktop
- No build tools needed!

### Setup

#### Local Development

```bash
# Install dependencies
npm install

# Initialize database
npm run migrate --workspace=backend

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:8080`

#### Docker Development (Easier on Windows)

```bash
# Build and start
docker-compose up --build

# API available at http://localhost:8080
```

See [Docker Deployment Guide](docs/DOCKER_DEPLOYMENT.md) for details.

### API Endpoints

- `GET /api/materials` - List all materials
- `POST /api/materials` - Create custom material
- `GET /api/colors` - List all colors
- `POST /api/colors` - Create custom color
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create template
- `GET /api/spools` - List all spools
- `POST /api/spools` - Create spool
- `GET /api/consumption` - List consumption entries
- `POST /api/consumption` - Log consumption
- `GET /api/i18n/list` - List available languages
- `GET /api/i18n/:language` - Get translations for language

## Milestones

- ✅ **Milestone 1**: Core Data & Backend (SQLite schema, repository layer, REST API)
- ✅ **Milestone 2**: UI MVP (Full React frontend with all features)
- ✅ **Milestone 3**: Dockerization (Single-container deployment, configurable via env vars)
- ⏳ **Milestone 4**: CI/CD (GitHub Actions for GHCR)

## License

MIT

