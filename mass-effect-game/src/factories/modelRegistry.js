/* ===================================================================
   MODULAR 3D ASSET & MODEL REGISTRY FACTORY
   Provides an extensible, plug-and-play architecture for 3D models:
   - Starships
   - Surface Vehicles
   - Flora / Trees
   - Biome Obstacles & Environment Assets
   =================================================================== */

import * as THREE from 'three';

// Shared Procedural Materials
const brightWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.08 });
const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.98, roughness: 0.1 });
const cyanGlowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8, metalness: 0.9 });
const goldGlowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8, metalness: 0.9 });
const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.85 });

/* ===================================================================
   1. STARSHIP 3D MODELS REGISTRY
   =================================================================== */
export const SHIP_MODELS = {
    normandy: () => {
        const group = new THREE.Group();
        const hullGeo = new THREE.ConeGeometry(1.6, 6.8, 8);
        hullGeo.rotateX(Math.PI / 2);
        const hull = new THREE.Mesh(hullGeo, brightWhiteMat);
        hull.castShadow = true; hull.receiveShadow = true;
        group.add(hull);

        const wings = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.3, 2.8), silverMat);
        wings.position.set(0, 0, -1.2);
        wings.castShadow = true; wings.receiveShadow = true;
        group.add(wings);

        const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), cyanGlowMat);
        cockpit.position.set(0, 0.4, 1.2);
        group.add(cockpit);

        const mainEngine = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 2.2, 16), brightWhiteMat);
        mainEngine.rotation.x = Math.PI / 2;
        mainEngine.position.set(0, 0, -3.4);
        group.add(mainEngine);

        const engineGlow = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 16), cyanGlowMat);
        engineGlow.position.set(0, 0, -4.5);
        group.add(engineGlow);

        return group;
    },

    interceptor: () => {
        const group = new THREE.Group();
        const noseGeo = new THREE.ConeGeometry(1.2, 7.5, 8);
        noseGeo.rotateX(Math.PI / 2);
        const nose = new THREE.Mesh(noseGeo, silverMat);
        nose.castShadow = true; nose.receiveShadow = true;
        group.add(nose);

        const deltaWings = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.2, 3.2), new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.85, roughness: 0.15 }));
        deltaWings.position.set(0, 0, -1.0);
        deltaWings.castShadow = true; deltaWings.receiveShadow = true;
        group.add(deltaWings);

        const twinEngine = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 2.5, 12), brightWhiteMat);
        twinEngine.rotation.x = Math.PI / 2;
        twinEngine.position.set(0, 0, -3.2);
        twinEngine.castShadow = true; twinEngine.receiveShadow = true;
        group.add(twinEngine);

        const flare = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
        flare.position.set(0, 0, -4.5);
        group.add(flare);

        return group;
    },

    dreadnought: () => {
        const group = new THREE.Group();
        const hullGeo = new THREE.BoxGeometry(3.2, 1.8, 8.0);
        const hull = new THREE.Mesh(hullGeo, brightWhiteMat);
        hull.castShadow = true; hull.receiveShadow = true;
        group.add(hull);

        const wings = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.4, 3.5), goldGlowMat);
        wings.position.set(0, 0, -1.2);
        wings.castShadow = true; wings.receiveShadow = true;
        group.add(wings);

        const turret1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3.5, 12), silverMat);
        turret1.rotation.x = Math.PI / 2;
        turret1.position.set(-1.2, 1.0, 1.5);
        turret1.castShadow = true; turret1.receiveShadow = true;
        group.add(turret1);

        const turret2 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 3.5, 12), silverMat);
        turret2.rotation.x = Math.PI / 2;
        turret2.position.set(1.2, 1.0, 1.5);
        turret2.castShadow = true; turret2.receiveShadow = true;
        group.add(turret2);

        [-1.4, 0, 1.4].forEach(x => {
            const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 2.2, 12), silverMat);
            eng.rotation.x = Math.PI / 2;
            eng.position.set(x, 0, -4.2);
            eng.castShadow = true; eng.receiveShadow = true;
            group.add(eng);
        });

        return group;
    },

    shadow: () => {
        const group = new THREE.Group();
        const wedgeGeo = new THREE.ConeGeometry(2.2, 7.0, 4);
        wedgeGeo.rotateX(Math.PI / 2);
        const wedge = new THREE.Mesh(wedgeGeo, cyanGlowMat);
        wedge.castShadow = true; wedge.receiveShadow = true;
        group.add(wedge);

        const energyWings = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.15, 2.8), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
        energyWings.position.set(0, 0, -0.8);
        group.add(energyWings);

        return group;
    }
};

