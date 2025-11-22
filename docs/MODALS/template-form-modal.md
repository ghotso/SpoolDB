# Template Form Modal

**File:** `frontend/src/components/TemplateFormModal.tsx`

## Overview

A modal dialog for creating or editing filament templates.

## Props

```typescript
interface TemplateFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  templateId?: number;  // For editing
}
```

## Features

### Form Fields
- **Name** (required): Template name (must be unique)
- **Material** (required): Material selection
- **Manufacturer** (optional): Manufacturer name
- **Starting Weight** (required): Default starting weight in grams
- **Empty Weight** (optional): Default empty spool weight in grams
- **Notes** (optional): Multi-line text area

### Modes

#### Create Mode
- Empty form
- All fields available for input

#### Edit Mode
- Pre-fills with existing template data
- Shows loading state while fetching data

## State Management

- `formData`: Form state
- `materials`: Available materials
- `loading`: Submit loading state
- `initialLoading`: Initial data loading state

## API Calls

- `materialsApi.list()`: Load materials
- `templatesApi.get(id)`: Load template for editing
- `templatesApi.create(data)`: Create template
- `templatesApi.update(id, data)`: Update template

## Usage Examples

### Create New Template
```tsx
<TemplateFormModal
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadTemplates();
  }}
/>
```

### Edit Existing Template
```tsx
<TemplateFormModal
  templateId={template.id}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    setShowModal(false);
    loadTemplates();
  }}
/>
```

## Notes

- Template names must be unique
- Templates cannot be deleted if referenced by filaments
- Templates do not include color (selected when creating filament from template)

