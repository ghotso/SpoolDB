---
title: Filament Form Page
sidebar_position: 3
---

# Filament Form Page

**File:** `frontend/src/pages/FilamentForm.tsx`  
**Route:** `/filaments/new` or `/filaments/:id/edit`

## Overview

The Filament Form page provides a full-page form for creating or editing filaments. It supports creating from templates and pre-filling from G-code data.

## Features

### Form Fields
- **Name** (required): Filament name
- **Template** (optional): Select a template to pre-fill values
- **Material** (required): Select material type
- **Color** (required): 
  - Opens Color Picker Modal
  - Displays selected color with dot and hex code
- **Manufacturer** (optional): Autocomplete with existing manufacturers
- **Notes** (optional): Multi-line text area

### Template Support
- Selecting a template automatically fills:
  - Name (from template name)
  - Material
  - Manufacturer
  - Notes
- Color must still be selected manually

### G-code Pre-fill
- Can be pre-filled from G-code upload flow
- Extracts material, color, and name from G-code metadata

## State Management

- `formData`: Form state object
- `materials`: Available materials
- `colors`: Available colors
- `templates`: Available templates
- `filaments`: All filaments (for manufacturer autocomplete)
- `showColorPicker`: Controls Color Picker Modal visibility
- `pickedColorHex`: Currently selected hex color

## Form Validation

- Name: Required, 1-255 characters
- Material: Required
- Color: Required (must select a color)

## Special Features

### Manufacturer Autocomplete
- Extracts unique manufacturers from all existing filaments
- Provides autocomplete suggestions
- Sorted alphabetically

### Color Picker Integration
- Opens Color Picker Modal when "Pick Color" button is clicked
- Creates new color if hex code doesn't exist
- Automatically selects newly created color

## API Calls

- `materialsApi.list()`: Load materials
- `colorsApi.list()`: Load colors
- `templatesApi.list()`: Load templates
- `templatesApi.get(id)`: Load template for pre-fill
- `filamentsApi.list(true)`: Load all filaments for manufacturer list
- `filamentsApi.get(id)`: Load filament for editing
- `filamentsApi.create(data)`: Create new filament
- `filamentsApi.update(id, data)`: Update existing filament
- `colorsApi.create({ name, hex })`: Create new color from picker

## Navigation

- On success: Navigates to `/` (Inventory page)
- Cancel button: Navigates to `/` (Inventory page)


