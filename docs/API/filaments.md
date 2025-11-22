# Filaments API

Complete API reference for filament management endpoints.

## Base Path
`/api/filaments`

## Endpoints

### GET `/api/filaments`
List all filaments.

**Query Parameters:**
- `archived` (boolean, optional): Include archived filaments. Default: `false`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "PLA Red",
    "material_id": 1,
    "color_id": 5,
    "manufacturer": "Polymaker",
    "template_id": null,
    "notes": "High quality PLA",
    "archived": false,
    "remaining_weight_g": 750.5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "material": { "id": 1, "name": "PLA", "is_custom": false },
    "color": { "id": 5, "name": "Red", "hex": "#FF0000", "is_custom": false },
    "spools": [...]
  }
]
```

**Error Responses:**
- `500`: Server error

---

### GET `/api/filaments/:id`
Get a specific filament by ID.

**Path Parameters:**
- `id` (integer, required): Filament ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "PLA Red",
  "material_id": 1,
  "color_id": 5,
  "manufacturer": "Polymaker",
  "template_id": null,
  "notes": "High quality PLA",
  "archived": false,
  "remaining_weight_g": 750.5,
  "created_at": "2024-01-01T00:00:00.000Z",
  "material": { "id": 1, "name": "PLA", "is_custom": false },
  "color": { "id": 5, "name": "Red", "hex": "#FF0000", "is_custom": false },
  "spools": [...]
}
```

**Error Responses:**
- `400`: Invalid filament ID
- `404`: Filament not found
- `500`: Server error

---

### POST `/api/filaments`
Create a new filament.

**Request Body:**
```json
{
  "name": "PLA Red",
  "material_id": 1,
  "color_id": 5,
  "manufacturer": "Polymaker",
  "template_id": null,
  "notes": "High quality PLA",
  "starting_weight_g": 1000,
  "empty_weight_g": 250
}
```

**Required Fields:**
- `name` (string, 1-255 chars)
- `material_id` (integer, positive)
- `color_id` (integer, positive)

**Optional Fields:**
- `manufacturer` (string, max 255 chars)
- `template_id` (integer, positive)
- `notes` (string)
- `starting_weight_g` (number, positive): Creates initial spool with this weight
- `empty_weight_g` (number, non-negative): Empty spool weight

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "PLA Red",
  ...
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Material or color not found
- `500`: Server error

---

### PUT `/api/filaments/:id`
Update an existing filament.

**Path Parameters:**
- `id` (integer, required): Filament ID

**Request Body:** (all fields optional)
```json
{
  "name": "PLA Red Updated",
  "material_id": 1,
  "color_id": 5,
  "manufacturer": "Polymaker",
  "template_id": null,
  "archived": false,
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "PLA Red Updated",
  ...
}
```

**Error Responses:**
- `400`: Validation error or invalid ID
- `404`: Filament, material, or color not found
- `500`: Server error

---

### DELETE `/api/filaments/:id`
Delete a filament.

**Path Parameters:**
- `id` (integer, required): Filament ID

**Query Parameters:**
- `force` (boolean, optional): Force delete even if filament has consumption entries

**Response:** `204 No Content`

**Error Responses:**
- `400`: Invalid filament ID
- `404`: Filament not found
- `409`: Filament has consumption entries (use `force=true` to delete)
- `500`: Server error

---

### PATCH `/api/filaments/:id/archive`
Archive or unarchive a filament.

**Path Parameters:**
- `id` (integer, required): Filament ID

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
- `400`: Invalid filament ID or invalid request body
- `404`: Filament not found
- `500`: Server error

---

### POST `/api/filaments/:id/restock`
Restock a filament by adding new spools.

**Path Parameters:**
- `id` (integer, required): Filament ID

**Request Body:**
```json
{
  "quantity": 2,
  "weight_per_spool_g": 1000,
  "empty_weight_g": 250
}
```

**Required Fields:**
- `quantity` (integer, minimum 1): Number of spools to add
- `weight_per_spool_g` (number, positive): Weight per spool in grams

**Optional Fields:**
- `empty_weight_g` (number, non-negative): Empty spool weight

**Response:** `200 OK`
```json
{
  "id": 1,
  "remaining_weight_g": 2750.5,
  ...
}
```

**Error Responses:**
- `400`: Invalid filament ID or invalid restock amount
- `404`: Filament not found
- `500`: Server error


