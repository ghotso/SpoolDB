# Consumption API

Complete API reference for consumption entry management endpoints.

## Base Path
`/api/consumption`

## Overview

Consumption entries track filament usage. They can be created manually or automatically from G-code file uploads. Consumption automatically deducts weight from the appropriate spool.

## Endpoints

### GET `/api/consumption`
List all consumption entries with optional filters.

**Query Parameters:**
- `filament_id` (integer, optional): Filter by filament ID
- `type` (string, optional): Filter by type (`success`, `failed`, `test`, `manual`)
- `startDate` (string, optional): Filter entries from this date (YYYY-MM-DD)
- `endDate` (string, optional): Filter entries until this date (YYYY-MM-DD)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "filament_id": 1,
    "amount_g": 50.5,
    "amount_m": 10.2,
    "print_name": "Benchy",
    "type": "success",
    "notes": "Perfect print",
    "created_at": "2024-01-01T00:00:00.000Z",
    "filament": {
      "id": 1,
      "name": "PLA Red",
      ...
    }
  }
]
```

**Error Responses:**
- `500`: Server error

---

### GET `/api/consumption/:id`
Get a specific consumption entry by ID.

**Path Parameters:**
- `id` (integer, required): Consumption entry ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "filament_id": 1,
  "amount_g": 50.5,
  "amount_m": 10.2,
  "print_name": "Benchy",
  "type": "success",
  "notes": "Perfect print",
  "created_at": "2024-01-01T00:00:00.000Z",
  "filament": {
    "id": 1,
    "name": "PLA Red",
    ...
  }
}
```

**Error Responses:**
- `400`: Invalid consumption entry ID
- `404`: Consumption entry not found
- `500`: Server error

---

### POST `/api/consumption`
Create a new consumption entry.

**Request Body:**
```json
{
  "filament_id": 1,
  "amount_g": 50.5,
  "amount_m": 10.2,
  "print_name": "Benchy",
  "type": "success",
  "notes": "Perfect print"
}
```

**Required Fields:**
- `filament_id` (integer, positive)
- `amount_g` (number, positive): Amount consumed in grams
- `type` (string, enum): `success`, `failed`, `test`, or `manual`

**Optional Fields:**
- `amount_m` (number, non-negative): Amount consumed in meters
- `print_name` (string, max 255 chars): Name of the print
- `notes` (string): Additional notes

**Response:** `201 Created`
```json
{
  "id": 1,
  "filament_id": 1,
  "amount_g": 50.5,
  ...
}
```

**Error Responses:**
- `400`: Validation error or insufficient filament remaining
- `404`: Filament not found
- `500`: Server error

**Note:** The API checks that the filament has sufficient remaining weight before creating the entry. Weight is automatically deducted from the most recently used spool.

---

### PUT `/api/consumption/:id`
Update an existing consumption entry.

**Path Parameters:**
- `id` (integer, required): Consumption entry ID

**Request Body:** (all fields optional)
```json
{
  "filament_id": 1,
  "amount_g": 60.0,
  "amount_m": 12.0,
  "print_name": "Benchy v2",
  "type": "success",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "amount_g": 60.0,
  ...
}
```

**Error Responses:**
- `400`: Validation error, insufficient filament, or invalid ID
- `404`: Consumption entry or filament not found
- `500`: Server error

**Note:** When updating `amount_g`, the system recalculates the weight difference and ensures sufficient filament remains.

---

### DELETE `/api/consumption/:id`
Delete a consumption entry.

**Path Parameters:**
- `id` (integer, required): Consumption entry ID

**Response:** `204 No Content`

**Error Responses:**
- `400`: Invalid consumption entry ID
- `404`: Consumption entry not found
- `500`: Server error

**Note:** Deleting a consumption entry automatically restores the weight to the appropriate spool.

## Consumption Types

- **`success`**: Successful print
- **`failed`**: Failed print (wasted filament)
- **`test`**: Test print or calibration
- **`manual`**: Manual entry (not from a print)

## Automatic Weight Management

- Consumption entries automatically deduct weight from the most recently used spool
- When a spool's weight reaches zero, it is automatically archived
- The filament's `remaining_weight_g` is calculated as the sum of all non-archived spool weights

