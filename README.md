<img width="1680" height="887" alt="image" src="https://github.com/user-attachments/assets/d00e7e05-9389-4783-b209-e490d390dab1" />

# StatVault Pro

A lightweight, multi‑dimensional data comparison tool for Windows.

---

## About

StatVault Pro lets you compare multiple entities across any number of numerical dimensions. Define your stats, add your entities, assign values, and explore relationships through six visualization modes – all in a native, memory‑efficient desktop app.

---

## Features

- **Multiple entities** – Add, name, color, and manage any number of entities.
- **Custom stats** – Define your own dimensions (e.g., Strength, Speed, Intelligence, etc.).
- **Six visualization modes** – Switch between Radar, Parallel Areas, Scatter Dots, Pie Chart, Leaderboard, and a raw Data Table.
- **Entity selection** – Click to focus a single entity; Ctrl+click for multi‑select; long‑press on badges for batch selection.
- **Pan & zoom** – Right‑click‑drag to pan, scroll to zoom on the main chart area.
- **Project management** – Save/load entire workspaces as named projects (localStorage). Export/import raw JSON for backup.
- **PNG export** – Capture the current view with optional side panels; copy to clipboard directly.
- **State persistence** – All UI states (collapsed panels, selected entities, active filters) auto‑save to localStorage.
- **Lightweight** – Native Windows executable (no runtime required).

---

## Tech Stack

- **Frontend** – React 19 + Vite 8 + Recharts 3.8.1 + TailwindCSS 4.2.2
- **Desktop Wrapper** – Tauri 2 (Rust backend)
- **Icons** – Lucide React 1.7.0 (140+ icons)
- **Export** – html2canvas‑pro for PNG generation

---

## Installation

### Pre‑built installer
Download the latest `StatVault-Pro_*.msi` from [Releases](https://github.com/Flame21i/STAT-VAULT/releases) and run it.

### Build from source

1. Install prerequisites:
   - [Rust](https://rustup.rs/)
   - [Node.js](https://nodejs.org/)

2. Clone the repo:
   ```bash
   git clone https://github.com/Flame21i/STAT-VAULT.git
   cd STAT-VAULT
   ```

3. Install dependencies:
   ```bash
   npm install
   ```
   This installs:
   - react, react-dom
   - recharts (charting)
   - lucide‑react (icons)
   - html2canvas‑pro (PNG export)
   - tailwindcss, vite, and all build tooling

4. Run in development mode:
   ```bash
   npm run tauri dev
   ```

5. Build the installer:
   ```bash
   npm run tauri build
   ```
   The `.msi` will be in `src-tauri/target/release/bundle/nsis/`.

---

## Usage

1. **Add stats** – Use the `+` button in the left panel to define dimensions.
2. **Toggle filters** – Click any stat to activate/deactivate it for all visualizations.
3. **Add entities** – Use the `+` button in the right panel (Registry).
4. **Edit values** – Select an entity from the Registry to edit its values in the lower half of the right panel.
5. **Change view** – Use the top‑center controls to switch visualization modes.
6. **Interact with charts** – Click an entity in any chart to select it; right‑click‑drag to pan, scroll to zoom.
7. **Save your work** – Use the "Save" input in the left panel to store a project (named snapshot). Load it later via the list below.

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.2.4 | UI framework |
| recharts | 3.8.1 | Chart rendering |
| lucide‑react | 1.7.0 | Icon library |
| html-to-image | 1.11.13 | PNG export |
| @tauri‑apps/cli | 2.11.4 | Desktop wrapper |
| vite | 8.0.1 | Build tool |
| tailwindcss | 4.2.2 | Styling |

---

## Links

- [Releases](https://github.com/Flame21i/STAT-VAULT/releases)
- [Issues](https://github.com/Flame21i/STAT-VAULT/issues)
