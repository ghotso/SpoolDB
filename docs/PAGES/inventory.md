# Inventory Page

**File:** `frontend/src/pages/Inventory.tsx`  
**Route:** `/`

## Overview

The Inventory page is the main landing page of SpoolDB. It displays all filaments in a grid layout with filtering capabilities and provides quick access to common actions.

## Features

### Filament Display
- **Grid Layout**: Responsive grid showing filament cards (minimum 300px width)
- **Filament Cards**: Each card displays:
  - Filament name
  - Material and color (with color dot indicator)
  - Manufacturer (if available)
  - Remaining weight in grams
  - Percentage remaining (calculated from spool weights)
  - Progress bar with color coding:
    - Green: >50% remaining
    - Yellow: 20-50% remaining
    - Red: <20% remaining
  - Low stock warning (if <20% remaining)
  - Archived badge (if archived)

### Filtering
- **Material Filter**: Dropdown to filter by material type
- **Color Filter**: Dropdown with color dots to filter by color
- **Show/Hide Archived**: Toggle to include archived filaments
- **Clear Filters**: Button to reset all filters

### Actions
- **Add Filament**: Opens Filament Form Modal
- **View Details**: Click on card to navigate to Filament Detail page
- **Log Consumption**: Quick button on each card to log consumption for that filament

### Empty States
- **No Filaments**: Message when no filaments exist
- **No Matches**: Message when filters return no results

## State Management

- `filaments`: Array of filament objects
- `materials`: Array of available materials
- `colors`: Array of available colors
- `showArchived`: Boolean for archived toggle
- `selectedMaterialId`: Selected material filter
- `selectedColorId`: Selected color filter
- `showConsumptionModal`: Controls Consumption Choice Modal visibility
- `showFilamentModal`: Controls Filament Form Modal visibility
- `selectedFilamentId`: Filament ID for consumption modal

## Calculations

### Remaining Percentage
```typescript
const calculateRemainingPercent = (filament: Filament): number | null => {
  const nonArchivedSpools = filament.spools.filter(spool => !spool.archived);
  if (nonArchivedSpools.length === 0) return null;
  
  const totalStartingWeight = nonArchivedSpools.reduce((sum, spool) => 
    sum + spool.starting_weight_g, 0);
  const totalEmptyWeight = nonArchivedSpools.reduce((sum, spool) => 
    sum + (spool.empty_weight_g || 0), 0);
  const netWeight = totalStartingWeight - totalEmptyWeight;
  if (netWeight <= 0) return 0;
  
  const remaining = filament.remaining_weight_g || 0;
  return Math.max(0, Math.min(100, (remaining / netWeight) * 100));
};
```

## Modals Used

- **FilamentFormModal**: For creating new filaments
- **ConsumptionChoiceModal**: For logging consumption (manual or G-code)

## API Calls

- `filamentsApi.list(showArchived)`: Load filaments
- `materialsApi.list()`: Load materials
- `colorsApi.list()`: Load colors


