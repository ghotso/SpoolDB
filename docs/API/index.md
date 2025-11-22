---
title: API Reference
sidebar_position: 0
---

# API Reference

Complete API documentation for all SpoolDB endpoints.

## Overview

The SpoolDB API is a RESTful API that provides endpoints for managing filaments, spools, consumption entries, templates, materials, colors, settings, and more.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

Currently, the API does not require authentication as it's designed for self-hosted environments.

## Rate Limiting

- **General API**: 1000 requests per 15 minutes per IP
- **Strict Endpoints**: 200 requests per 15 minutes per IP
- **File Uploads**: 100 uploads per hour per IP

## API Endpoints

### Core Resources

- **[Filaments API](./filaments)** - Filament management (create, read, update, delete, archive, restock)
- **[Spools API](./spools)** - Individual spool management
- **[Consumption API](./consumption)** - Consumption entry tracking and history

### Templates & Configuration

- **[Templates API](./templates)** - Filament template management
- **[Materials API](./materials)** - Material type management
- **[Colors API](./colors)** - Color management with hex codes

### System & Utilities

- **[Settings API](./settings)** - Application settings (restock threshold, etc.)
- **[Notifications API](./notifications)** - Low-stock notifications
- **[G-code API](./gcode)** - G-code file parsing and consumption creation
- **[Internationalization API](./i18n)** - Translation file access

## Interactive API Documentation

When the server is running, interactive API documentation is available at:
- **Swagger UI**: `http://localhost:8080/api-docs`
- **OpenAPI Spec**: `http://localhost:8080/api-docs.json`

## Response Format

All API responses are in JSON format. Error responses follow this structure:

```json
{
  "error": "Error message",
  "details": [...]
}
```

## Common HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful deletion
- `400 Bad Request` - Validation error or invalid input
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., name already exists, resource in use)
- `500 Internal Server Error` - Server error

