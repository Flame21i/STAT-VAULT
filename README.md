# StatVault Pro

> Multi-metric statistical comparison, radar benchmarking, and entity registry analysis dashboard.

StatVault Pro is a reactive, client-side analytics workstation designed for comparative analysis across multi-parameter entities. It combines multi-modal data visualizations, a cross-entity calculation engine, threshold monitoring, undo/redo state history, and high-resolution snapshot exporting in an adaptable light/dark interface.

---

## Table of Contents

- [Key Capabilities](#key-capabilities)
  - [1. Multi-Modal Visualizations](#1-multi-modal-visualizations)
  - [2. Formula & Cross-Entity Engine](#2-formula--cross-entity-engine)
  - [3. Entity & Parameter Registry](#3-entity--parameter-registry)
  - [4. Threshold Triggers & Real-Time Alerts](#4-threshold-triggers--real-time-alerts)
  - [5. Action History & Time Travel](#5-action-history--time-travel)
  - [6. Project Workspaces & Data Portability](#6-project-workspaces--data-portability)
  - [7. PNG Snapshot Studio](#7-png-snapshot-studio)
  - [8. Dual Theme Architecture](#8-dual-theme-architecture)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
  - [Type Checking & Linting](#type-checking--linting)
- [License](#license)

---

## Key Capabilities

### 1. Multi-Modal Visualizations
Switch between six specialized visual representations to analyze multi-attribute distributions:

- **Radar Benchmark**: Polar coordinate radar charts with polygon and concentric circular web geometries. Supports entity overlays, zoom scaling, and label suppression.
- **Parallel Coordinates**: Continuous coordinate trajectories across parameters. Features configurable curve styles (sharp linear vs. smooth monotone interpolation), independent horizontal/vertical axis titles, and adjustable axis spacing.
- **Distribution Dots (Scatter)**: Individual metric coordinate scatter dots with alternating column reference bands.
- **Metric / Entity Pie**: Polar distribution views with solid disc or donut ring architecture, customizable slice separation gaps, and theme-responsive connecting callouts.
- **Data Matrix (Table)**: Spreadsheet-style data matrix with configurable row densities (compact, standard, comfortable), concentration heatmap backdrops, interactive column resizing, and font scaling.
- **Leaderboard Ranking**: Aggregate entity ranking with real-time value badges and comparative progress meters.

### 2. Formula & Cross-Entity Engine
Create derived, computed statistics without external dependencies:

- **Mathematical Parsing**: Supports standard arithmetic operators (`+`, `-`, `*`, `/`, `^`), parenthetical grouping, and common math functions (`abs`, `sqrt`, `round`, `floor`, `ceil`, `log`, `exp`).
- **Statistical Aggregates**: Compute cross-metric or cross-entity reductions (`SUM`, `AVG`, `MIN`, `MAX`, `MEDIAN`, `STDEV`).
- **Cross-Entity Referencing**: Reference baseline or comparator entities in formulas (e.g., `@ENT_01.Speed * 1.2`).
- **Interactive Autocomplete**: Intelligent auto-suggest popup triggered by `@` or `[` for parameters, entities, and calculation templates.
- **Validation & Safety**: Real-time syntax checking, circular dependency prevention, and fallback handling for missing values (`N/A`).

### 3. Entity & Parameter Registry
- **Entity Management**: Create, rename, customize brand colors, toggle visibility, and flag active entities.
- **Multiple Registry Views**:
  - **Normal List View**: Comprehensive cards for each entity displaying all parameter stats, values, visual range indicators, and per-stat `[min - max]` bounds.
  - **Grid View**: Compact 4-column visual matrix of entity tiles.
  - **Compact List View**: Single-row view showing total score aggregates and out-of-range flag badges.
- **Per-Stat Min/Max Bounds**: Configure explicit minimum and maximum bounds for each individual parameter using numeric inputs flanking each slider, in the left filters panel, or via threshold modals.
- **Parameter Controls**: Add continuous parameters, set default ranges, configure manual slider/number inputs, or convert to computed formula metrics.
- **Icon Signatures**: Searchable library of categorized signatures and emojis (Utility, Elements, Science, Media, Vitals, Combat, Creatures) to represent parameters.

### 4. Threshold Triggers & Real-Time Alerts
- **Boundary Configuration**: Define minimum (red warning) and maximum (yellow alert) limits on individual stats, all filters, individual entities, or all entities globally.
- **Visual Alert System**: Animated ping indicators and high-contrast color shifts on out-of-boundary values.
- **Notification Feed**: Live toasts record threshold breaches with clear timestamps and single-click dismiss/clear options.

### 5. Action History & Time Travel
- **Non-Destructive Tracking**: Records all parameter changes, entity creations, deletions, and formula modifications.
- **Duplicate Packing**: Rapid sequential edits (such as dragging a slider) automatically collapse into grouped entries with an `x{count}` multiplier badge.
- **State Restoration**: Click any historical snapshot in the timeline to restore the entire workspace state to that moment.

### 6. Project Workspaces & Data Portability
- **Saved Workspaces**: Store multiple named workspace states in browser local storage.
- **Instant Overwrites & Deletion**: Update existing saved workspaces or remove stale projects.
- **JSON Export / Import**: Download the full system state as JSON or import previous state files.
- **CSV Data Ingestion**: Import tabular CSV datasets to seed entities and attributes.

### 7. PNG Snapshot Studio
- **High-DPI Retina Output**: Export high-resolution (2× retina) PNG image snapshots of any active visualization.
- **Customizable Layout**: Toggle inclusion of the parameter filters strip and entity monitor legend.
- **Real-Time Studio Preview**: Configure visual options (curve interpolation, grid shapes, title distances) directly in the export modal with immediate live preview before downloading.

### 8. Dual Theme Architecture
- **Light & Dark Themes**: Single-click toggle between deep dark mode and crisp high-contrast light mode.
- **Dark Drop Shadows**: Modal windows, dropdowns, and popup panels use multi-layered dark drop shadows for visual separation across both themes.
- **Theme-Adaptive Visuals**: Recharts axes, grid bands, labels, pie callouts, and heatmaps automatically adjust contrast and typography.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + Z` / `Cmd + Z` | Undo last action |
| `Ctrl + Shift + Z` / `Cmd + Shift + Z` | Redo action |
| `Ctrl + X` / `Cmd + X` | Cut / Reset selected parameter |
| `Ctrl + C` / `Cmd + C` | Copy active entity values |
| `Ctrl + S` / `Cmd + S` | Open PNG Snapshot Studio |
| `Ctrl + H` / `Cmd + H` | Clear / reset active filters |
| `Esc` | Dismiss active modal or dropdown |
| `Enter` | Confirm modal input or execute formula |

---

## Architecture & Tech Stack

- **Core Framework**: React 19 (Hooks, Context, Memoization)
- **Language**: TypeScript & Modern ESNext JavaScript
- **Build System**: Vite 6
- **Styling**: Tailwind CSS v4 with custom responsive utilities
- **Charting Engine**: Recharts 3
- **Raster Export**: `html-to-image`
- **Iconography**: Lucide React
- **Animations**: CSS transitions and Motion

---

## Project Directory Structure

```text
├── index.html                   # HTML entry point with metadata and SEO
├── metadata.json                # AI Studio application metadata
├── package.json                 # Project dependencies and script definitions
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
└── src/
    ├── main.tsx                 # React application root mount
    ├── App.jsx                  # Main dashboard layout, hotkeys, and modal root
    ├── index.css                # Global stylesheet and Tailwind imports
    ├── components/
    │   ├── ActionHistory.jsx            # Grouped action log with xCount multipliers
    │   ├── AutocompleteDropdown.jsx     # Formula inline suggestion dropdown
    │   ├── CalculationAutocomplete.jsx  # Token-aware math/function assistant
    │   ├── ChartSettingsModal.jsx       # Chart-specific parameters & universal toggles
    │   ├── FiltersPanel.jsx             # Left sidebar parameter filters & actions
    │   ├── FormulaEditorModal.jsx       # Cross-entity expression editor & validator
    │   ├── IconPickerModal.jsx          # Categorized signature & icon selector
    │   ├── NotificationsToast.jsx       # Live threshold alert toast container
    │   ├── PngExportModal.jsx           # 2x Retina PNG preview & export studio
    │   ├── ProjectsMenu.jsx             # Named workspace manager dropdown
    │   ├── RadarChartComparison.jsx     # Radar benchmarking component
    │   ├── RightPanel.jsx               # Entity registry, sliders, and statistics
    │   ├── StatisticsDrawer.jsx         # Summary metrics drawer (mean, std dev, range)
    │   ├── ThresholdModal.jsx           # Min/Max boundary trigger configuration
    │   ├── Toast.jsx                    # Transient notification feedback
    │   └── VisualizationArea.jsx        # Center viewport rendering the 6 visual modes
    ├── constants/
    │   ├── icons.jsx            # Categorized Lucide icon registry and icon mapping
    │   └── styles.js            # Style palettes and color tokens
    ├── hooks/
    │   └── useAppState.js       # Centralized state store, formulas, and storage
    ├── services/
    │   └── dataService.js       # Default sample seed datasets and templates
    └── utils/
        ├── formulaEngine.js     # Formula execution and entity resolution
        ├── mathParser.js        # Safe expression tokenizer and evaluator
        ├── statistics.js        # Statistical routines (median, stdev, quartiles)
        └── helpers.js           # Utility helpers, colors, and formatting
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher recommended)
- `npm` or `bun` package manager

### Installation
Clone or navigate to the repository directory and install project dependencies:

```bash
npm install
```

### Development Server
Start the local Vite development server on port 3000:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build
Compile TypeScript and bundle optimized static assets for deployment:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Type Checking & Linting
Run the TypeScript compiler to verify type definitions without emitting files:

```bash
npm run lint
```

---

## License

Private and proprietary. All rights reserved.
