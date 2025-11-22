# Consumption Form Page

**File:** `frontend/src/pages/ConsumptionForm.tsx`  
**Route:** `/consumption/new` or `/consumption/:id/edit`

## Overview

The Consumption Form page provides a full-page form for creating or editing consumption entries.

## Features

### Form Fields
- **Filament** (required): Filament selection dropdown with color indicators
- **Remaining Weight Display**: Shows remaining weight for selected filament
- **Amount (g)** (required): Weight consumed in grams
- **Amount (m)** (optional): Length consumed in meters
- **Print Name** (optional): Name of the print
- **Type** (required): Consumption type dropdown
  - Success
  - Failed
  - Test
  - Manual
- **Notes** (optional): Multi-line text area

### Validation
- **Insufficient Filament Warning**: Shows warning if amount exceeds remaining weight
- **Submit Disabled**: Submit button disabled if:
  - No filament selected
  - Amount is 0 or negative
  - Amount exceeds remaining weight (for new entries only)

### Edit Mode
- Pre-fills form with existing consumption data
- Skips remaining weight check (allows editing even if filament is now empty)

## State Management

- `formData`: Form state object
- `filaments`: Available filaments (non-archived only)
- `loading`: Loading state for edit mode

## Pre-fill Support

- Can be pre-filled with `filament_id` from URL query parameter
- Example: `/consumption/new?filament_id=5`

## API Calls

- `filamentsApi.list(false)`: Load non-archived filaments
- `consumptionApi.get(id)`: Load consumption entry for editing
- `consumptionApi.create(data)`: Create new consumption entry
- `consumptionApi.update(id, data)`: Update existing consumption entry

## Navigation

- On success: Navigates to `/history` (History page)
- Cancel button: Navigates to `/history` (History page)


