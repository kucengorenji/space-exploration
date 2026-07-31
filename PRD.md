# 📜 Product Requirements Document (PRD)
## Mass Effect 3D Web Exploration & Reconnaissance Game

---

## 1. Executive Summary & Vision

The **Mass Effect 3D Web Exploration Game** is a lightweight, browser-based 3D action-exploration game built with **Three.js**, **Vite**, **Tailwind CSS**, and **Web Audio API**. 

The goal of the project is to capture the nostalgia and immersion of the Mass Effect franchise—specifically space system navigation, orbital planetary scanning, and Mako surface vehicle reconnaissance—with zero heavy external asset downloads through procedural canvas textures and synthesized Web Audio.

---

## 2. Core Functional Requirements

### 🌌 2.1 Space Navigation & Orbital Survey Engine
* **Solar Core Star & Lighting**:
  * Central Sun at $(0,0,0)$ acting as the primary solar light source (`PointLight` + `DirectionalLight`).
  * `PCFSoftShadowMap` shadow mapping for realistic day/night hemisphere contrast on planets and gas titan ring shadow casting.
  * Multi-layered pulsating solar flare corona and atmosphere halo.
* **Starship Hangar Selection**:
  * Instant switching between 4 starship models (*SSV Normandy SR-3, Apex Interceptor, Titan Dreadnought, Shadow Phantom*).
  * Smooth WASD flight physics with roll banking lean and diagonal vector calculations.
  * Twin plasma laser blasters with audio synthesis.
* **Planetary Catalog & Orbital Survey Modal**:
  * 6 celestial bodies (*Pyros IV, Aethel Prime, Glacies IX, Kronos Major, Aegis Desert, Hestia Relay Station*).
  * Target reticle lock-on and orbital proximity banners.
  * Interactive survey modal with element density bars (Element Zero, Platinum, Palladium, Iridium).
  * Probe launching system extracting resources into global cargo state.

### 🏎️ 2.2 Planetary Surface Reconnaissance Engine
* **Procedural Environment & Textures**:
  * Dynamic terrain heightmap generation with lake dips and flat landing zone.
  * Procedural canvas grass field texture for ground mesh.
  * Procedural leaf cluster textures for tree canopy cones.
  * Slate rock obstacle textures.
  * 25 drifting volumetric cloud sprites.
* **Surface Recon Vehicle Hangar Selection**:
  * Instant switching between 4 surface vehicles (*M-35 Mako Heavy Rover, Sky-Hover Anti-Grav Fighter, Apex Surface Speeder, Titan Armored Mobile Crawler*).
  * Driving physics: Acceleration, reverse, steer interpolation, nitro boost (`SHIFT`), and thruster jump (`SPACEBAR`).
* **Resource Node Harvesting & Mining**:
  * Mineral crystal nodes spawning across terrain.
  * Distance laser mining (`LEFT CLICK` / `F`) destroying nodes and awarding resources.
  * Direct ramming harvesting.
* **World Boundary Limit**:
  * Holographic Fortnite-style cylindrical grid wall at $R = 182$.
  * Elastic bounce collision physics and warning toast notifications.

### 🧠 2.3 Reactive State Management & Persistence
* Single source of truth (`src/core/state.js`) managing mode (`space` vs `surface`), cargo levels, active ship, active vehicle, and toasts.
* LocalStorage auto-persistence (`mass_effect_state_v3`).

---

## 3. Keybindings & User Controls

| Key | Space Mode Action | Surface Mode Action |
|---|---|---|
| <kbd>W</kbd> / <kbd>S</kbd> | Move Forward / Backward | Accelerate / Reverse |
| <kbd>SHIFT</kbd> | N/A | Nitro Speed Boost |
| <kbd>SPACEBAR</kbd> | **Land Vehicle on Planet** (near planet) / Fire Lasers | Thruster Jump Boost |
| <kbd>LEFT CLICK</kbd> / <kbd>F</kbd> | Fire Plasma Lasers | Fire Cannon Lasers |
| <kbd>I</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> | Rotate 3D Camera | Rotate 3D Camera |
| <kbd>E</kbd> | Open Orbital Survey Modal | N/A |
| <kbd>Q</kbd> | Close Orbital Survey Modal | N/A |

---

## 4. Technical Architecture & Modularization

```text
src/
├── core/             # Core engines (State, Audio, Procedural Textures)
├── data/             # Separated Data Modules (Planets, Ships, Surface Vehicles, Inventory)
├── space/            # Three.js Space Engine & Shadow System
├── surface/          # Three.js Surface Engine & Vehicle Physics
├── ui/               # Sci-Fi HUD & Hangar Manager
└── main.js           # Game Entry Point
```

* **Separation of Concerns**: Data definitions for planets, ships, surface vehicles, and cargo reside in `src/data/` independent of engine rendering logic.

---

## 5. Future Development Roadmap

1. **Multiplayer Expansion (30 Players)**:
   * **Hybrid Architecture**: Firebase Auth & Firestore for persistent inventory + Colyseus.js / Node.js WebSocket room server for 30-player real-time movement, hit registration, and synchronized resource node harvesting.
2. **Combat & Enemy Wildlife**:
   * Hostile Geth drones and planet wildlife on surface terrain with HP bars and combat drops.
3. **Ship & Vehicle Upgrade Upgrades**:
   * Use harvested Eezo, Platinum, Palladium, and Iridium to upgrade laser firepower, boost capacity, and shield strength in the hangar.
