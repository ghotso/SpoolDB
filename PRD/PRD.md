Alles klar — ich baue **volle Internationalisierung (i18n)** ins PRD ein:

* **Englisch als Standardsprache**
* Weitere Sprachen über einfache **JSON-Dateien**
* Leicht erweiterbar (kein Rebuild nötig, wenn möglich)
* Alle UI-Strings, Labels, Fehlermeldungen, Farben/Materialnamen etc. werden über das i18n-System geladen

Ich liefere dir nun die **vollständig aktualisierte Version des PRD** (Version 1.3), komplett auf Englisch & Markdown, inkl. neuer „Internationalization“-Sektion und entsprechenden Anpassungen.

---

# 📘 **SpoolDB – Product Requirements Document (PRD)**

**Version 1.3 – Manual Filament Management MVP**
*Language: English*
*Format: Markdown*

---

# 1. Product Overview

**SpoolDB** is an open-source filament inventory management system for 3D-printing enthusiasts and makers.

Its core purpose is to:

* Track filament stock across multiple spools
* Log filament consumption
* Provide reusable spool templates
* Allow custom materials and colors
* Provide a clear historical log of consumption
* Be easily extensible through future integrations and plugins
* Ship as a **single Docker container**
* Automatically build & publish to GHCR via GitHub Actions

The MVP is **fully manual**, with **internationalization** and **local SQLite storage**.

---

# 2. Goals & Non-Goals

## 2.1 Goals (MVP)

* Full CRUD for:

  * Spools
  * Consumption entries
  * Templates
  * Custom materials
  * Custom colors
* Manual filament consumption logging
* Inventory overview screen
* Consumption history with editing & deletion
* Template system for quick spool creation
* Full deletion support (spools, entries, templates)
* SQLite as local DB
* Distributed as **one Docker container**
* CI/CD: Build & publish to `ghcr.io` (GHCR) using GitHub Actions & `GH_TOKEN`
* **Internationalization (i18n):**

  * English as default language
  * Additional languages loadable via simple JSON files
  * Translation keys for all UI text

## 2.2 Non-Goals (for MVP)

* Printer API support
* Automatic slicer data imports
* Multi-user system
* Cloud sync
* Mobile app
* Cost analytics
* Print-time duration tracking

---

# 3. Target Users

* 3D printing hobbyists
* Makers with many spools
* Small workshops or labs
* Users who want manual but structured inventory control

Future (post-MVP):

* Print farms
* Makerspaces
* Production environments

---

# 4. Core Features

---

## 4.1 Spool Management

Users can:

* Create spools
* Edit spools
* Delete or force-delete spools
* Archive/unarchive spools
* Link spools to templates

### Spool fields:

* Name
* Material (predefined + custom)
* Color (predefined + custom)
* Manufacturer
* Starting weight (g)
* Empty spool weight (g)
* Remaining weight (g)
* Notes
* Template reference (optional)

### Deletion rules

* Spool with **no consumption entries** → free delete
* Spool with entries → force delete required

  * Deletes all linked consumption entries
  * Updates DB accordingly

---

## 4.2 Manual Consumption Entry

Users log filament usage for prints/tests.

### Fields:

* Spool
* Amount (g, required)
* Amount (meters, optional)
* Print name (optional)
* Type: `success`, `failed`, `test`, `manual`
* Notes

### Editing & Deleting:

* All entries are fully editable
* Deleting an entry restores its grams to the spool

---

## 4.3 Consumption History

A chronological list of all consumption events.

### Features:

* Filtering by spool, date range, type
* Editing entries
* Deleting entries
* Correct spool weight recalculation

---

## 4.4 Inventory Overview

Dashboard shows:

* Spool name
* Material
* Color
* Remaining weight (g and %)
* Progress bar
* Quick actions
* Low-stock indicator (<20%)
* Show/hide archived spools

---

## 4.5 Template System

Templates allow fast creation of similar spools.

### Template fields:

* Template name
* Material
* Manufacturer
* Starting weight
* Empty weight
* Notes

### Template behavior:

* Create/edit/delete templates
* Create spools from templates (prefilled fields)

Templates do not track consumption.

---

## 4.6 Custom Materials & Colors

### Materials:

* Predefined list (PLA, PETG, ABS…)
* Users can create/edit/delete custom materials
* If a material is in use, deletion is blocked

### Colors:

* Predefined basic colors (Black, White, Red…) with optional HEX
* Users can create/edit/delete colors
* If in use, deletion is blocked

---

# 5. Internationalization (i18n)

## 5.1 Requirements

* The entire UI must support internationalization.
* **English is the default language** bundled with the app.
* Additional languages are loaded from external **JSON files** (simple key-value pairs).
* No rebuild should be required when adding new languages (ideal).
* All strings are referenced by translation keys (e.g., `spool.edit`, `material.add`, `history.empty`).

## 5.2 Translation Files

Format:

```
/locales/
   en.json
   de.json
   fr.json
   ...
```

### JSON structure example:

