# Settings API

Complete API reference for application settings endpoints.

## Base Path
`/api/settings`

## Overview

Settings are key-value pairs used to store application configuration. Currently used for the restock threshold setting.

## Endpoints

### GET `/api/settings`
Get all settings.

**Response:** `200 OK`
```json
{
  "restock_threshold_g": "100"
}
```

**Error Responses:**
- `500`: Server error

---

### GET `/api/settings/:key`
Get a specific setting by key.

**Path Parameters:**
- `key` (string, required): Setting key

**Response:** `200 OK`
```json
{
  "key": "restock_threshold_g",
  "value": "100"
}
```

**Error Responses:**
- `500`: Server error

---

### PUT `/api/settings/:key`
Update a setting.

**Path Parameters:**
- `key` (string, required): Setting key

**Request Body:**
```json
{
  "value": "150"
}
```

**Required Fields:**
- `value` (string): Setting value

**Response:** `200 OK`
```json
{
  "key": "restock_threshold_g",
  "value": "150"
}
```

**Error Responses:**
- `400`: Invalid input
- `500`: Server error

## Available Settings

### `restock_threshold_g`
- **Type:** String (numeric value)
- **Description:** Threshold in grams for low-stock notifications. Filaments with remaining weight at or below this threshold will appear in notifications.
- **Default:** `"100"`

