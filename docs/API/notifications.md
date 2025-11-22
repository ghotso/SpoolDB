# Notifications API

Complete API reference for notification endpoints.

## Base Path
`/api/notifications`

## Overview

Notifications return a list of filaments that need restocking based on the configured restock threshold.

## Endpoints

### GET `/api/notifications`
Get all low-stock notifications.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "PLA Red",
    "material_id": 1,
    "color_id": 5,
    "remaining_weight_g": 75.5,
    "material": { "id": 1, "name": "PLA", "is_custom": false },
    "color": { "id": 5, "name": "Red", "hex": "#FF0000", "is_custom": false }
  }
]
```

**Notes:**
- Returns only non-archived filaments
- Filters filaments where `remaining_weight_g <= restock_threshold_g` and `remaining_weight_g > 0`
- Results are sorted by remaining weight (ascending)
- Uses the `restock_threshold_g` setting from the Settings API

**Error Responses:**
- `500`: Server error

## How It Works

1. The system reads the `restock_threshold_g` setting (default: 100g)
2. It finds all non-archived filaments
3. It filters filaments where remaining weight is at or below the threshold
4. Results are sorted by remaining weight (lowest first)

