# 🎮 MULTIPLAYER WAR MODE — MASTER PLAN & AI PROMPTING GUIDE

---

## 1. Executive Overview

Mengubah game single-player Mass Effect Space Exploration menjadi **multiplayer real-time war game** untuk max 30 pemain secara bersamaan. Pemain saling berebut resource, bertempur di planet aktif, upgrade kapal & kendaraan, dan bersaing di leaderboard selama 60 menit per sesi.

---

## 2. Difficulty & Feasibility Analysis

### 🔴 Overall Difficulty: **HIGH** (Skala 8/10)

| Aspek | Difficulty | Keterangan |
|-------|-----------|------------|
| **Firebase Auth + SSO** | 🟢 Easy (2/10) | Google Sign-In SDK. Whitelist domain email via Cloud Function. |
| **Waiting Room & Room System** | 🟡 Medium (5/10) | Firestore `onSnapshot` real-time listener untuk lobby state. |
| **Real-time Ship/Vehicle Sync** | 🔴 Hard (9/10) | 30 entitas bergerak @ 60fps. Solusi: Sync rate 10 Hz via Firebase Realtime Database + Client Interpolation. |
| **Combat (HP, Damage, Hit Detection)** | 🔴 Hard (8/10) | Server-authoritative hit validation di Cloud Functions untuk anti-cheat. |
| **War Rotation Timer (Server-side)** | 🟡 Medium (5/10) | Cloud Function scheduled trigger atau Firestore server timestamp comparison. |
| **Shop & Upgrade System** | 🟡 Medium (4/10) | Atomic CRUD operations di Firestore via transactions. |
| **Fuel & Ammo System** | 🟢 Easy (3/10) | Modular extension of `gameState.normandy` — tambah field `ammo`, `fuel`. |
| **Leaderboard & Endgame** | 🟢 Easy (3/10) | Firestore query `orderBy('score', 'desc').limit(30)`. |
| **Anti-cheat & Security** | 🔴 Hard (8/10) | Security Rules + Cloud Functions validation. |

---

## 3. Recommended Tech Stack

```
[ Client (Browser) ]
  ├── Vite + Three.js Game (Existing)
  └── Firebase JS SDK v10 (Auth, Firestore, Realtime DB)

[ Firebase Backend ]
  ├── Firebase Auth (Google SSO with domain restriction)
  ├── Cloud Firestore (Lobby rooms, inventory, shop, leaderboard)
  ├── Firebase Realtime Database (10Hz position sync for 30 ships/vehicles)
  └── Cloud Functions v2 (War rotation timer, hit/damage validation)
```

---

## 4. Modular Game Configuration (`src/multiplayer/config.js`)

Semua variabel balancing, timer, harga shop, dan konsumsi bahan bakar ditaruh dalam 1 file modular agar mudah di-tuning di kemudian hari:

```javascript
export const GAME_CONFIG = {
    meta: {
        totalGameMinutes: 60,
        warPhaseMinutes: 10,
        maxPlayers: 30,
        minPlayersToStart: 2,
    },
    auth: {
        allowedDomains: ['frisseblikken.com', 'fresh-forces.com'],
    },
    startingStats: {
        credits: 500,
        fuel: 1000,
        ammo: 200,
        hp: 100,
        probes: 10,
    },
    fuel: {
        maxAmount: 2000,
        spaceConsumptionPerSec: 0.5,
        surfaceConsumptionPerSec: 0.3,
        boostMultiplier: 3.0,
    },
    ammo: {
        maxAmount: 500,
        perLaserShot: 1,
    },
    combat: {
        baseLaserDamage: 10,
        warZoneDamageBonus: 1.5,
        respawnSeconds: 10,
        deathCreditPenalty: 50,
        deathCargoLossPercent: 10,
    },
    scoring: {
        killPoints: 100,
        warZoneKillBonus: 50,
        harvestPointsPer100: 50,
        survivalBonusPerPhase: 25,
        deathPenaltyPoints: -20,
    },
    economy: {
        resourceToCreditsRate: { eezo: 5, plat: 3, palla: 4, iri: 4 },
        warZoneHarvestMultiplier: 2.0,
    }
};
```

---

## 5. Core Game Loop & Rotation Flow

```
TOTAL GAME TIMER: 60 MINUTES
├── Phase 1 (00:00 - 10:00): 🔥 PYROS IV — ACTIVE WAR ZONE (2x Harvest, 1.5x Damage, +50 Kill Bonus)
├── Phase 2 (10:00 - 20:00): 🌿 AETHEL PRIME — ACTIVE WAR ZONE
├── Phase 3 (20:00 - 30:00): ❄️ GLACIES IX — ACTIVE WAR ZONE
├── Phase 4 (30:00 - 40:00): 🪐 KRONOS MAJOR — ACTIVE WAR ZONE
├── Phase 5 (40:00 - 50:00): 🏜️ AEGIS DESERT — ACTIVE WAR ZONE
├── Phase 6 (50:00 - 60:00): 🛸 HESTIA RELAY — ACTIVE WAR ZONE
└── GAME OVER (60:00) ➔ Redirect to Endgame Leaderboard Screen
```