/* ===================================================================
   2. SURFACE VEHICLE 3D MODELS REGISTRY
   =================================================================== */
export const VEHICLE_MODELS = {
    mako: () => {
        const group = new THREE.Group();
        const wheels = [];

        const bodyGeo = new THREE.BoxGeometry(3.6, 1.8, 6.2);
        const body = new THREE.Mesh(bodyGeo, darkMetalMat);
        body.position.y = 1.6;
        body.castShadow = true;
        group.add(body);

        const cabinGeo = new THREE.BoxGeometry(2.8, 1.1, 2.5);
        const cabinMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9, emissive: 0x0c4a6e });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(0, 2.3, 0.4);
        group.add(cabin);

        const turretMesh = new THREE.Group();
        turretMesh.position.set(0, 2.7, -0.6);
        turretMesh.add(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.7, 16), new THREE.MeshStandardMaterial({ color: 0x334155 })));

        const barrelGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.2, 12);
        barrelGeo.rotateX(Math.PI / 2);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x64748b });

        const barrel1 = new THREE.Mesh(barrelGeo, barrelMat); barrel1.position.set(-0.35, 0.3, 1.4);
        const barrel2 = new THREE.Mesh(barrelGeo, barrelMat); barrel2.position.set(0.35, 0.3, 1.4);
        turretMesh.add(barrel1, barrel2);
        group.add(turretMesh);

        const wheelGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.8, 18);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
        const wheelOffsets = [
            { x: -2.1, z: 2.1 }, { x: 2.1, z: 2.1 },
            { x: -2.1, z: 0 }, { x: 2.1, z: 0 },
            { x: -2.1, z: -2.1 }, { x: 2.1, z: -2.1 }
        ];
        wheelOffsets.forEach(off => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.position.set(off.x, 1.0, off.z);
            wheel.castShadow = true;
            group.add(wheel);
            wheels.push(wheel);
        });

        return { group, body, wheels, maxSpeed: 0.75 };
    },

    hover_fighter: () => {
        const group = new THREE.Group();
        const bodyGeo = new THREE.ConeGeometry(2.2, 7.5, 6);
        bodyGeo.rotateX(Math.PI / 2);
        const body = new THREE.Mesh(bodyGeo, brightWhiteMat);
        body.position.y = 2.2;
        group.add(body);

        const wings = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.2, 2.5), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 }));
        wings.position.set(0, 2.2, 0);
        group.add(wings);

        [-2.0, 2.0].forEach(x => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.25, 12, 24), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
            ring.rotation.x = Math.PI / 2;
            ring.position.set(x, 1.0, 1.5);
            group.add(ring);
        });

        return { group, body, wheels: [], maxSpeed: 0.95 };
    },

    apex_speeder: () => {
        const group = new THREE.Group();
        const wheels = [];
        const bodyGeo = new THREE.BoxGeometry(2.4, 1.2, 5.8);
        const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.8 }));
        body.position.y = 1.4;
        group.add(body);

        const wheelGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.8, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

        const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
        frontWheel.position.set(0, 1.1, 2.4);
        group.add(frontWheel); wheels.push(frontWheel);

        [-1.8, 1.8].forEach(x => {
            const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
            rearWheel.position.set(x, 1.1, -2.0);
            group.add(rearWheel); wheels.push(rearWheel);
        });

        return { group, body, wheels, maxSpeed: 1.1 };
    },

    titan_crawler: () => {
        const group = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(4.2, 2.2, 7.0);
        const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 }));
        body.position.y = 1.8;
        group.add(body);

        const turret = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.0, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
        turret.position.set(0, 3.1, -0.2);
        group.add(turret);

        const barrelGeo = new THREE.CylinderGeometry(0.25, 0.25, 4.0, 12);
        barrelGeo.rotateX(Math.PI / 2);
        const barrel = new THREE.Mesh(barrelGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        barrel.position.set(0, 3.3, 1.8);
        group.add(barrel);

        return { group, body, wheels: [], maxSpeed: 0.65 };
    }
};

