---
title: Consumption Choice Modal
sidebar_position: 3
---

# Consumption Choice Modal

**File:** `frontend/src/components/ConsumptionChoiceModal.tsx`

## Overview

A modal dialog that presents users with a choice between manual consumption entry or G-code file upload.

## Props

```typescript
interface ConsumptionChoiceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  filamentId?: number;  // Pre-select filament in manual entry
}
```

## Features

### Initial Choice Screen
- **Upload G-code File**: Button to proceed with G-code upload
- **Manual Entry**: Button to proceed with manual form entry
- **Cancel**: Close modal

### G-code Upload Flow
- Opens GCodeUpload component
- Handles G-code parsing and consumption creation
- Can trigger Filament Form Modal if filament doesn't exist

### Manual Entry Flow
- Opens Consumption Form Modal
- Pre-selects filament if `filamentId` prop is provided

### Filament Creation Flow
- If G-code suggests creating a new filament, opens Filament Form Modal
- Pre-fills with material, color, and name from G-code

## State Management

- `choice`: Current choice (`'gcode' | 'manual' | null`)
- `showFilamentModal`: Controls Filament Form Modal
- `gcodeData`: Data for filament creation from G-code

## Flow Diagram

```
User clicks "Log Consumption"
    ↓
Consumption Choice Modal
    ↓
    ├─→ "Upload G-code" → GCodeUpload Component
    │                       ↓
    │                   Parse G-code
    │                       ↓
    │                   Filament exists?
    │                       ├─→ Yes → Create Consumption
    │                       └─→ No → Filament Form Modal → Create Consumption
    │
    └─→ "Manual Entry" → Consumption Form Modal → Create Consumption
```

## Usage Examples

### Basic Usage
```tsx
<ConsumptionChoiceModal
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```

### With Pre-selected Filament
```tsx
<ConsumptionChoiceModal
  filamentId={filament.id}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```

## Notes

- If `onSuccess` is not provided, falls back to `window.location.reload()`
- G-code upload can suggest creating a new filament if no match is found
- Manual entry always requires filament selection


