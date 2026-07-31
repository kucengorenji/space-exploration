/* ===================================================================
   MULTIPLAYER GAME CONFIGURATION & BALANCING METRICS
   Centralized parameters for multiplayer war mode, domain whitelist,
   fuel/ammo consumption rates, scoring, and shop prices.
   =================================================================== */

export const GAME_CONFIG = {
    meta: {
        totalGameMinutes: 60,
        warPhaseMinutes: 10,
        maxPlayers: 30,
        minPlayersToStart: 2,
    },
    auth: {
        allowedDomains: ['frisseblikken.com', 'fresh-forces.com', 'gmail.com'],
    },
    startingStats: {
        credits: 500,
        fuel: 1000,
        ammo: 200,
        hp: 100,
        probes: 15,
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
        resourceToCreditsRate: { eezo: 10, plat: 6, palla: 8, iri: 7 },
        warZoneHarvestMultiplier: 2.0,
    }
};
