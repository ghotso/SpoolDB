# Materials API

Complete API reference for material management endpoints.

## Base Path
`/api/materials`

## Overview

Materials represent filament types (e.g., PLA, PETG, ABS). The system includes predefined materials, and users can create custom materials.

## Endpoints

### GET `/api/materials`
List all materials.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "PLA",
    "is_custom": false
  },
  {
    "id": 10,
    "name": "Custom Material",
    "is_custom": true
  }
]
```

**Error Responses:**
- `500`: Server error

---

### GET `/api/materials/:id`
Get a specific material by ID.

**Path Parameters:**
- `id` (integer, required): Material ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "PLA",
  "is_custom": false
}
```

**Error Responses:**
- `400`: Invalid material ID
- `404`: Material not found
- `500`: Server error

---

### POST `/api/materials`
Create a new custom material.

**Request Body:**
```json
{
  "name": "PETG"
}
```

**Required Fields:**
- `name` (string, 1-255 chars): Unique material name

**Response:** `201 Created`
```json
{
  "id": 10,
  "name": "PETG",
  "is_custom": true
}
```

**Error Responses:**
- `400`: Validation error
- `409`: Material with this name already exists
- `500`: Server error

---

### PUT `/api/materials/:id`
Update an existing material.

**Path Parameters:**
- `id` (integer, required): Material ID

**Request Body:**
```json
{
  "name": "PETG Updated"
}
```

**Required Fields:**
- `name` (string, 1-255 chars)

**Response:** `200 OK`
```json
{
  "id": 10,
  "name": "PETG Updated",
  "is_custom": true
}
```

**Error Responses:**
- `400`: Validation error or invalid ID
- `404`: Material not found
- `409`: Material with this name already exists
- `500`: Server error

---

### DELETE `/api/materials/:id`
Delete a material.

**Path Parameters:**
- `id` (integer, required): Material ID

**Response:** `204 No Content`

**Error Responses:**
- `400`: Invalid material ID
- `403`: Cannot delete predefined material
- `404`: Material not found
- `409`: Material is in use and cannot be deleted
- `500`: Server error

**Notes:**
- Only custom materials (`is_custom: true`) can be deleted
- Materials that are referenced by filaments or templates cannot be deleted


