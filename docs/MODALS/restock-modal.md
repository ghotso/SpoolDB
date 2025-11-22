# Restock Modal

**File:** `frontend/src/components/RestockModal.tsx`

## Overview

A modal dialog for restocking a filament by adding new spools.

## Props

```typescript
interface RestockModalProps {
  onClose: () => void;
  filamentId?: number;  // Pre-select filament
  onSuccess?: () => void;
}
```

## Features

### Form Fields
- **Filament** (required if `filamentId` not provided): Filament selection dropdown
- **Filament Info Display**: Shows selected filament details (material, color, manufacturer)
- **Amount of Spools** (required): Number of spools to add (minimum 1)
- **Weight per Spool (g)** (required): Weight per spool in grams (minimum 0.1)
- **Empty Weight (g)** (optional): Empty spool weight in grams

### Behavior
- If `filamentId` is provided, filament selector is hidden
- Displays selected filament information with color dot
- Validates all inputs before submission
- Creates multiple spools based on quantity

## State Management

- `filaments`: Available filaments (non-archived only)
- `selectedFilamentId`: Selected filament ID
- `quantity`: Number of spools to add
- `weightPerSpool`: Weight per spool in grams
- `emptyWeight`: Empty spool weight (optional)
- `loading`: Submit loading state

## API Calls

- `filamentsApi.list(false)`: Load non-archived filaments
- `filamentsApi.restock(id, quantity, weightPerSpool, emptyWeight)`: Add spools

## Usage Examples

### Restock Specific Filament
```tsx
<RestockModal
  filamentId={filament.id}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```

### Restock Any Filament
```tsx
<RestockModal
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```

## Notes

- Creates multiple spools in a single operation
- All spools use the same weight values
- Filament's `remaining_weight_g` is automatically updated
- If `onSuccess` is not provided, falls back to `window.location.reload()`