---

## 6. Shop Items Catalog

| Item | Category | Cost (Credits) | Effect |
|------|----------|----------------|--------|
| **Interceptor X** | Ship | 800 | +50% speed, -20% hull |
| **Corvette MK3** | Ship | 1200 | +30% speed, +10% hull |
| **Dreadnought** | Ship | 2000 | -20% speed, +100% hull, +50% damage |
| **Hover Fighter** | Vehicle | 600 | Flight mode on planet, +40% speed |
| **Heavy Tank** | Vehicle | 1500 | +80% hull, +100% damage |
| **Ammo Pack ×100** | Consumable | 200 | +100 amunisi |
| **Fuel Cell ×500** | Consumable | 150 | +500 bahan bakar |
| **Shield Booster** | Upgrade | 500 | +25 Max HP |
| **Turbo Engine** | Upgrade | 700 | +15% Max Speed |

---

## 7. 🤖 STEP-BY-STEP AI AGENT PROMPTING GUIDE

Gunakan prompt di bawah ini secara bertahap (satu demi satu) untuk di-execute oleh AI Agent (Google Antigravity / Claude / Cursor) agar implementasi berjalan rapi tanpa memecahkan fitur single-player yang sudah ada.

---

### 📍 PHASE 1: Modular Config & Firebase Setup

**Objective**: Menyiapkan file konfigurasi modular dan koneksi dasar Firebase Auth.

**Prompt untuk AI Agent:**
```text
PROMPT PHASE 1:
Please implement the foundation for Multiplayer War Mode in mass-effect-game:

1. Create `src/multiplayer/config.js` containing the `GAME_CONFIG` object with all game balancing parameters (timers, domains, starting stats, fuel/ammo consumption rates, scoring, and economy).
2. Install `firebase` package: `npm install firebase`.
3. Create `src/multiplayer/firebase.js` that initializes Firebase App, Auth, Firestore, and Realtime Database using Vite environment variables (`import.meta.env.VITE_FIREBASE_*`).
4. Create `src/multiplayer/auth.js` for Google SSO login with domain validation enforcing email ending in `@frisseblikken.com` or `@fresh-forces.com`.
5. Create `src/ui/loginScreen.js` modal overlay for SSO authentication.

Ensure existing single-player mode works seamlessly without regression.
Run `npm run build` to verify compilation.
```

---

### 📍 PHASE 2: Room System & Waiting Room UI

**Objective**: Membuat sistem room (Lobby & Waiting Room) dengan ready counter.

**Prompt untuk AI Agent:**
```text
PROMPT PHASE 2:
Please implement the Room System and Waiting Room UI:

1. Create `src/multiplayer/roomManager.js`:
   - `createRoom(masterPlayer)`: Creates a new Firestore document in `rooms` collection with room code, config from `GAME_CONFIG`, and status "waiting".
   - `joinRoom(roomId, player)`: Adds player to `rooms/{roomId}/players` subcollection (max 30 players).
   - `toggleReady(roomId, uid)`: Toggles player ready state.
   - `startGame(roomId)`: Validates all players are ready and updates room status to "playing" with `gameStartAt: serverTimestamp()`.
2. Create `src/ui/lobbyScreen.js`: UI to list available active rooms or create a new room.
3. Create `src/ui/waitingRoom.js`: UI displaying connected players list, ready count (e.g. "8 / 30 Ready"), ready toggle button, and "START GAME" button (only enabled for Room Master when all ready).

Run `npm run build` to verify clean compilation.
```

---

### 📍 PHASE 3: Realtime Position Sync & Ghost Players

**Objective**: Sinkronisasi posisi 30 kapal/kendaraan pemain di Three.js.

**Prompt untuk AI Agent:**
```text
PROMPT PHASE 3:
Please implement 10Hz Real-Time Position Broadcasting & Ghost Players Rendering:

1. Create `src/multiplayer/positionSync.js`:
   - Uses Firebase Realtime Database path `rooms/{roomId}/positions/{uid}`.
   - Throttle local player position broadcast to 10Hz (every 100ms): `{ x, y, z, rx, ry, rz, spd, mode, vehicleType }`.
   - Listen to all remote players' positions in the same room and apply linear interpolation (LERP) for smooth 60fps local rendering.
2. Modify `src/space/spaceEngine.js`:
   - Add a container `remoteShipsGroup` in Three.js scene.
   - Create/update/destroy remote ship meshes based on `positionSync` updates.
3. Modify `src/surface/surfaceEngine.js`:
   - Add `remoteVehiclesGroup` in Three.js surface scene.
   - Render remote vehicle meshes on the active planet surface.

Run `npm run build` to verify performance and clean execution.
```