/* ===================================================================
   3. TREE & FLORA 3D MODELS REGISTRY
   =================================================================== */
export const TREE_MODELS = {
    pine: (mats) => {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 4, 8), mats.trunkMat);
        trunk.position.y = 2;
        group.add(trunk);

        for (let tier = 0; tier < 3; tier++) {
            const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2 - tier * 0.7, 4.5, 8), mats.foliagePineMat);
            cone.position.y = 4.2 + tier * 2.6;
            group.add(cone);
        }
        return group;
    },

    oak: (mats) => {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 4.5, 8), mats.trunkMat);
        trunk.position.y = 2.25;
        group.add(trunk);

        const offsets = [{ x: 0, y: 5.5, z: 0, r: 2.8 }, { x: -1.2, y: 4.8, z: 0.8, r: 2.1 }, { x: 1.2, y: 4.8, z: -0.8, r: 2.1 }];
        offsets.forEach(off => {
            const canopy = new THREE.Mesh(new THREE.SphereGeometry(off.r, 12, 12), mats.foliageOakMat);
            canopy.position.set(off.x, off.y, off.z);
            group.add(canopy);
        });
        return group;
    },

    cypress: (mats) => {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 5, 8), mats.trunkMat);
        trunk.position.y = 2.5;
        group.add(trunk);

        const tallCone = new THREE.Mesh(new THREE.ConeGeometry(1.8, 9, 8), mats.foliageCypressMat);
        tallCone.position.y = 6.5;
        group.add(tallCone);
        return group;
    },

    fungus: (mats) => {
        const group = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 5, 12), new THREE.MeshStandardMaterial({ color: 0x0e7490 }));
        stem.position.y = 2.5;
        group.add(stem);

        const cap = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.5, 16), mats.alienFungusMat);
        cap.position.y = 5.2;
        group.add(cap);

        const spore = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        spore.position.y = 4.2;
        group.add(spore);
        return group;
    },

    volcanic_ash_stumps: () => {
        const group = new THREE.Group();
        const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 4, 7), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 }));
        stump.position.y = 2;
        group.add(stump);
        const ember = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        ember.position.y = 3.8;
        group.add(ember);
        return group;
    },

    frozen_crystal_spires: () => {
        const group = new THREE.Group();
        const iceSpire = new THREE.Mesh(new THREE.ConeGeometry(2.2, 9, 6), new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.9 }));
        iceSpire.position.y = 4.5;
        group.add(iceSpire);
        return group;
    },

    desert_cacti: () => {
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 7, 8), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));
        trunk.position.y = 3.5;
        group.add(trunk);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3, 6), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));
        arm.position.set(1.1, 4.2, 0);
        arm.rotation.z = Math.PI / 4;
        group.add(arm);
        return group;
    },

    tech_antennas: () => {
        const group = new THREE.Group();
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.8, 14, 6), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 }));
        tower.position.y = 7;
        group.add(tower);
        const dish = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide }));
        dish.position.y = 12;
        dish.rotation.x = Math.PI / 3;
        group.add(dish);
        return group;
    }
};

/* ===================================================================
   4. EXTENSIBLE API HELPER FUNCTIONS
   =================================================================== */

/** Register a new custom starship model builder function */
export function registerShipModel(id, builderFn) {
    SHIP_MODELS[id] = builderFn;
}

/** Register a new custom vehicle model builder function */
export function registerVehicleModel(id, builderFn) {
    VEHICLE_MODELS[id] = builderFn;
}

/** Register a new custom tree / flora builder function */
export function registerTreeModel(id, builderFn) {
    TREE_MODELS[id] = builderFn;
}

/** Instantiates a starship mesh by model ID */
export function createShipMesh(type = 'normandy') {
    const factory = SHIP_MODELS[type] || SHIP_MODELS.normandy;
    return factory();
}

/** Instantiates a vehicle mesh & state object by model ID */
export function createVehicleMesh(type = 'mako') {
    const factory = VEHICLE_MODELS[type] || VEHICLE_MODELS.mako;
    return factory();
}

/** Instantiates a tree mesh by model ID */
export function createTreeMesh(type = 'pine', mats = {}) {
    const factory = TREE_MODELS[type] || TREE_MODELS.pine;
    return factory(mats);
}
