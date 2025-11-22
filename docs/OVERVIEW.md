---
title: Overview
sidebar_position: 2
---

# SpoolDB Overview

## Introduction

SpoolDB is an open-source filament inventory management system designed for 3D printing enthusiasts and makers. It provides a comprehensive solution for tracking filament inventory, logging consumption, managing templates, and monitoring stock levels.

## Architecture

### Technology Stack

**Backend:**
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3) with Drizzle ORM
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI (swagger-ui-express, swagger-jsdoc)
- **File Upload**: Multer
- **Rate Limiting**: express-rate-limit

**Frontend:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API (i18n, theme)
- **Icons**: Material Symbols Outlined
- **Font**: Inter

**Deployment:**
- **Containerization**: Docker (multi-stage build)
- **Registry**: GitHub Container Registry (GHCR)
- **CI/CD**: GitHub Actions

### Project Structure

```
SpoolDB/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── db/             # Database schema, migrations, seeding
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Express middleware (rate limiting)
│   │   ├── swagger/        # API documentation config
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utilities (G-code parser)
│   └── data/               # SQLite database files
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (i18n, theme)
│   │   ├── pages/          # Page components
│   │   └── theme/          # Theme configuration
│   └── public/             # Static assets
├── locales/                # Translation files (en.json, de.json)
├── docs/                   # Documentation
└── PRD/                    # Product Requirements Document
```

## Core Concepts

### Filament vs Spool

- **Filament**: The main entity representing a type of filament (e.g., "PLA Red 1.75mm"). Contains metadata like name, material, color, manufacturer, and notes.
- **Spool**: A child entity of filament representing a physical spool. Tracks individual spool weight, starting weight, empty weight, and usage history.

### Data Flow

1. **Filament Creation**: User creates a filament with material, color, and other metadata
2. **Spool Management**: When filament is created or restocked, child spools are created
3. **Consumption Logging**: Consumption entries deduct weight from appropriate spools
4. **Auto-Archiving**: Spools automatically archive when weight reaches zero
5. **Notifications**: System monitors remaining weight and alerts when below threshold

### Key Features

- **Multi-Spool Tracking**: Each filament can have multiple physical spools
- **Automatic Weight Deduction**: Consumption automatically deducts from the most recently used spool
- **Template System**: Reusable templates for quick filament creation
- **G-code Integration**: Automatic consumption from G-code files (Anycubic Slicer Next)
- **Notifications**: Low-stock alerts based on configurable threshold
- **Internationalization**: Multi-language support (English, German)
- **Light/Dark Mode**: Full theme support

## Security Features

- **Rate Limiting**: Prevents abuse with generous limits for self-hosted environments
- **Path Traversal Protection**: Secure file path handling
- **Input Validation**: Zod schemas for all API inputs
- **ReDoS Protection**: Safe regex patterns with bounded quantifiers
- **File Size Limits**: 10MB maximum for G-code uploads

## Rate Limiting

- **General API**: 1000 requests per 15 minutes per IP
- **Strict Endpoints**: 200 requests per 15 minutes per IP
- **File Uploads**: 100 uploads per hour per IP

These limits are generous for self-hosted applications in closed networks while still providing basic protection.

## Database

SQLite database with automatic migrations on startup. Database file location:
- **Development**: `backend/data/spooldb.sqlite`
- **Production**: `/data/spooldb.sqlite` (configurable via `DB_PATH` env var)

## Internationalization

Translation files are stored in the `locales/` directory as JSON files. Currently supported languages:
- English (`en.json`)
- German (`de.json`)

New languages can be added by creating a new JSON file following the same structure.

## Theme System

The application supports light and dark modes with a comprehensive design system:
- **Accent Color**: Orange (#FF7A1A)
- **Typography**: Inter font family
- **Components**: Consistent styling with rounded corners, shadows, and animations
- **Responsive**: Mobile-friendly design


