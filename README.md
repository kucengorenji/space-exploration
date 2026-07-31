# 🚀 Mass Effect 3D Web Exploration & Reconnaissance Game

A high-performance, immersive 3D sci-fi web application inspired by the **Mass Effect** universe. Built with **Three.js**, **Vite**, **Tailwind CSS**, and the **Web Audio API**.

---

## 🌟 Key Features

### 🌌 1. Space System Navigation Mode
- **Solar System Exploration**: Navigate an 8K-styled colorful solar system featuring Pyros IV, Aethel Prime, Glacies IX, Kronos Major, Aegis Desert, and Hestia Relay Station.
- **Alliance Starship Hangar**: Switch between 4 distinct starships in real-time:
  - 🚀 **SSV Normandy SR-3**: Tantalus stealth frigate.
  - ⚡ **Apex Interceptor**: High-speed scout fighter.
  - 🛡️ **Titan Dreadnought**: Heavy cruiser equipped with double cannons.
  - 🌌 **Shadow Phantom**: Black-ops spec vehicle with cyan energy wings.
- **Realistic Three.js Lighting & Shadow System**:
  - Dynamic **Solar Core PointLight & Directional Light** emanating from $(0, 0, 0)$.
  - **PCFSoftShadowMap** rendering realistic day/night planet hemisphere contrast and gas giant ring shadows.
  - **Specular Metallic Reflections** on starship hulls and planet surfaces.
- **Orbital Probe Scanning & Survey**: Scan resource densities (Element Zero, Platinum, Palladium, Iridium) and launch mineral extraction probes.

### 🏎️ 2. Planetary Surface Recon Mode
- **Procedural Canvas Sprite Textures**:
  - 🌿 **Grass Field Terrain**: Procedural grass blade canvas texture.
  - 🍃 **Tree Canopy Foliage**: Organic leaf cluster sprite textures.
  - 🪨 **Rock Obstacles**: Craggy slate boulder textures.
  - ☁️ **Volumetric Clouds**: 25 drifting 3D cloud sprites.
- **Surface Recon Vehicle Hangar**:
  - 🚙 **M-35 Mako Heavy Rover**: Classic 6-wheel infantry fighting vehicle.
  - 🛸 **Sky-Hover Anti-Grav Fighter**: Hovering anti-gravity skimmer.
  - 🏎️ **Apex Surface Speeder**: 3-wheel high-speed trike.
  - 🚜 **Titan Armored Crawler**: Heavy siege mobile crawler.
- **Plasma Laser Mining & Combat**:
  - Fire cannon lasers (`LEFT CLICK` / `F`) to mine mineral nodes from a distance or ram nodes directly.
- **Fortnite-Style Holographic Boundary Grid**:
  - Transparent cyan boundary wall enclosing the explorable planet limits with collision bounce feedback.

---

## 🎮 Controls & Keybindings

### 🌌 Space Exploration Mode
| Action | Keybinding |
|---|---|
| **Fly Starship (Diagonals & Roll Tilt)** | <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> / Arrow Keys |
| **Fire Plasma Lasers** | <kbd>LEFT CLICK</kbd> / <kbd>F</kbd> |
| **Rotate 3D Camera** | <kbd>I</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> |
| **Orbital Survey / Scan Menu** | <kbd>E</kbd> / Click Target |
| **Leave Survey Orbit Menu** | <kbd>Q</kbd> |
| **Land Vehicle on Planet (Near Planet)** | <kbd>SPACEBAR</kbd> |

### 🏎️ Planetary Surface Mode
| Action | Keybinding |
|---|---|
| **Drive / Reverse Vehicle** | <kbd>W</kbd> / <kbd>S</kbd> |
| **Steer Left / Right** | <kbd>A</kbd> / <kbd>D</kbd> |
| **Nitro Speed Boost** | <kbd>SHIFT</kbd> |
| **Thruster Jump Boost** | <kbd>SPACEBAR</kbd> |
| **Fire Cannon Lasers** | <kbd>LEFT CLICK</kbd> / <kbd>F</kbd> |
| **Rotate 3D Camera** | <kbd>I</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> |
| **Return to Starship Orbit** | Click **RETURN TO ORBIT** Header Button |

---

## 🛠️ Architecture & Tech Stack

```text
mass-effect-game/
├── src/
│   ├── core/
│   │   ├── state.js          # Reactive GameStateManager with LocalStorage Persistence
│   │   ├── audio.js          # Web Audio API Synthesizer (SFX & Engine Hum)
│   │   └── textures.js       # Procedural Canvas Texture Generators
│   ├── data/
│   │   ├── planets.js        # Planetary Catalog & Resource Densities Data
│   │   ├── ships.js          # Starship Hangar Specifications Data
│   │   ├── surfaceVehicles.js # Recon Vehicles Hangar Data
│   │   └── inventory.js      # Cargo & Resource Schemas
│   ├── space/
│   │   └── spaceEngine.js    # Three.js Space Engine (Sun, Planets, Starships, Shadows)
│   ├── surface/
│   │   └── surfaceEngine.js  # Three.js Surface Engine (Terrain, Physics, Lasers, Clouds)
│   ├── ui/
│   │   └── hud.js            # Reactive HUD Manager (Hangar Dropdowns, Toasts, Reticle)
│   └── main.js               # Application Entry Point & Game Loop
├── index.html                # Tailwind CSS Sci-Fi HUD Container
└── package.json              # Dependencies & Scripts
```

- **Core Technologies**: HTML5, Vanilla JavaScript (ES Modules), Tailwind CSS
- **3D Engine**: Three.js (WebGL, PCFSoftShadowMap, PBR MeshStandardMaterials)
- **Bundler**: Vite
- **Audio**: Web Audio API (Synthesized SFX without external audio asset dependencies)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### Setup & Run Locally
```bash
# Navigate to the project directory
cd mass-effect-game

# Install dependencies
npm install

# Start the Vite local development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser to play!
