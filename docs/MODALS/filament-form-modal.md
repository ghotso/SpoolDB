# Filament Form Modal

**File:** `frontend/src/components/FilamentFormModal.tsx`

## Overview

A modal dialog for creating or editing filaments. Supports creating from templates, G-code data, or from scratch.

## Props

```typescript
interface FilamentFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  filamentId?: number;        // For editing
  templateId?: number;        // For creating from template
  gcodeData?: {              // For creating from G-code
    materialId?: number;
    colorId?: number;
    name?: string;
  };
}
```

## Features

### Form Fields
- **Name** (required): Filament name
- **Template** (optional): Select template to pre-fill
- **Material** (required): Material selection
- **Color** (required): Color picker with visual selector
- **Manufacturer** (optional): Autocomplete with existing manufacturers
- **Notes** (optional): Multi-line text area

### Modes

#### Create Mode
- Empty form
- Can optionally use template or G-code data

#### Edit Mode
- Pre-fills with existing filament data
- Shows loading state while fetching data

#### Template Mode
- Pre-fills from template:
  - Name (from template name)
  - Material
  - Manufacturer
  - Notes
- Color must still be selected

#### G-code Mode
- Pre-fills from G-code metadata:
  - Name (if available)
  - Material ID
  - Color ID

### Color Picker Integration
- Opens Color Picker Modal
- Creates new color if hex code doesn't exist
- Automatically selects newly created color

### Manufacturer Autocomplete
- Extracts unique manufacturers from all filaments
- Provides autocomplete suggestions

## State Management

- `formData`: Form state
- `materials`: Available materials
- `colors`: Available colors
- `templates`: Available templates
- `filaments`: All filaments (for manufacturer list)
- `showColorPicker`: Controls Color Picker Modal
- `loading`: Submit loading state
- `initialLoading`: Initial data loading state

## API Calls

- `materialsApi.list()`: Load materials
- `colorsApi.list()`: Load colors
- `templatesApi.list()`: Load templates
- `templatesApi.get(id)`: Load template data
- `filamentsApi.list(true)`: Load all filaments for manufacturers
- `filamentsApi.get(id)`: Load filament for editing
- `filamentsApi.create(data)`: Create filament
- `filamentsApi.update(id, data)`: Update filament
- `colorsApi.create({ name, hex })`: Create new color

## Usage Examples

### Create New Filament
```tsx
<FilamentFormModal
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```

### Edit Existing Filament
```tsx
<FilamentFormModal
  filamentId={filament.id}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```

### Create From Template
```tsx
<FilamentFormModal
  templateId={template.id}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```

### Create From G-code
```tsx
<FilamentFormModal
  gcodeData={{
    materialId: 1,
    colorId: 5,
    name: "PLA Red"
  }}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadData();
  }}
/>
```


