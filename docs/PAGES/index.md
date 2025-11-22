---
title: Frontend Pages
sidebar_position: 0
---

# Frontend Pages

Documentation for all frontend page components in SpoolDB.

## Overview

The SpoolDB frontend is built with React and TypeScript, using React Router for navigation. All pages are responsive and support both light and dark themes.

## Page Components

### Main Pages

- **[Inventory Page](./inventory)** - Main landing page displaying all filaments in a grid layout with filtering
- **[Filament Detail Page](./filament-detail)** - Comprehensive view of a single filament with spool management and consumption history
- **[History Page](./history)** - Complete consumption history with advanced filtering options

### Form Pages

- **[Filament Form Page](./filament-form)** - Create or edit filaments with template and G-code support
- **[Consumption Form Page](./consumption-form)** - Manual consumption entry form
- **[Template Form Page](./template-form)** - Create or edit filament templates

### Management Pages

- **[Templates Page](./templates)** - Browse and manage all filament templates
- **[Settings Page](./settings)** - Application settings and custom material management

## Common Features

All pages include:
- **Internationalization**: Full i18n support (English, German)
- **Theme Support**: Light and dark mode
- **Responsive Design**: Mobile-friendly layouts
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

## Navigation

Pages are accessible via React Router:
- `/` - Inventory page
- `/filaments/:id` - Filament detail page
- `/filaments/new` - Create filament
- `/filaments/:id/edit` - Edit filament
- `/consumption/new` - Create consumption entry
- `/consumption/:id/edit` - Edit consumption entry
- `/history` - Consumption history
- `/templates` - Templates page
- `/templates/new` - Create template
- `/templates/:id/edit` - Edit template
- `/settings` - Settings page

## State Management

Pages use React hooks for local state management:
- `useState` for component state
- `useEffect` for data loading
- `useMemo` for computed values
- React Context for global state (i18n, theme)

