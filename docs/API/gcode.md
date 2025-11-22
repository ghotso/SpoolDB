# G-code API

Complete API reference for G-code file processing endpoints.

## Base Path
`/api/gcode`

## Overview

The G-code API allows parsing G-code files to extract metadata (material, color, filament usage) and automatically create consumption entries.

## Endpoints

### POST `/api/gcode/parse`
Parse a G-code file and return metadata with suggested filament matches.

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file, required): G-code file to parse (max 10MB)

**Response:** `200 OK`
```json
{
  "metadata": {
    "slicer": "Anycubic Slicer Next",
    "modelName": "Benchy",
    "materialType": "PLA",
    "color": "#FF0000",
    "usedFilamentG": 50.5,
    "usedFilamentM": 10.2,
    "printTime": "2h 30m"
  },
  "suggestedFilaments": [
    {
      "id": 1,
      "name": "PLA Red",
      "material": { "id": 1, "name": "PLA" },
      "color": { "id": 5, "name": "Red", "hex": "#FF0000" },
      "remaining_weight_g": 750.5
    }
  ]
}
```

**Error Responses:**
- `400`: No file uploaded, file too large (>10MB), or parsing error
- `500`: Server error

**Notes:**
- File size limit: 10MB
- Only `.gcode` files are accepted
- The API attempts to match filaments based on material and color from the G-code
- Suggested filaments are sorted by remaining weight (descending)

---

### POST `/api/gcode/upload`
Upload and parse a G-code file to create a consumption entry.

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file, required): G-code file to upload (max 10MB)
- `filament_id` (integer, required): Filament ID to associate consumption with
- `type` (string, optional): Consumption type (`success`, `failed`, `test`, `manual`). Default: `success`

**Response:** `201 Created`
```json
{
  "consumption": {
    "id": 1,
    "filament_id": 1,
    "amount_g": 50.5,
    "amount_m": 10.2,
    "print_name": "Benchy",
    "type": "success",
    "notes": "G-code upload from Anycubic Slicer Next. Print time: 2h 30m",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "metadata": {
    "slicer": "Anycubic Slicer Next",
    "modelName": "Benchy",
    "materialType": "PLA",
    "color": "#FF0000",
    "usedFilamentG": 50.5,
    "usedFilamentM": 10.2,
    "printTime": "2h 30m"
  }
}
```

**Error Responses:**
- `400`: No file uploaded, file too large, parsing error, insufficient filament, or validation error
- `404`: Filament not found
- `500`: Server error

**Notes:**
- File size limit: 10MB
- Only `.gcode` files are accepted
- The API checks that the filament has sufficient remaining weight
- If `usedFilamentG` is not available in the G-code, it estimates from `usedFilamentM` using standard PLA density (1.24 g/cm³) and 1.75mm diameter
- The consumption entry is automatically created and weight is deducted from the filament
- Print name is extracted from the G-code metadata if available

## Supported Slicers

Currently supported:
- **Anycubic Slicer Next**: Full support for material, color, and filament usage extraction

## G-code Parsing

The parser extracts:
- **Slicer name**: Identifies which slicer generated the file
- **Model name**: Name of the 3D model being printed
- **Material type**: Filament material (e.g., PLA, PETG)
- **Color**: Hex color code if available
- **Used filament**: Amount in grams and/or meters
- **Print time**: Estimated print duration

## Rate Limiting

Both endpoints use the upload rate limiter: **100 uploads per hour per IP**.

