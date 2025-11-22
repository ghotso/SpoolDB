# Settings Page

**File:** `frontend/src/pages/Settings.tsx`  
**Route:** `/settings`

## Overview

The Settings page allows users to manage custom materials and configure application settings.

## Features

### Custom Materials Section
- **Add Material**: Input field and button to create new custom materials
- **Material List**: Displays all custom materials with delete buttons
- **Delete Material**: Removes custom material (with confirmation)
  - Only custom materials can be deleted
  - Cannot delete if material is in use

### Restock Threshold Section
- **Current Threshold**: Displays current threshold value
- **Update Threshold**: Input field and save button
- **Description**: Explains what the threshold is used for
- **Validation**: Ensures threshold is a valid non-negative number

### API Documentation Section
- **Open API Docs**: Link to Swagger UI (`/api-docs`)
- **Download OpenAPI Spec**: Link to download JSON spec (`/api-docs.json`)
- **Base URL Display**: Shows the API base URL

## State Management

- `materials`: Array of all materials
- `customMaterials`: Filtered list of custom materials only
- `restockThreshold`: Current threshold value
- `newRestockThreshold`: Pending threshold value
- `newMaterialName`: Input value for new material
- `savingThreshold`: Loading state for threshold save
- `loading`: Initial loading state

## Calculations

### Custom Materials Filter
```typescript
const customMaterials = materials.filter(m => m.is_custom);
```

## API Calls

- `materialsApi.list()`: Load all materials
- `materialsApi.create({ name })`: Create new custom material
- `materialsApi.delete(id)`: Delete custom material
- `settingsApi.get('restock_threshold_g')`: Load current threshold
- `settingsApi.set('restock_threshold_g', value)`: Update threshold

## Validation

- **Material Name**: Cannot be empty
- **Threshold**: Must be a valid number ≥ 0

## Notes

- Predefined materials (not custom) cannot be deleted
- Materials in use by filaments or templates cannot be deleted
- Threshold is stored as a string in the database


