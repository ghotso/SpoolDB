---
title: Consumption Form Modal
sidebar_position: 2
---

# Consumption Form Modal

**File:** `frontend/src/components/ConsumptionFormModal.tsx`

## Overview

A modal dialog for creating or editing consumption entries. Automatically validates remaining filament weight.

## Props

```typescript
interface ConsumptionFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  filamentId?: number;        // Pre-select filament
  consumptionId?: number;     // For editing
}
```

## Features

### Form Fields
- **Filament** (required): Filament selection with color indicators
- **Remaining Weight Display**: Shows remaining weight for selected filament
- **Amount (g)** (required): Weight in grams
- **Amount (m)** (optional): Length in meters
- **Print Name** (optional): Name of the print
- **Type** (required): Consumption type
  - Success
  - Failed
  - Test
  - Manual
- **Notes** (optional): Multi-line text area

### Validation
- **Insufficient Filament Warning**: Shows if amount exceeds remaining weight
- **Submit Disabled**: When:
  - No filament selected
  - Amount is 0 or negative
  - Amount exceeds remaining weight (new entries only)

### Edit Mode Behavior
- Pre-fills with existing consumption data
- Skips remaining weight validation (allows editing even if filament is now empty)
- Shows loading state while fetching data

## State Management

- `formData`: Form state
- `filaments`: Available filaments (non-archived only)
- `loading`: Submit loading state
- `initialLoading`: Initial data loading state

## API Calls

- `filamentsApi.list(false)`: Load non-archived filaments
- `consumptionApi.get(id)`: Load consumption entry for editing
- `consumptionApi.create(data)`: Create consumption entry
- `consumptionApi.update(id, data)`: Update consumption entry

## Usage Examples

### Create New Consumption
```tsx
<ConsumptionFormModal
  filamentId={5}  // Optional: pre-select filament
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```

### Edit Existing Consumption
```tsx
<ConsumptionFormModal
  consumptionId={10}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```

## Notes

- Consumption automatically deducts weight from the most recently used spool
- When a spool reaches zero weight, it is automatically archived
- Editing consumption recalculates weight differences


