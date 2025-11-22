# Colors API

Complete API reference for color management endpoints.

## Base Path
`/api/colors`

## Overview

Colors represent filament colors. Each color can have an optional hex code for visual representation. The system includes predefined colors, and users can create custom colors.

## Endpoints

### GET `/api/colors`
List all colors.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Red",
    "hex": "#FF0000",
    "is_custom": false
  },
  {
    "id": 20,
    "name": "#FF5733",
    "hex": "#FF5733",
    "is_custom": true
  }
]
```

**Error Responses:**
- `500`: Server error

---

### GET `/api/colors/most-used`
Get the most frequently used colors.

**Query Parameters:**
- `limit` (integer, optional): Maximum number of colors to return. Default: `15`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Red",
    "hex": "#FF0000",
    "is_custom": false
  }
]
```

**Error Responses:**
- `500`: Server error

**Note:** Only colors with hex codes are returned. Results are sorted by usage count (descending), then by name (ascending).

---

### GET `/api/colors/:id`
Get a specific color by ID.

**Path Parameters:**
- `id` (integer, required): Color ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Red",
  "hex": "#FF0000",
  "is_custom": false
}
```

**Error Responses:**
- `400`: Invalid color ID
- `404`: Color not found
- `500`: Server error

---

### POST `/api/colors`
Create a new color.

**Request Body:**
```json
{
  "name": "#FF5733",
  "hex": "#FF5733"
}
```

**Required Fields:**
- `name` (string, 1-255 chars): Unique color name

**Optional Fields:**
- `hex` (string, pattern: `^#[0-9A-Fa-f]{6}$`): Hex color code

**Response:** `201 Created`
```json
{
  "id": 20,
  "name": "#FF5733",
  "hex": "#FF5733",
  "is_custom": true
}
```

**Error Responses:**
- `400`: Validation error
- `409`: Color with this name already exists
- `500`: Server error

---

### PUT `/api/colors/:id`
Update an existing color.

**Path Parameters:**
- `id` (integer, required): Color ID

**Request Body:**
```json
{
  "name": "#FF5733",
  "hex": "#FF5733"
}
```

**Required Fields:**
- `name` (string, 1-255 chars)

**Optional Fields:**
- `hex` (string, pattern: `^#[0-9A-Fa-f]{6}$`)

**Response:** `200 OK`
```json
{
  "id": 20,
  "name": "#FF5733",
  "hex": "#FF5733",
  "is_custom": true
}
```

**Error Responses:**
- `400`: Validation error or invalid ID
- `404`: Color not found
- `409`: Color with this name already exists
- `500`: Server error

---

### DELETE `/api/colors/:id`
Delete a color.

**Path Parameters:**
- `id` (integer, required): Color ID

**Response:** `204 No Content`

**Error Responses:**
- `400`: Invalid color ID
- `403`: Cannot delete predefined color
- `404`: Color not found
- `409`: Color is in use and cannot be deleted
- `500`: Server error

**Notes:**
- Only custom colors (`is_custom: true`) can be deleted
- Colors that are referenced by filaments cannot be deleted


