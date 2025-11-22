---
title: Filament Detail Page
sidebar_position: 2
---

# Filament Detail Page

**File:** `frontend/src/pages/FilamentDetail.tsx`  
**Route:** `/filaments/:id`

## Overview

The Filament Detail page provides a comprehensive view of a single filament, including its information, spool management, consumption history, and available actions.

## Features

### Filament Information Card
- **Basic Info**: Name, material, color (with color dot), manufacturer
- **Remaining Weight**: Displayed in grams and percentage
- **Progress Bar**: Visual indicator with color coding (green/yellow/red)
- **Low Stock Warning**: Alert when <20% remaining
- **Notes**: Display filament notes if available
- **Archived Badge**: Shows if filament is archived
- **Spool Count**: Number of spools for this filament

### Quick Actions Card
- **Edit**: Opens Filament Form Modal for editing
- **Restock**: Opens Restock Modal to add new spools
- **Archive/Unarchive**: Toggle archive status
- **Delete**: Delete filament (with confirmation)

### Spools Overview Table
Displays all non-archived spools with:
- **Initial Weight**: Starting weight in grams
- **Remaining Weight**: Current usable weight (weight_g - empty_weight_g)
- **Created Date**: When the spool was created
- **Last Used Date**: Last update timestamp
- **Archive Action**: Button to archive individual spools

**Sorting Logic:**
- Used spools (weight_g != starting_weight_g) appear first
- Then sorted by created_at (oldest first)

### Consumption History Table
Displays all consumption entries for this filament:
- **Created At**: Timestamp of consumption entry
- **Amount**: Weight in grams (and meters if available)
- **Print Name**: Name of the print (if available)
- **Type**: Icon and color-coded type indicator:
  - Success (green checkmark)
  - Failed (red cancel)
  - Test (yellow science icon)
  - Manual (blue edit icon)
- **Actions**: Edit and delete buttons

## State Management

- `filament`: Current filament object
- `consumptionEntries`: Array of consumption entries
- `showConsumptionModal`: Controls Consumption Choice Modal
- `showRestockModal`: Controls Restock Modal
- `showEditModal`: Controls Filament Form Modal (edit mode)
- `editingConsumptionId`: ID of consumption entry being edited

## Actions

### Archive Filament
- Toggles archive status
- Confirmation required

### Delete Filament
- Checks if filament has consumption entries
- Shows different confirmation message if entries exist
- Requires `force=true` parameter if entries exist

### Archive Spool
- Archives individual spool
- Confirmation required

### Edit Consumption
- Opens Consumption Form Modal in edit mode
- Pre-fills with existing consumption data

### Delete Consumption
- Deletes consumption entry
- Confirmation required
- Automatically restores weight to spool

## Modals Used

- **FilamentFormModal**: For editing filament (with `filamentId` prop)
- **RestockModal**: For adding new spools
- **ConsumptionChoiceModal**: For logging new consumption
- **ConsumptionFormModal**: For editing consumption entries

## API Calls

- `filamentsApi.get(id)`: Load filament details
- `filamentsApi.archive(id, archived)`: Archive/unarchive filament
- `filamentsApi.delete(id, force)`: Delete filament
- `consumptionApi.list({ filament_id: id })`: Load consumption entries
- `spoolsApi.archive(spoolId, true)`: Archive spool
- `consumptionApi.delete(id)`: Delete consumption entry


