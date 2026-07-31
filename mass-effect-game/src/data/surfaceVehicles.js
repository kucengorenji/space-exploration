/* ===================================================================
   SURFACE RECON VEHICLES HANGAR CATALOG DATA
   Each vehicle has balanced traits:
   - baseHp: Base Hull Integrity (default baseline: 100)
   - baseDamage: Base Cannon Damage (default baseline: 2)
   - speedModifier: Speed Modifier rating (-100 = slowest, 0 = default, +100 = fastest)
   =================================================================== */

export const SURFACE_VEHICLES_DATA = {
    mako: {
        id: 'mako',
        name: 'M-35 Mako Heavy Rover',
        type: '6-Wheel Armored Rover',
        baseHp: 100,
        baseDamage: 2,
        speedModifier: 0,
        maxSpeed: 0.75,
        boostEnergy: 100,
        cannonDamage: 40,
        price: 0, // Default Starting Vehicle
        description: 'Classic Alliance 6-wheel infantry fighting vehicle designed for extreme terrain. Perfectly balanced stats.'
    },
    hover_fighter: {
        id: 'hover_fighter',
        name: 'Sky-Hover Anti-Grav Fighter',
        type: 'Anti-Grav Skimmer',
        baseHp: 85,
        baseDamage: 3,
        speedModifier: 25,
        maxSpeed: 0.95,
        boostEnergy: 120,
        cannonDamage: 30,
        price: 500,
        description: 'High-speed anti-gravity skimmer hovering above terrain and water lakes. Fast & high damage, but lighter armor.'
    },
    apex_speeder: {
        id: 'apex_speeder',
        name: 'Apex Surface Speeder',
        type: 'Trike Recon Speeder',
        baseHp: 65,
        baseDamage: 1,
        speedModifier: 45,
        maxSpeed: 1.1,
        boostEnergy: 140,
        cannonDamage: 25,
        price: 750,
        description: 'Lightweight 3-wheel speeder built for lightning-fast surface exploration. Extremely agile, lower hull integrity.'
    },
    titan_crawler: {
        id: 'titan_crawler',
        name: 'Titan Armored Mobile Crawler',
        type: 'Heavy Siege Tank',
        baseHp: 160,
        baseDamage: 5,
        speedModifier: -30,
        maxSpeed: 0.65,
        boostEnergy: 80,
        cannonDamage: 60,
        price: 1200,
        description: 'Heavy armored mobile siege crawler equipped with double-barrel plasma cannons. High HP & massive damage, slower movement.'
    }
};
