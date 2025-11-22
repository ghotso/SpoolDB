---
title: Spools API
sidebar_position: 2
---

# Spools API

Complete API reference for spool management endpoints.

## Base Path
`/api/spools`

## Overview

Spools are child entities of filaments, representing individual physical spools. Each filament can have multiple spools, and consumption automatically deducts weight from the most recently used spool.

## Endpoints

### GET `/api/spools`
List all spools.

**Query Parameters:**
- `filament_id` (integer, optional): Filter by filament ID
- `archived` (boolean, optional): Include archived spools. Default: `false`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "filament_id": 1,
    "starting_weight_g": 1000,
    "empty_weight_g": 250,
    "weight_g": 750,
    "archived": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `500`: Server error

---

### GET `/api/spools/:id`
Get a specific spool by ID.

**Path Parameters:**
- `id` (integer, required): Spool ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "filament_id": 1,
  "starting_weight_g": 1000,
  "empty_weight_g": 250,
  "weight_g": 750,
  "archived": false,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid spool ID
- `404`: Spool not found
- `500`: Server error

---

### POST `/api/spools`
Create a new spool.

**Request Body:**
```json
{
  "filament_id": 1,
  "starting_weight_g": 1000,
  "empty_weight_g": 250,
  "weight_g": 1000,
  "archived": false
}
```

**Required Fields:**
- `filament_id` (integer, positive)
- `starting_weight_g` (number, positive)
- `weight_g` (number, positive): Current weight (usually equals starting_weight_g for new spools)

**Optional Fields:**
- `empty_weight_g` (number, non-negative)
- `archived` (boolean, default: false)

**Response:** `201 Created`
```json
{
  "id": 1,
  "filament_id": 1,
  ...
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Filament not found
- `500`: Server error

---

### PUT `/api/spools/:id`
Update an existing spool.

**Path Parameters:**
- `id` (integer, required): Spool ID

**Request Body:** (all fields optional)
```json
{
  "starting_weight_g": 1000,
  "empty_weight_g": 250,
  "weight_g": 750,
  "archived": false
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "weight_g": 750,
  ...
}
```

**Error Responses:**
- `400`: Validation error or invalid ID
- `404`: Spool not found
- `500`: Server error

---

### DELETE `/api/spools/:id`
Delete a spool.

**Path Parameters:**
- `id` (integer, required): Spool ID

**Response:** `204 No Content`

**Error Responses:**
- `400`: Invalid spool ID
- `404`: Spool not found
- `500`: Server error

---

### PATCH `/api/spools/:id/archive`
Archive or unarchive a spool.

**Path Parameters:**
- `id` (integer, required): Spool ID

**Request Body:**
```json
{
  "archived": true
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "archived": true,
  ...
}
```

**Error Responses:**
- `400`: Invalid spool ID or invalid request body
- `404`: Spool not found
- `500`: Server error

## Notes

- Spools are automatically archived when their weight reaches zero
- The `weight_g` field represents the current weight of the spool
- Remaining usable weight = `weight_g - empty_weight_g`
- Consumption entries automatically deduct from the most recently used spool