```json
{
  "app": {
    "title": "SpoolDB"
  },
  "spool": {
    "add": "Add Spool",
    "edit": "Edit Spool",
    "delete": "Delete Spool",
    "remaining": "Remaining"
  },
  "consumption": {
    "add": "Log Consumption",
    "amount_g": "Amount (g)",
    "amount_m": "Amount (m)"
  }
}
```

## 5.3 Runtime Behavior

* At startup, SpoolDB loads the default `en.json`
* Users can select another language in the UI
* Selected language stored in local storage or app settings
* If a translation key is missing:

  * Fallback to English
* New languages can be added by placing a JSON file into `/locales`

## 5.4 Developer Requirements

* No hardcoded UI strings
* All text via i18n translation keys
* JSON validation during development

---

# 6. Data Model (SQLite)

### 6.1 `materials`

| Column    | Type    | Notes               |
| --------- | ------- | ------------------- |
| id        | integer | PK                  |
| name      | text    | unique              |
| is_custom | boolean | user-defined or not |

### 6.2 `colors`

| Column    | Type    | Notes        |
| --------- | ------- | ------------ |
| id        | integer | PK           |
| name      | text    | unique       |
| hex       | text    | optional     |
| is_custom | boolean | user-defined |

### 6.3 `templates`

| Column            | Type    | Notes    |
| ----------------- | ------- | -------- |
| id                | integer | PK       |
| name              | text    | unique   |
| material_id       | integer | FK       |
| manufacturer      | text    | optional |
| starting_weight_g | real    |          |
| empty_weight_g    | real    | optional |
| notes             | text    | optional |

### 6.4 `spools`

| Column             | Type     | Notes             |
| ------------------ | -------- | ----------------- |
| id                 | integer  | PK                |
| name               | text     |                   |
| material_id        | integer  | FK                |
| color_id           | integer  | FK                |
| manufacturer       | text     | optional          |
| starting_weight_g  | real     |                   |
| empty_weight_g     | real     | optional          |
| remaining_weight_g | real     | must stay in sync |
| template_id        | integer  | optional FK       |
| archived           | boolean  |                   |
| created_at         | datetime |                   |

### 6.5 `consumption_entries`

| Column     | Type     | Notes                      |
| ---------- | -------- | -------------------------- |
| id         | integer  | PK                         |
| spool_id   | integer  | FK                         |
| amount_g   | real     | required                   |
| amount_m   | real     | optional                   |
| print_name | text     | optional                   |
| type       | text     | success/failed/test/manual |
| notes      | text     | optional                   |
| created_at | datetime |                            |

---

# 7. Architecture

## 7.1 Single-Container Deployment

SpoolDB ships as **one Docker container**, containing:

* Backend (Node/FastAPI/Go)
* Frontend (React/Vue/Svelte built to static assets)
* SQLite file

Exposed port: `8080` (or configurable via `PORT`).

SQLite file is stored at:

```
/data/spooldb.sqlite
```

(Volume mount recommended)

---

## 7.2 REST API

Endpoints include:

* `/api/spools`
* `/api/consumption`
* `/api/templates`
* `/api/materials`
* `/api/colors`
* `/api/i18n/list` (optional)
* `/api/i18n/:language` (optional)

---

# 8. CI/CD & GHCR Deployment

## 8.1 GitHub Actions Requirements

* Workflow file: `.github/workflows/build.yml`
* Trigger:

  * Push to `main`
  * Push tags (`v*`)
* Steps:

  1. Checkout repo
  2. Login to GHCR using `${{ secrets.GH_TOKEN }}`
  3. Build Docker image
  4. Tag image:

     * `ghcr.io/<owner>/spooldb:latest`
     * `ghcr.io/<owner>/spooldb:<version>`
  5. Push both tags
  6. Optionally create GitHub Release

## 8.2 Docker Requirements

* Multi-stage build recommended
* Final image must contain:

  * Backend runtime
  * Built frontend assets
  * i18n JSON files in `/locales`
* Should allow mounting the SQLite DB outside the image

---

## 9. Milestones

**Milestone 1 – Core Data & Backend**

* Implement SQLite schema
* Implement repository layer
* Implement basic REST API

**Milestone 2 – UI MVP**

* Spool list
* Spool detail & edit
* Consumption dialog
* History view
* Template management

**Milestone 3 – Dockerization**

* Dockerfile for single-container deployment
* Configurable via environment variables
* Local test: `docker run` and verify basic flows

**Milestone 4 – CI/CD**

* GitHub Actions workflow: build & push to GHCR
* Use `GH_TOKEN` secret for GHCR authentication
* Verify successful pull and run from `ghcr.io`

---

# 10. Future Extensions

* Auto-consumption via printer APIs
* Slicer integrations
* Plugin system
* QR code spool labels
* Multi-user mode
* PocketBase or Postgres backend option

---

# 11. Acceptance Criteria

* All CRUD operations must work
* Deleting entries updates spool weight correctly
* SQLite persists across container restarts
* i18n works:

  * English included
  * Additional languages loadable by adding JSON
* All UI strings pulled from translation files
* Docker image builds locally
* GHCR push works via GitHub Actions & `GH_TOKEN`
* App runs correctly when pulled from GHCR


