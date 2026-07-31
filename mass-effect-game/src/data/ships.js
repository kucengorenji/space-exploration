/* ===================================================================
   STARSHIP HANGAR CATALOG & SPECIFICATIONS DATA
   =================================================================== */

export const SHIPS_DATA = {
    normandy: {
        id: 'normandy',
        name: 'SSV Normandy SR-3',
        class: 'Stealth Frigate',
        maxSpeed: 1.5,
        turnRate: 0.15,
        laserColor: 0x38bdf8,
        description: 'Advanced Alliance stealth reconnaissance frigate equipped with Tantalus drive core.'
    },
    interceptor: {
        id: 'interceptor',
        name: 'Apex Interceptor',
        class: 'Scout Fighter',
        maxSpeed: 2.1,
        turnRate: 0.22,
        laserColor: 0xf97316,
        description: 'High-speed interceptor designed for dogfighting and fast orbital recon.'
    },
    dreadnought: {
        id: 'dreadnought',
        name: 'Titan Dreadnought',
        class: 'Heavy Cruiser',
        maxSpeed: 1.1,
        turnRate: 0.10,
        laserColor: 0xf59e0b,
        description: 'Heavy armored capital vessel equipped with twin dreadnought cannons.'
    },
    shadow: {
        id: 'shadow',
        name: 'Shadow Phantom',
        class: 'Stealth Spec SpecOps',
        maxSpeed: 1.8,
        turnRate: 0.18,
        laserColor: 0x06b6d4,
        description: 'Experimental black-ops vessel featuring energy wing array.'
    }
};
