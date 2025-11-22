# History Page

**File:** `frontend/src/pages/History.tsx`  
**Route:** `/history`

## Overview

The History page displays all consumption entries with comprehensive filtering options and management capabilities.

## Features

### Filtering Section
- **Filament Filter**: Dropdown to filter by specific filament
- **Type Filter**: Dropdown to filter by consumption type
  - All Types
  - Success
  - Failed
  - Test
  - Manual
- **Start Date**: Date picker for start date filter
- **End Date**: Date picker for end date filter
- **Clear Filters**: Button to reset all filters

### Consumption Table
Displays filtered consumption entries with:
- **Created At**: Timestamp formatted as locale string
- **Filament**: Filament name
- **Amount**: Weight in grams (and meters if available)
- **Print Name**: Print name or "-" if not available
- **Type**: Icon and color-coded indicator
- **Actions**: Edit and delete buttons

### Type Indicators
- **Success**: Green checkmark icon
- **Failed**: Red cancel icon
- **Test**: Yellow science icon
- **Manual**: Blue edit icon

### Actions
- **Add Consumption**: Opens Consumption Choice Modal
- **Edit**: Opens Consumption Form Modal in edit mode
- **Delete**: Deletes consumption entry (with confirmation)

## State Management

- `entries`: Array of consumption entries
- `filaments`: Available filaments for filter
- `filters`: Filter state object
  - `filament_id`: Optional filament ID
  - `type`: Optional type string
  - `startDate`: Optional start date string
  - `endDate`: Optional end date string
- `showConsumptionModal`: Controls Consumption Choice Modal
- `showEditModal`: Controls Consumption Form Modal
- `editingConsumptionId`: ID of entry being edited

## Filtering Logic

Filters are applied on the backend:
- `filament_id`: Exact match
- `type`: Exact match
- `startDate`: Entries created on or after this date
- `endDate`: Entries created on or before this date

## Empty States

- **No Entries**: Message when no consumption entries exist
- **No Matches**: Message when filters return no results

## Modals Used

- **ConsumptionChoiceModal**: For creating new consumption entries
- **ConsumptionFormModal**: For editing consumption entries

## API Calls

- `consumptionApi.list(filters)`: Load filtered consumption entries
- `filamentsApi.list(false)`: Load filaments for filter dropdown
- `consumptionApi.delete(id)`: Delete consumption entry


