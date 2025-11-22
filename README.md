# SpoolDB

Filament inventory management system for 3D printing enthusiasts and makers.

## Features

### Core Functionality

- **Filament Management**: Track filament inventory with detailed information (material, color, manufacturer, notes)
- **Spool Tracking**: Multiple spools per filament with individual weight tracking
- **Consumption Logging**: 
  - Manual consumption entry
  - Automatic consumption from G-code file upload (Anycubic Slicer Next support)
  - Consumption history with filtering and editing
- **Template System**: Reusable filament templates for quick creation
- **Restocking**: Add new spools to existing filaments with configurable quantities and weights
- **Notifications**: Low-stock alerts when filament remaining weight falls below threshold
- **Auto-archiving**: Spools automatically archive when weight reaches zero

### User Interface

- **Modern UI**: Clean, responsive design with light/dark mode support
- **Inventory Overview**: Dashboard with progress bars, color indicators, and low-stock warnings
- **Filament Detail Page**: Comprehensive view with spool overview, consumption history, and actions
- **Modal-based Forms**: Streamlined creation and editing experience
- **Floating Action Button (FAB)**: Quick access to common actions (Add Filament, Log Consumption, Restock)
- **Custom Color Picker**: Visual color selection with most-used colors
- **Searchable Dropdowns**: Manufacturer autocomplete and filament selection with color dots

### Customization

- **Custom Materials**: Add your own material types
- **Custom Colors**: Extend color palette with hex color picker
- **Settings Page**: Configure restock threshold and manage custom materials
- **Internationalization**: Multi-language support (English, German) with easy extension
- **Translation Warning**: Development mode indicator for missing translations

### Technical Features

- **API Documentation**: Integrated Swagger/OpenAPI documentation
- **Database Migrations**: Automatic schema migrations on startup
- **RESTful API**: Complete CRUD operations for all entities
- **Type Safety**: Full TypeScript implementation
- **Single Container**: Deploy as one Docker container

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (better-sqlite3) with Drizzle ORM
- **Frontend**: React + TypeScript + Vite
- **Validation**: Zod
- **API Docs**: Swagger/OpenAPI (swagger-ui-express, swagger-jsdoc)
- **File Upload**: Multer (for G-code files)
- **Deployment**: Docker (multi-stage build)

## Development

### Prerequisites

**Option 1: Local Development**
- Node.js 18+ (LTS recommended)
- npm or yarn
- **Windows users:** Visual Studio Build Tools 2022 with "Desktop development with C++" workload

**Option 2: Docker Development (Recommended for Windows)**
- Docker Desktop
- No build tools needed!

### Setup

#### Local Development

```bash
# Install dependencies
npm install

# Start development server (runs both backend and frontend)
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- API Documentation: `http://localhost:8080/api-docs`

#### Docker Development

```bash
# Build and start
docker-compose up --build

# Application available at http://localhost:8080
```

See [Docker Deployment Guide](docs/DOCKER_DEPLOYMENT.md) for production deployment details.

### Project Structure

```
SpoolDB/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── db/          # Database schema, migrations, seeding
│   │   ├── repositories/ # Data access layer
│   │   ├── routes/      # API endpoints
│   │   ├── swagger/     # API documentation config
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Utilities (G-code parser)
│   └── data/            # SQLite database files
├── frontend/            # React frontend
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts (i18n, theme)
│   │   ├── pages/       # Page components
│   │   └── theme/       # Theme configuration
│   └── public/          # Static assets
├── locales/             # Translation files (en.json, de.json)
└── PRD/                 # Product Requirements Document
```

## API Endpoints

### Filaments
- `GET /api/filaments` - List all filaments
- `POST /api/filaments` - Create filament
- `GET /api/filaments/:id` - Get filament details
- `PUT /api/filaments/:id` - Update filament
- `DELETE /api/filaments/:id` - Delete filament
- `POST /api/filaments/:id/archive` - Archive/unarchive filament
- `POST /api/filaments/:id/restock` - Restock filament (add spools)

### Spools
- `GET /api/spools` - List all spools
- `GET /api/spools/filament/:filamentId` - Get spools for a filament
- `POST /api/spools` - Create spool
- `PUT /api/spools/:id` - Update spool
- `DELETE /api/spools/:id` - Delete spool
- `POST /api/spools/:id/archive` - Archive/unarchive spool

### Consumption
- `GET /api/consumption` - List consumption entries (with filters)
- `POST /api/consumption` - Create consumption entry
- `GET /api/consumption/:id` - Get consumption entry
- `PUT /api/consumption/:id` - Update consumption entry
- `DELETE /api/consumption/:id` - Delete consumption entry

### Templates
- `GET /api/templates` - List all templates
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Materials & Colors
- `GET /api/materials` - List all materials
- `POST /api/materials` - Create custom material
- `DELETE /api/materials/:id` - Delete material
- `GET /api/colors` - List all colors
- `GET /api/colors/most-used` - Get 15 most used colors
- `POST /api/colors` - Create custom color
- `DELETE /api/colors/:id` - Delete color

### G-code
- `POST /api/gcode/parse` - Parse G-code file and extract metadata
- `POST /api/gcode/upload` - Upload G-code and create consumption entry

### Settings & Notifications
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting
- `PUT /api/settings/:key` - Update setting
- `GET /api/notifications` - Get low-stock notifications

### Internationalization
- `GET /api/i18n/list` - List available languages
- `GET /api/i18n/:language` - Get translations for language

### API Documentation
- `GET /api-docs` - Swagger UI interface
- `GET /api-docs.json` - OpenAPI specification (JSON)

## Data Model

### Filament
- Core entity representing a type of filament
- Contains: name, material, color, manufacturer, notes
- Has multiple child spools

### Spool
- Child entity of filament
- Tracks: starting weight, empty weight, current weight, created/updated timestamps
- Automatically archived when weight reaches zero

### Consumption Entry
- Records filament usage
- Types: manual, success, failed, test
- Links to filament (not individual spool)
- Automatically deducts weight from appropriate spool

### Template
- Reusable filament configuration
- Pre-fills filament form when creating from template

## Milestones

- ✅ **Milestone 1**: Core Data & Backend (SQLite schema, repository layer, REST API)
- ✅ **Milestone 2**: UI MVP (Full React frontend with all features)
- ✅ **Milestone 3**: Dockerization (Single-container deployment, configurable via env vars)
- ⏳ **Milestone 4**: CI/CD (GitHub Actions for GHCR)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all features work in both light and dark mode
5. Add/update translations if adding new UI strings
6. Submit a pull request

## License

MIT
