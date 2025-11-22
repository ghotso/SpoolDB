---
title: Template Form Page
sidebar_position: 8
---

# Template Form Page

**File:** `frontend/src/pages/TemplateForm.tsx`  
**Route:** `/templates/new` or `/templates/:id/edit`

## Overview

The Template Form page provides a full-page form for creating or editing filament templates.

## Features

### Form Fields
- **Name** (required): Template name (must be unique)
- **Material** (required): Select material type
- **Manufacturer** (optional): Manufacturer name
- **Starting Weight** (required): Default starting weight in grams
- **Empty Weight** (optional): Default empty spool weight in grams
- **Notes** (optional): Multi-line text area

## State Management

- `formData`: Form state object
- `materials`: Available materials
- `loading`: Loading state for edit mode

## Form Validation

- Name: Required, 1-255 characters, must be unique
- Material: Required
- Starting Weight: Required, must be positive
- Empty Weight: Optional, must be non-negative

## API Calls

- `materialsApi.list()`: Load materials
- `templatesApi.get(id)`: Load template for editing
- `templatesApi.create(data)`: Create new template
- `templatesApi.update(id, data)`: Update existing template

## Navigation

- On success: Navigates to `/templates` (Templates page)
- Cancel button: Navigates to `/templates` (Templates page)

## Notes

- Template names must be unique
- Templates cannot be deleted if referenced by filaments
- Templates are used to pre-fill filament forms but do not include color selection


