# Templates API

Complete API reference for filament template management endpoints.

## Base Path
`/api/templates`

## Overview

Templates are reusable filament configurations that can be used to quickly create new filaments with pre-filled values.

## Endpoints

### GET `/api/templates`
List all templates.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "PLA Standard",
    "material_id": 1,
    "manufacturer": "Polymaker",
    "starting_weight_g": 1000,
    "empty_weight_g": 250,
    "notes": "Standard PLA template",
    "created_at": "2024-01-01T00:00:00.000Z",
    "material": {
      "id": 1,
      "name": "PLA",
      "is_custom": false
    }
  }
]
```

**Error Responses:**
- `500`: Server error

---

### GET `/api/templates/:id`
Get a specific template by ID.

**Path Parameters:**
- `id` (integer, required): Template ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "PLA Standard",
  "material_id": 1,
  "manufacturer": "Polymaker",
  "starting_weight_g": 1000,
  "empty_weight_g": 250,
  "notes": "Standard PLA template",
  "created_at": "2024-01-01T00:00:00.000Z",
  "material": {
    "id": 1,
    "name": "PLA",
    "is_custom": false
  }
}
```

**Error Responses:**
- `400`: Invalid template ID
- `404`: Template not found
- `500`: Server error

---

### POST `/api/templates`
Create a new template.

**Request Body:**
```json
{
  "name": "PLA Standard",
  "material_id": 1,
  "manufacturer": "Polymaker",
  "starting_weight_g": 1000,
  "empty_weight_g": 250,
  "notes": "Standard PLA template"
}
```

**Required Fields:**
- `name` (string, 1-255 chars): Unique template name
- `material_id` (integer, positive)
- `starting_weight_g` (number, positive)

**Optional Fields:**
- `manufacturer` (string, max 255 chars)
- `empty_weight_g` (number, non-negative)
- `notes` (string)

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "PLA Standard",
  ...
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Material not found
- `409`: Template with this name already exists
- `500`: Server error

---

### PUT `/api/templates/:id`
Update an existing template.

**Path Parameters:**
- `id` (integer, required): Template ID

**Request Body:** (all fields optional)
```json
{
  "name": "PLA Standard Updated",
  "material_id": 1,
  "manufacturer": "Polymaker",
  "starting_weight_g": 1000,
  "empty_weight_g": 250,
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "PLA Standard Updated",
  ...
}
```

**Error Responses:**
- `400`: Validation error or invalid ID
- `404`: Template or material not found
- `409`: Template with this name already exists
- `500`: Server error

---

### DELETE `/api/templates/:id`
Delete a template.

**Path Parameters:**
- `id` (integer, required): Template ID

**Response:** `204 No Content`

**Error Responses:**
- `400`: Invalid template ID
- `404`: Template not found
- `409`: Template is in use and cannot be deleted
- `500`: Server error

**Note:** Templates that are referenced by existing filaments cannot be deleted.

## Usage

Templates are used when creating new filaments:
1. User selects a template when creating a filament
2. Template values pre-fill the filament form
3. User can modify any values before saving
4. The filament is created with a reference to the template (`template_id`)

