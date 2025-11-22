# Templates Page

**File:** `frontend/src/pages/Templates.tsx`  
**Route:** `/templates`

## Overview

The Templates page displays all filament templates in a grid layout and provides management capabilities.

## Features

### Template Grid
- **Responsive Grid**: Cards with minimum 300px width
- **Template Cards**: Each card displays:
  - Template name
  - Material name
  - Manufacturer (if available)
  - Starting weight
  - Empty weight (if set)
  - Notes (if available)

### Template Actions
Each template card has three action buttons:
- **Edit**: Opens Template Form Modal in edit mode
- **Create From Template**: Opens Filament Form Modal pre-filled with template data
- **Delete**: Deletes template (with confirmation)

### Empty State
- Message displayed when no templates exist

## State Management

- `templates`: Array of template objects
- `showFilamentModal`: Controls Filament Form Modal
- `showTemplateModal`: Controls Template Form Modal
- `editingTemplateId`: ID of template being edited
- `selectedTemplateId`: ID of template selected for filament creation

## Template Usage Flow

1. User clicks "Create From Template" on a template card
2. Filament Form Modal opens with template data pre-filled
3. User can modify any values
4. User selects a color (required, not in template)
5. Filament is created with reference to the template

## Modals Used

- **TemplateFormModal**: For creating/editing templates
- **FilamentFormModal**: For creating filaments from templates

## API Calls

- `templatesApi.list()`: Load all templates
- `templatesApi.delete(id)`: Delete template

## Notes

- Templates cannot be deleted if they are in use by filaments
- Templates do not include color (must be selected when creating filament)
- Template name is used as the default filament name


