/* ===================================================================
   REACTIVE GAME STATE MANAGER WITH MODULAR DATA INJECTION
   =================================================================== */

import { PLANETS_DATA } from '../data/planets.js';
import { SHIPS_DATA } from '../data/ships.js';
import { SURFACE_VEHICLES_DATA } from '../data/surfaceVehicles.js';
import { DEFAULT_CARGO, INITIAL_PROBES_COUNT } from '../data/inventory.js';

class GameStateManager {
    constructor() {
        this.state = {
            mode: 'space', // 'space' | 'surface'
            activePlanet: PLANETS_DATA[0],
            shipType: 'normandy', // 'normandy' | 'interceptor' | 'dreadnought' | 'shadow'
            surfaceVehicleType: 'mako', // 'mako' | 'hover_fighter' | 'apex_speeder' | 'titan_crawler'
            cargo: { ...DEFAULT_CARGO },
            normandy: {
                probes: INITIAL_PROBES_COUNT,
                maxProbes: INITIAL_PROBES_COUNT,
                fuel: 100,
                speed: 0,
                maxSpeed: 1.4
            },
            mako: {
                hull: 100,
                boostEnergy: 100,
                maxBoostEnergy: 100,
                speed: 0,
                harvestedThisSession: { eezo: 0, plat: 0, palla: 0, iri: 0 }
            },
            toasts: [],
            soundEnabled: true,
            graphicsQuality: 'high' // 'high' | 'low'
        };

        this.listeners = new Set();
        this.loadSavedState();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.state));
        this.saveState();
    }

    getState() {
        return this.state;
    }

    setMode(mode) {
        this.state.mode = mode;
        this.notify();
    }

    setShipType(shipType) {
        this.state.shipType = shipType;
        const ship = SHIPS_DATA[shipType];
        const displayName = ship ? `${ship.name} (${ship.class})` : shipType;
        this.addToast(`Active Starship: ${displayName}`, 'success');
        this.notify();
    }

    setSurfaceVehicleType(vType) {
        this.state.surfaceVehicleType = vType;
        const vehicle = SURFACE_VEHICLES_DATA[vType];
        const displayName = vehicle ? vehicle.name : vType;
        this.addToast(`Surface Recon Vehicle: ${displayName}`, 'success');
        this.notify();
    }

    setActivePlanet(planet) {
        this.state.activePlanet = planet;
        this.notify();
    }

    landOnPlanet(planet) {
        if (planet) {
            this.state.activePlanet = planet;
        }
        this.state.mako.harvestedThisSession = { eezo: 0, plat: 0, palla: 0, iri: 0 };
        this.state.mako.hull = 100;
        this.state.mako.boostEnergy = 100;
        this.state.mode = 'surface';
        this.addToast(`Deploying Surface Recon Vehicle on ${this.state.activePlanet.name}...`, 'info');
        this.notify();
    }

    returnToOrbit() {
        const harvested = this.state.mako.harvestedThisSession;
        this.state.cargo.eezo += harvested.eezo;
        this.state.cargo.plat += harvested.plat;
        this.state.cargo.palla += harvested.palla;
        this.state.cargo.iri += harvested.iri;

        this.state.mode = 'space';
        this.addToast(`Returned to Normandy Orbit. Harvested: ${harvested.eezo} Eezo, ${harvested.plat} Plat, ${harvested.palla} Palla, ${harvested.iri} Iridium!`, 'success');
        this.notify();
    }

    harvestResource(type, amount) {
        if (this.state.mako.harvestedThisSession[type] !== undefined) {
            this.state.mako.harvestedThisSession[type] += amount;
            this.notify();
        }
    }

    launchProbe() {
        if (this.state.normandy.probes <= 0) {
            this.addToast('No probes remaining in inventory!', 'warning');
            return false;
        }

        if (!this.state.activePlanet) return false;

        this.state.normandy.probes--;
        const res = this.state.activePlanet.resources;
        const extracted = {
            eezo: Math.min(res.eezo, 15),
            plat: Math.min(res.plat, 15),
            palla: Math.min(res.palla, 15),
            iri: Math.min(res.iri, 15)
        };

        res.eezo = Math.max(0, res.eezo - 15);
        res.plat = Math.max(0, res.plat - 15);
        res.palla = Math.max(0, res.palla - 15);
        res.iri = Math.max(0, res.iri - 15);

        this.state.cargo.eezo += extracted.eezo;
        this.state.cargo.plat += extracted.plat;
        this.state.cargo.palla += extracted.palla;
        this.state.cargo.iri += extracted.iri;

        this.addToast(`Probe deployed to ${this.state.activePlanet.name}. Extracted resources added to cargo!`, 'success');
        this.notify();
        return true;
    }

    /** Add an arbitrary amount of a single resource to cargo */
    addCargo(type, amount) {
        if (this.state.cargo[type] !== undefined && amount > 0) {
            this.state.cargo[type] += amount;
            this.notify();
        }
    }

    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        this.addToast(this.state.soundEnabled ? 'Audio Systems Online' : 'Audio Systems Muted', 'info');
        this.notify();
    }

    toggleGraphicsQuality() {
        this.state.graphicsQuality = this.state.graphicsQuality === 'high' ? 'low' : 'high';
        this.addToast(
            this.state.graphicsQuality === 'high' ? 'Graphics: HIGH (Shadows & Solar Glare ON)' : 'Graphics: PERFORMANCE (Shadows OFF / Max FPS)',
            'info'
        );
        this.notify();
    }

    addToast(message, type = 'info') {
        const id = Date.now() + Math.random();
        this.state.toasts.push({ id, message, type });
        this.notify();

        setTimeout(() => {
            this.state.toasts = this.state.toasts.filter(t => t.id !== id);
            this.notify();
        }, 3200);
    }

    saveState() {
        try {
            localStorage.setItem('mass_effect_state_v3', JSON.stringify({
                cargo: this.state.cargo,
                normandy: this.state.normandy,
                shipType: this.state.shipType,
                surfaceVehicleType: this.state.surfaceVehicleType,
                soundEnabled: this.state.soundEnabled,
                graphicsQuality: this.state.graphicsQuality
            }));
        } catch(e) {}
    }

    loadSavedState() {
        try {
            const raw = localStorage.getItem('mass_effect_state_v3');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.cargo) this.state.cargo = parsed.cargo;
                if (parsed.normandy) this.state.normandy = parsed.normandy;
                if (parsed.shipType) this.state.shipType = parsed.shipType;
                if (parsed.surfaceVehicleType) this.state.surfaceVehicleType = parsed.surfaceVehicleType;
                if (parsed.soundEnabled !== undefined) this.state.soundEnabled = parsed.soundEnabled;
                if (parsed.graphicsQuality) this.state.graphicsQuality = parsed.graphicsQuality;
            }
        } catch(e) {}
    }
}

export const gameState = new GameStateManager();