---

### 📍 PHASE 4: War Rotation System & Combat Mechanics

**Objective**: Rotasi planet aktif 10 menit + sistem amunisi, HP, dan damage.

**Prompt untuk AI Agent:**
```text
PROMPT PHASE 4:
Please implement the 60-Minute War Rotation System and Fuel/Ammo Combat Mechanics:

1. Create `src/multiplayer/warTimer.js`:
   - Synchronizes 60-minute game countdown and 10-minute active war phase rotation based on server timestamp.
   - Order of war planets: Pyros IV ➔ Aethel Prime ➔ Glacies IX ➔ Kronos Major ➔ Aegis Desert ➔ Hestia Relay.
   - Dispatches custom events on active war zone change.
2. Modify `src/ui/hud.js`:
   - Add top HUD bar for War Rotation Timer: `"⚔️ WAR ZONE: PYROS IV (08:45)"`.
   - Add Fuel gauge (`⛽ FUEL`) and Ammo gauge (`⚡ AMMO`).
   - Add pulsating red aura visual indicator on the active war planet in Space mode.
3. Create `src/multiplayer/combatSync.js`:
   - Handles laser firing events, ammo reduction (`perLaserShot`), fuel consumption while flying/boosting.
   - Calculates hit detection and sends damage events to Firestore.
   - Applies 1.5x damage bonus & 2x harvest bonus on the active War Zone planet.
   - Handles player death, respawn timer (10s), and kill feed HUD notifications.

Run `npm run build` to verify clean build.
```

---

### 📍 PHASE 5: In-Game Shop & Upgrade System

**Objective**: Toko upgrade kapal, kendaraan, amunisi, dan bahan bakar.

**Prompt untuk AI Agent:**
```text
PROMPT PHASE 5:
Please implement the In-Game Shop & Upgrade System:

1. Create `src/multiplayer/shopManager.js`:
   - Uses Firestore transactions to handle item purchases atomically.
   - Checks player credit balance before purchase.
   - Deducts credits and equips purchased item (Ship, Vehicle, Ammo Pack, Fuel Cell, Upgrades).
2. Create `src/ui/shopModal.js`:
   - Sci-Fi shop modal overlay accessible via `[SHOP]` button in Space Mode HUD.
   - Displays all items from `GAME_CONFIG` catalog with prices, icons, stats, and "BUY" buttons.
3. Update `src/core/state.js` to reactively update speed/hull/ammo values upon purchasing upgrades.

Run `npm run build` to test build.
```

---

### 📍 PHASE 6: Endgame Screen & Leaderboard

**Objective**: Halaman skor akhir setelah 60 menit dengan peringkat dan statistik.

**Prompt untuk AI Agent:**
```text
PROMPT PHASE 6:
Please implement the Endgame Screen & Final Leaderboard:

1. Create `src/ui/endgameScreen.js`:
   - Triggered automatically when total 60-minute game timer reaches 00:00.
   - Displays 🥇 🥈 🥉 Top 3 Winners Podium.
   - Displays full 30-player leaderboard table: Rank, Player Name, Kills, Deaths, K/D Ratio, Harvested Resources, Total Score.
   - Displays personal performance summary.
   - "PLAY AGAIN" button to return to Lobby.
2. Create screen router in `src/main.js` to manage smooth state transitions between screens:
   `LOGIN` ➔ `LOBBY` ➔ `WAITING_ROOM` ➔ `GAME` ➔ `ENDGAME`.

Run `npm run build` to confirm complete integration.
```

---

## 8. Summary of File Outputs

| File Path | Description |
|-----------|-------------|
| `src/multiplayer/config.js` | Modular parameters (timers, costs, damage, domains) |
| `src/multiplayer/firebase.js` | Firebase SDK initialization |
| `src/multiplayer/auth.js` | Google SSO + domain restriction |
| `src/multiplayer/roomManager.js` | Lobby & waiting room logic |
| `src/multiplayer/positionSync.js` | 10Hz RTDB position sync |
| `src/multiplayer/warTimer.js` | 60-min total & 10-min war rotation timer |
| `src/multiplayer/combatSync.js` | Ammo, fuel, hit detection, kill feed |
| `src/multiplayer/shopManager.js` | In-game shop transactions |
| `src/ui/loginScreen.js` | SSO Login modal |
| `src/ui/lobbyScreen.js` | Active room browser |
| `src/ui/waitingRoom.js` | Player ready waiting room UI |
| `src/ui/shopModal.js` | Shop overlay UI |
| `src/ui/endgameScreen.js` | Final leaderboard & podium UI |
