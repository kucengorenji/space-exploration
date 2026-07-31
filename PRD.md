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
* **Surface Vehicle Hangar Selection**:
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
| <kbd>A</kbd> / <kbd>D</kbd> | Strafe Left / Right | Steer Vehicle Left / Right |
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

## 5. 🌐 Technical Feasibility & Difficulty Analysis: 30-Player Real-Time Multiplayer

### 📊 5.1 Difficulty Rating: **7.5 / 10 (Medium-High)**
Transitioning the current single-player 3D game into a real-time multiplayer environment (max 30 ships in space & 30 surface vehicles in surface mode fighting each other with HP bars & competing for resources) involves the following technical challenges:

1. **Client-Side Prediction & Dead Reckoning (Interpolation)**:
   - Raw positional updates over networks exhibit stuttering without linear interpolation (`Lerp`). Positions must be extrapolated using velocity vectors to guarantee smooth 60 FPS movement.
2. **Lag Compensation & Hit Detection (HP Bars)**:
   - Synchronizing laser bullet trajectories and hitboxes across 30 active clients requiring server-authoritative or lag-compensated hit validation.
3. **Synchronized World State (Resource Nodes)**:
   - Global state synchronization when a player destroys/mines a crystal node so it disappears simultaneously for all 29 other clients.

---

### 🔥 5.2 Firebase Feasibility Analysis

| Firebase Technology | Suitability | Rationale & Performance Impact |
|---|---|---|
| **Cloud Firestore** | ❌ **NOT Recommended** for 3D Motion | Limited to ~1 write/sec per document with 100-300ms latency. Sending 30-60 updates/sec for 30 players will cause severe lag and extreme bill costs. |
| **Realtime Database (RTDB)** | ⚠️ **Feasible for Prototypes Only** | Uses WebSockets with 50-150ms latency. However, 600 writes/sec ($30 \text{ players} \times 20 \text{ ticks/sec}$) will consume high outbound bandwidth unless payload is heavily compressed. |
| **Firebase Auth & Firestore (Hybrid)** | ✅ **RECOMMENDED** for Account & Data | Ideal for Login/Auth, persistent user cargo/inventory, hangar ownership, and global leaderboards. |

---

### 🏗️ 5.3 Recommended Hybrid Multiplayer Architecture

```text
                                [ Client (Three.js Web Browser) ]
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
     [ Firebase Auth & Firestore ]                           [ Realtime WebSocket Server ]
     (User Account, Saved Cargo,                             (Colyseus.js / Node.js / PartyKit)
      Ship Unlocks, Leaderboard)                             - 30-Player Room State Sync
                                                             - Positional Lerp (X, Y, Z, Rot)
                                                             - Laser Bullet Trajectories
                                                             - HP & Shield Combat Sync
                                                             - Shared Resource Node Spawns
```

* **Bandwidth & Data Rate Estimate for 30 Players**:
  $$\text{Data Rate} = 30 \text{ players} \times 20 \text{ packets/sec} = 600 \text{ packets/sec}$$
  * Packet structure: `{ id, x, y, z, rotY, roll, hp, isShooting }` ($\approx 48 \text{ bytes binary payload}$).
  * Total bandwidth required: $\approx 28.8 \text{ KB/sec}$, easily handled by a low-cost Node.js WebSocket server instance.

---

## 6. Future Development Roadmap

1. **Multiplayer Phase 1**: Integrate Firebase Auth for player profile saving and login.
2. **Multiplayer Phase 2**: Deploy WebSocket room server (Colyseus.js) for 30-player space dogfighting and surface Mako combat.
3. **Combat & Enemy Wildlife**: Add hostile Geth drones and planet wildlife with HP bars.
4. **Hangar Upgrades**: Spend harvested Eezo, Platinum, Palladium, and Iridium to upgrade ship shield capacity, engine top speed, and laser damage.
