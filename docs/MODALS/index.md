---
title: Modal Components
sidebar_position: 0
---

# Modal Components

Documentation for all modal dialog components in SpoolDB.

## Overview

Modal components provide focused, overlay-based interfaces for creating, editing, and managing resources. All modals support keyboard navigation (ESC to close) and include proper accessibility features.

## Modal Components

### Form Modals

- **[Filament Form Modal](./filament-form-modal)** - Create or edit filaments with template and G-code support
- **[Consumption Form Modal](./consumption-form-modal)** - Create or edit consumption entries
- **[Template Form Modal](./template-form-modal)** - Create or edit filament templates

### Action Modals

- **[Consumption Choice Modal](./consumption-choice-modal)** - Choose between manual entry or G-code upload
- **[Restock Modal](./restock-modal)** - Add new spools to existing filaments
- **[Color Picker Modal](./color-picker-modal)** - Visual color selection with most-used colors

## Common Features

All modals include:
- **Backdrop**: Semi-transparent overlay that closes modal on click
- **Close Button**: X button in the top-right corner
- **Keyboard Support**: ESC key closes the modal
- **Loading States**: Proper loading indicators during async operations
- **Form Validation**: Client-side validation with error messages
- **Theme Support**: Full light/dark mode support

## Modal Patterns

### Standard Modal Structure

```tsx
<>
  {/* Backdrop */}
  <div onClick={onClose} />
  
  {/* Modal Content */}
  <Card>
    <header>
      <h2>Title</h2>
      <button onClick={onClose}>×</button>
    </header>
    <form>...</form>
  </Card>
</>
```

### Props Pattern

Most modals follow this props pattern:

```typescript
interface ModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  // Optional: ID for edit mode
  id?: number;
}
```

## Usage Examples

Modals are typically triggered from:
- **Buttons**: Primary action buttons on pages
- **Floating Action Button (FAB)**: Quick access to common actions
- **Table Actions**: Edit/delete buttons in data tables
- **Card Actions**: Action buttons on filament/template cards

## State Management

Modals manage their own internal state and communicate with parent components via callbacks:
- `onClose`: Called when modal should be closed
- `onSuccess`: Called after successful operation (optional)

