/* ===================================================================
   THREE.JS 3D SURFACE ENGINE WITH DYNAMIC ENVIRONMENT ASSETS
   (4 Tree Types, 3 Rock Types, Ancient Prothean Ruins, Bushes & Clouds)
   =================================================================== */

import * as THREE from 'three';
import { gameState } from '../core/state.js';
import { audioEngine } from '../core/audio.js';
import {
    createGrassCanvasTexture,
    createLeavesCanvasTexture,
    createRockCanvasTexture,
    createCloudCanvasTexture
} from '../core/textures.js';

export class SurfaceEngine {
    constructor(containerEl) {
        this.container = containerEl;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.terrainMesh = null;
        this.boundaryMesh = null;
        this.makoGroup = null;
        this.currentVehicleType = null;
        this.makoBodyMesh = null;
        this.makoWheels = [];
        this.normandyLZGroup = null;

        this.resourceNodes = [];
        this.obstacles = [];
        this.clouds = [];
        this.lasers = [];
        this.lastShootTime = 0;
        this.lakes = [
            { x: -55, z: 45, r: 28 },
            { x: 65, z: -70, r: 34 },
            { x: -90, z: -95, r: 26 },
            { x: 95, z: 85, r: 30 }
        ];

        this.particleExplosions = [];
        this.isDestroyed = false;
        this.lastBoundaryToastTime = 0;

        this.makoState = {
            pos: new THREE.Vector3(0, 0, 0),
            speed: 0,
            maxSpeed: 0.75,
            accel: 0.02,
            friction: 0.965,
            angle: 0,
            steerAngle: 0,
            targetSteerAngle: 0,
            maxSteer: 0.038,
            jumpVel: 0,
            isGrounded: true
        };

        this.keys = {};
        this.cameraDistance = 22;
        this.cameraPitch = 0.32;
        this.cameraYaw = 0;
        this.isMouseDown = false;

        this.init();
    }

    getTerrainHeight(x, z) {
        let h1 = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 5.5;
        let h2 = Math.sin(x * 0.05 + 1.2) * Math.sin(z * 0.04) * 2.8;
        let h3 = Math.cos(x * 0.09) * Math.sin(z * 0.09) * 1.2;
        let height = h1 + h2 + h3;

        const distFromCenter = Math.sqrt(x * x + z * z);
        const flatFactor = Math.min(1, Math.max(0, (distFromCenter - 25) / 35));
        height *= flatFactor;

        this.lakes.forEach(l => {
            const dist = Math.sqrt((x - l.x) ** 2 + (z - l.z) ** 2);
            if (dist < l.r + 15) {
                const dipFactor = Math.cos(Math.min(1, dist / (l.r + 15)) * Math.PI * 0.5);
                height = height * (1 - dipFactor) - 4.5 * dipFactor;
            }
        });

        return height;
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x38bdf8);
        this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.0016);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        /* ARTIFICIAL LIGHTING SETUP */
        const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x15803d, 1.5);
        this.scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
        sunLight.position.set(120, 180, 90);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        this.buildTerrain();
        this.buildFortniteBoundaryWall();
        this.buildLakes();
        this.buildNormandyLZ();
        this.updateVehicleModel(gameState.getState().surfaceVehicleType);
        this.spawnObstacles();
        this.spawnSurfaceAssets();
        this.spawnResourceNodes();
        this.spawnFloatingClouds();

        this.setupEvents();
    }

    buildTerrain() {
        const size = 400;
        const segments = 130;
        const geo = new THREE.PlaneGeometry(size, size, segments, segments);
        geo.rotateX(-Math.PI / 2);

        const posAttr = geo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const z = posAttr.getZ(i);
            posAttr.setY(i, this.getTerrainHeight(x, z));
        }
        geo.computeVertexNormals();

        const grassTex = createGrassCanvasTexture();
        const mat = new THREE.MeshStandardMaterial({
            map: grassTex,
            color: 0xffffff,
            roughness: 0.75,
            metalness: 0.1
        });
        this.terrainMesh = new THREE.Mesh(geo, mat);
        this.terrainMesh.receiveShadow = true;
        this.scene.add(this.terrainMesh);
    }

    buildFortniteBoundaryWall() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(2, 6, 23, 0.4)';
        ctx.fillRect(0, 0, 256, 256);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        ctx.strokeRect(0, 0, 256, 256);

        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        for (let i = 32; i < 256; i += 32) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
        }

        const gridTex = new THREE.CanvasTexture(canvas);
        gridTex.wrapS = THREE.RepeatWrapping;
        gridTex.wrapT = THREE.RepeatWrapping;
        gridTex.repeat.set(40, 8);

        const boundaryGeo = new THREE.CylinderGeometry(185, 185, 80, 64, 16, true);
        const boundaryMat = new THREE.MeshBasicMaterial({
            map: gridTex,
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide
        });

        this.boundaryMesh = new THREE.Mesh(boundaryGeo, boundaryMat);
        this.boundaryMesh.position.y = 35;
        this.scene.add(this.boundaryMesh);
    }

    buildLakes() {
        this.lakes.forEach(l => {
            const lakeGeo = new THREE.CircleGeometry(l.r, 48);
            lakeGeo.rotateX(-Math.PI / 2);
            const lakeMat = new THREE.MeshStandardMaterial({
                color: 0x0284c7,
                emissive: 0x0369a1,
                emissiveIntensity: 0.2,
                roughness: 0.05,
                metalness: 0.9,
                transparent: true,
                opacity: 0.85
            });
            const water = new THREE.Mesh(lakeGeo, lakeMat);
            water.position.set(l.x, -1.4, l.z);
            water.receiveShadow = true;
            this.scene.add(water);
        });
    }

    buildNormandyLZ() {
        this.normandyLZGroup = new THREE.Group();
        this.normandyLZGroup.position.set(0, this.getTerrainHeight(0, -35), -35);

        const hullGeo = new THREE.ConeGeometry(6, 32, 8);
        hullGeo.rotateX(Math.PI / 2);
        const hull = new THREE.Mesh(hullGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 }));
        hull.castShadow = true;
        this.normandyLZGroup.add(hull);

        const lzRingGeo = new THREE.RingGeometry(8, 9.5, 32);
        lzRingGeo.rotateX(-Math.PI / 2);
        const lzRing = new THREE.Mesh(lzRingGeo, new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.75 }));
        lzRing.position.y = 0.3;
        this.normandyLZGroup.add(lzRing);

        const beaconGeo = new THREE.CylinderGeometry(0.3, 0.3, 45, 16);
        const beacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 }));
        beacon.position.y = 22.5;
        this.normandyLZGroup.add(beacon);

        this.scene.add(this.normandyLZGroup);
    }

    updateVehicleModel(type = 'mako') {
        if (this.makoGroup) {
            this.scene.remove(this.makoGroup);
        }
        this.currentVehicleType = type;
        this.makoWheels = [];

        const group = new THREE.Group();

        if (type === 'hover_fighter') {
            const bodyGeo = new THREE.ConeGeometry(2.2, 7.5, 6);
            bodyGeo.rotateX(Math.PI / 2);
            this.makoBodyMesh = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.1 }));
            this.makoBodyMesh.position.y = 2.2;
            group.add(this.makoBodyMesh);

            const wingGeo = new THREE.BoxGeometry(6.5, 0.2, 2.5);
            const wings = new THREE.Mesh(wingGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 }));
            wings.position.set(0, 2.2, 0);
            group.add(wings);

            const hoverRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.25, 12, 24), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
            hoverRing1.rotation.x = Math.PI / 2;
            hoverRing1.position.set(-2.0, 1.0, 1.5);
            group.add(hoverRing1);

            const hoverRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.25, 12, 24), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
            hoverRing2.rotation.x = Math.PI / 2;
            hoverRing2.position.set(2.0, 1.0, 1.5);
            group.add(hoverRing2);

            this.makoState.maxSpeed = 0.95;
        } else if (type === 'apex_speeder') {
            const bodyGeo = new THREE.BoxGeometry(2.4, 1.2, 5.8);
            this.makoBodyMesh = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.8 }));
            this.makoBodyMesh.position.y = 1.4;
            group.add(this.makoBodyMesh);

            const wheelGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.8, 16);
            wheelGeo.rotateZ(Math.PI / 2);
            const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

            const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
            frontWheel.position.set(0, 1.1, 2.4);
            group.add(frontWheel);
            this.makoWheels.push(frontWheel);

            const rearLeft = new THREE.Mesh(wheelGeo, wheelMat);
            rearLeft.position.set(-1.8, 1.1, -2.0);
            group.add(rearLeft);
            this.makoWheels.push(rearLeft);

            const rearRight = new THREE.Mesh(wheelGeo, wheelMat);
            rearRight.position.set(1.8, 1.1, -2.0);
            group.add(rearRight);
            this.makoWheels.push(rearRight);

            this.makoState.maxSpeed = 1.1;
        } else if (type === 'titan_crawler') {
            const bodyGeo = new THREE.BoxGeometry(4.2, 2.2, 7.0);
            this.makoBodyMesh = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 }));
            this.makoBodyMesh.position.y = 1.8;
            group.add(this.makoBodyMesh);

            const turret = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.0, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
            turret.position.set(0, 3.1, -0.2);
            group.add(turret);

            const barrelGeo = new THREE.CylinderGeometry(0.25, 0.25, 4.0, 12);
            barrelGeo.rotateX(Math.PI / 2);
            const barrel = new THREE.Mesh(barrelGeo, new THREE.MeshStandardMaterial({ color: 0x0f172a }));
            barrel.position.set(0, 3.3, 1.8);
            group.add(barrel);

            this.makoState.maxSpeed = 0.65;
        } else {
            const bodyGeo = new THREE.BoxGeometry(3.6, 1.8, 6.2);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.85 });
            this.makoBodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
            this.makoBodyMesh.position.y = 1.6;
            this.makoBodyMesh.castShadow = true;
            group.add(this.makoBodyMesh);

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

            const barrel1 = new THREE.Mesh(barrelGeo, barrelMat);
            barrel1.position.set(-0.35, 0.3, 1.4);
            turretMesh.add(barrel1);

            const barrel2 = new THREE.Mesh(barrelGeo, barrelMat);
            barrel2.position.set(0.35, 0.3, 1.4);
            turretMesh.add(barrel2);

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
                this.makoWheels.push(wheel);
            });

            this.makoState.maxSpeed = 0.75;
        }

        const vehicleSpotLight = new THREE.PointLight(0xe0f2fe, 2.5, 30);
        vehicleSpotLight.position.set(0, 4, 0);
        group.add(vehicleSpotLight);

        this.makoGroup = group;
        this.makoGroup.position.copy(this.makoState.pos);
        this.scene.add(this.makoGroup);
    }

    /* 🪨🍃 DYNAMIC OBSTACLES: 4 TREE TYPES & 3 ROCK TYPES */
    spawnObstacles() {
        this.obstacles = [];

        const leavesTex = createLeavesCanvasTexture();
        const rockTex = createRockCanvasTexture();

        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
        const foliagePineMat = new THREE.MeshStandardMaterial({ map: leavesTex, color: 0xffffff, roughness: 0.6 });
        const foliageOakMat = new THREE.MeshStandardMaterial({ map: leavesTex, color: 0x15803d, roughness: 0.5 });
        const foliageCypressMat = new THREE.MeshStandardMaterial({ map: leavesTex, color: 0x4ade80, roughness: 0.6 });
        const alienFungusMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0284c7, emissiveIntensity: 0.6, roughness: 0.2 });

        const rockSlateMat = new THREE.MeshStandardMaterial({ map: rockTex, color: 0xffffff, roughness: 0.85 });
        const rockSpikeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.3 });
        const rockBasaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8, metalness: 0.4 });

        // 1. SPAWN 60 TREES (4 TYPES)
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 32 + Math.random() * 138;
            const tx = Math.sin(angle) * dist;
            const tz = Math.cos(angle) * dist;
            const ty = this.getTerrainHeight(tx, tz);

            if (ty < -0.5) continue;

            const treeType = i % 4; // 0: Pine, 1: Oak, 2: Cypress, 3: Alien Fungus
            const treeGroup = new THREE.Group();
            treeGroup.position.set(tx, ty, tz);

            if (treeType === 0) { // 🌲 PINE CONIFER TREE
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 4, 8), trunkMat);
                trunk.position.y = 2;
                treeGroup.add(trunk);

                for (let tier = 0; tier < 3; tier++) {
                    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2 - tier * 0.7, 4.5, 8), foliagePineMat);
                    cone.position.y = 4.2 + tier * 2.6;
                    treeGroup.add(cone);
                }
            } else if (treeType === 1) { // 🌳 BROAD CANOPY OAK TREE
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 4.5, 8), trunkMat);
                trunk.position.y = 2.25;
                treeGroup.add(trunk);

                const offsets = [
                    { x: 0, y: 5.5, z: 0, r: 2.8 },
                    { x: -1.2, y: 4.8, z: 0.8, r: 2.1 },
                    { x: 1.2, y: 4.8, z: -0.8, r: 2.1 }
                ];
                offsets.forEach(off => {
                    const canopy = new THREE.Mesh(new THREE.SphereGeometry(off.r, 12, 12), foliageOakMat);
                    canopy.position.set(off.x, off.y, off.z);
                    treeGroup.add(canopy);
                });
            } else if (treeType === 2) { // 🌿 CYPRESS TALL NEEDLE TREE
                const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 5, 8), trunkMat);
                trunk.position.y = 2.5;
                treeGroup.add(trunk);

                const tallCone = new THREE.Mesh(new THREE.ConeGeometry(1.8, 9, 8), foliageCypressMat);
                tallCone.position.y = 6.5;
                treeGroup.add(tallCone);
            } else { // 🍄 ALIEN BIOLUMINESCENT FUNGUS TREE
                const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 5, 12), new THREE.MeshStandardMaterial({ color: 0x0e7490 }));
                stem.position.y = 2.5;
                treeGroup.add(stem);

                const cap = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.5, 16), alienFungusMat);
                cap.position.y = 5.2;
                treeGroup.add(cap);

                const spore = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
                spore.position.y = 4.2;
                treeGroup.add(spore);
            }

            this.scene.add(treeGroup);
            this.obstacles.push({ pos: new THREE.Vector3(tx, ty, tz), radius: 2.4, type: 'tree' });
        }

        // 2. SPAWN 50 ROCKS (3 TYPES)
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 135;
            const rx = Math.sin(angle) * dist;
            const rz = Math.cos(angle) * dist;
            const ry = this.getTerrainHeight(rx, rz);

            if (ry < -0.5) continue;

            const rockType = i % 3; // 0: Slate Boulder, 1: Spike Cluster, 2: Basalt Hexagon Columns
            const scale = 1.8 + Math.random() * 2.5;

            if (rockType === 0) { // 🪨 SLATE CRAGGY BOULDER
                const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 1), rockSlateMat);
                rock.position.set(rx, ry + scale * 0.4, rz);
                rock.scale.set(scale, scale * 0.9, scale);
                rock.castShadow = true;
                this.scene.add(rock);
            } else if (rockType === 1) { // ⛰️ JAGGED SHARP ROCK SPIKES
                const group = new THREE.Group();
                group.position.set(rx, ry, rz);
                for (let k = 0; k < 3; k++) {
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.9 * scale, 3.5 * scale, 5), rockSpikeMat);
                    spike.position.set((k - 1) * 0.8 * scale, 1.7 * scale, (Math.random() - 0.5) * scale);
                    spike.rotation.z = (Math.random() - 0.5) * 0.4;
                    group.add(spike);
                }
                this.scene.add(group);
            } else { // 🏛️ BLOCKY BASALT HEXAGONAL COLUMNS
                const group = new THREE.Group();
                group.position.set(rx, ry, rz);
                const colOffsets = [{ x: 0, z: 0, h: 4 }, { x: 1.2, z: 0.8, h: 3 }, { x: -1.2, z: 0.5, h: 3.5 }];
                colOffsets.forEach(c => {
                    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, c.h, 6), rockBasaltMat);
                    col.position.set(c.x, c.h / 2, c.z);
                    group.add(col);
                });
                this.scene.add(group);
            }

            this.obstacles.push({ pos: new THREE.Vector3(rx, ry, rz), radius: scale * 0.9, type: 'rock' });
        }
    }

    /* 🌿🏛️ SURFACE TERRAIN ASSETS (Bushes, Ancient Prothean Monoliths, Glowing Crystal Sprouts) */
    spawnSurfaceAssets() {
        const bushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
        const relicMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.1 });
        const runeGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

        // 1. Wild Bush Patches (Asset Type 1)
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 25 + Math.random() * 140;
            const bx = Math.sin(angle) * dist;
            const bz = Math.cos(angle) * dist;
            const by = this.getTerrainHeight(bx, bz);
            if (by < -0.5) continue;

            const bush = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8), bushMat);
            bush.position.set(bx, by + 0.4, bz);
            bush.scale.set(1.4, 0.6, 1.4);
            this.scene.add(bush);
        }

        // 2. Ancient Prothean Relic Obelisks (Asset Type 2)
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + 0.3;
            const dist = 55 + Math.random() * 100;
            const ox = Math.sin(angle) * dist;
            const oz = Math.cos(angle) * dist;
            const oy = this.getTerrainHeight(ox, oz);
            if (oy < -0.5) continue;

            const obeliskGroup = new THREE.Group();
            obeliskGroup.position.set(ox, oy, oz);

            const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 8.5, 1.4), relicMat);
            pillar.position.y = 4.25;
            obeliskGroup.add(pillar);

            const runeRing = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.15, 8, 16), runeGlowMat);
            runeRing.rotation.x = Math.PI / 2;
            runeRing.position.y = 6.0;
            obeliskGroup.add(runeRing);

            this.scene.add(obeliskGroup);
            this.obstacles.push({ pos: new THREE.Vector3(ox, oy, oz), radius: 1.8, type: 'relic' });
        }

        // 3. Glowing Mineral Crystal Sprouts (Asset Type 3)
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 28 + Math.random() * 130;
            const cx = Math.sin(angle) * dist;
            const cz = Math.cos(angle) * dist;
            const cy = this.getTerrainHeight(cx, cz);
            if (cy < -0.5) continue;

            const sprout = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.6 }));
            sprout.position.set(cx, cy + 0.6, cz);
            this.scene.add(sprout);
        }
    }

    /* ☁️ Spawn Drifting Volumetric Cloud Sprites */
    spawnFloatingClouds() {
        this.clouds = [];
        const cloudTex = createCloudCanvasTexture();
        const cloudMat = new THREE.SpriteMaterial({
            map: cloudTex,
            transparent: true,
            opacity: 0.85,
            color: 0xffffff
        });

        for (let i = 0; i < 25; i++) {
            const sprite = new THREE.Sprite(cloudMat);
            const scale = 25 + Math.random() * 40;
            sprite.scale.set(scale * 2, scale, 1);

            const cx = (Math.random() - 0.5) * 320;
            const cz = (Math.random() - 0.5) * 320;
            const cy = 35 + Math.random() * 25;

            sprite.position.set(cx, cy, cz);
            this.scene.add(sprite);
            this.clouds.push({ sprite, speed: 0.04 + Math.random() * 0.06 });
        }
    }

    spawnResourceNodes() {
        this.resourceNodes = [];
        const nodeTypes = [
            { type: 'eezo', name: 'Element Zero (Eezo)', color: 0xa855f7, amount: 35 },
            { type: 'plat', name: 'Platinum Ore', color: 0xe2e8f0, amount: 45 },
            { type: 'palla', name: 'Palladium Node', color: 0xf59e0b, amount: 50 },
            { type: 'iri', name: 'Iridium Crystal', color: 0x06b6d4, amount: 40 }
        ];

        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 32 + Math.random() * 130;
            const rx = Math.sin(angle) * dist;
            const rz = Math.cos(angle) * dist;
            const ry = this.getTerrainHeight(rx, rz);

            if (ry < -0.5) continue;

            const data = nodeTypes[i % nodeTypes.length];
            const group = new THREE.Group();
            group.position.set(rx, ry, rz);

            const crystalMat = new THREE.MeshStandardMaterial({ color: data.color, emissive: data.color, emissiveIntensity: 0.35 });
            const crystalMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 0), crystalMat);
            crystalMesh.position.y = 1.2;
            group.add(crystalMesh);

            const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 20, 8), new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.3 }));
            beam.position.y = 10;
            group.add(beam);

            this.scene.add(group);
            this.resourceNodes.push({ mesh: group, crystal: crystalMesh, pos: new THREE.Vector3(rx, ry, rz), data, active: true });
        }
    }

    setupEvents() {
        this.onKeyDown = (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            if (key === 'f') {
                this.shootLaser();
            }
        };

        this.onKeyUp = (e) => { this.keys[e.key.toLowerCase()] = false; };

        this.onMouseDown = (e) => {
            if (e.button === 0 && !e.target.closest('.scifi-panel') && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SELECT') {
                this.shootLaser();
            }

            if (e.button === 2) {
                this.isMouseDown = true;
                this.prevMouseX = e.clientX;
                this.prevMouseY = e.clientY;
            }
        };

        this.onMouseUp = () => { this.isMouseDown = false; };

        this.onMouseMove = (e) => {
            if (this.isMouseDown) {
                const dx = e.clientX - this.prevMouseX;
                const dy = e.clientY - this.prevMouseY;
                this.cameraYaw -= dx * 0.005;
                this.cameraPitch = Math.max(0.1, Math.min(Math.PI / 2.2, this.cameraPitch + dy * 0.005));
                this.prevMouseX = e.clientX;
                this.prevMouseY = e.clientY;
            }
        };

        this.onWheel = (e) => {
            this.cameraDistance = Math.max(10, Math.min(45, this.cameraDistance + e.deltaY * 0.02));
        };

        this.onResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('wheel', this.onWheel);
        window.addEventListener('resize', this.onResize);
    }

    shootLaser() {
        const now = Date.now();
        if (now - this.lastShootTime < 200) return;
        this.lastShootTime = now;

        audioEngine.playLaserShoot();

        const forward = new THREE.Vector3(Math.sin(this.makoState.angle), 0, Math.cos(this.makoState.angle));

        const offsets = [-0.8, 0.8];
        offsets.forEach(off => {
            const laserGeo = new THREE.CylinderGeometry(0.15, 0.15, 3.5, 8);
            laserGeo.rotateX(Math.PI / 2);
            const laserMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

            const mesh = new THREE.Mesh(laserGeo, laserMat);
            mesh.position.copy(this.makoState.pos);
            mesh.position.y += 2.5;
            mesh.position.x += Math.cos(this.makoState.angle) * off;
            mesh.position.z -= Math.sin(this.makoState.angle) * off;

            mesh.rotation.y = this.makoState.angle;

            this.scene.add(mesh);
            this.lasers.push({ mesh, dir: forward.clone(), dist: 0 });
        });
    }

    updateLasers() {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const l = this.lasers[i];
            l.mesh.position.addScaledVector(l.dir, 2.8);
            l.dist += 2.8;

            for (let n = 0; n < this.resourceNodes.length; n++) {
                const node = this.resourceNodes[n];
                if (node.active && l.mesh.position.distanceTo(node.pos) < 4.0) {
                    node.active = false;
                    this.scene.remove(node.mesh);

                    gameState.harvestResource(node.data.type, node.data.amount);
                    audioEngine.playImpact();
                    gameState.addToast(`Laser Harvested: +${node.data.amount} ${node.data.name}!`, 'success');

                    this.scene.remove(l.mesh);
                    this.lasers.splice(i, 1);
                    break;
                }
            }

            if (l.dist > 150 && this.lasers[i] === l) {
                this.scene.remove(l.mesh);
                this.lasers.splice(i, 1);
            }
        }
    }

    updateCameraRotation() {
        if (this.keys['i']) {
            this.cameraPitch = Math.min(Math.PI / 2.2, this.cameraPitch + 0.025);
        }
        if (this.keys['k']) {
            this.cameraPitch = Math.max(0.08, this.cameraPitch - 0.025);
        }
        if (this.keys['j']) {
            this.cameraYaw += 0.03;
        }
        if (this.keys['l']) {
            this.cameraYaw -= 0.03;
        }
    }

    updateMakoPhysics() {
        let accelInput = 0;
        if (this.keys['w'] || this.keys['arrowup']) accelInput += 1;
        if (this.keys['s'] || this.keys['arrowdown']) accelInput -= 1;

        let topSpeed = this.makoState.maxSpeed;
        if (this.keys['shift']) {
            topSpeed *= 1.55;
            accelInput *= 1.35;
        }

        if (accelInput !== 0) {
            this.makoState.speed += accelInput * this.makoState.accel;
            this.makoState.speed = THREE.MathUtils.clamp(this.makoState.speed, -topSpeed * 0.45, topSpeed);
        } else {
            this.makoState.speed *= this.makoState.friction;
        }

        let steerInput = 0;
        if (this.keys['a'] || this.keys['arrowleft']) steerInput += 1;
        if (this.keys['d'] || this.keys['arrowright']) steerInput -= 1;

        this.makoState.targetSteerAngle = steerInput * this.makoState.maxSteer;
        this.makoState.steerAngle = THREE.MathUtils.lerp(this.makoState.steerAngle, this.makoState.targetSteerAngle, 0.12);

        if (Math.abs(this.makoState.speed) > 0.005) {
            const dir = this.makoState.speed >= 0 ? 1 : -1;
            this.makoState.angle += this.makoState.steerAngle * dir;
        }

        const state = gameState.getState();
        if (this.keys[' '] && this.makoState.isGrounded && state.mako.boostEnergy > 25) {
            this.makoState.jumpVel = 0.72;
            this.makoState.isGrounded = false;
            state.mako.boostEnergy -= 30;
            audioEngine.playJumpBoost();
        }

        if (state.mako.boostEnergy < state.mako.maxBoostEnergy) {
            state.mako.boostEnergy = Math.min(state.mako.maxBoostEnergy, state.mako.boostEnergy + 0.25);
        }

        const forward = new THREE.Vector3(Math.sin(this.makoState.angle), 0, Math.cos(this.makoState.angle));
        this.makoState.pos.addScaledVector(forward, this.makoState.speed);

        const distFromCenter = Math.sqrt(this.makoState.pos.x ** 2 + this.makoState.pos.z ** 2);
        if (distFromCenter > 182) {
            const angle = Math.atan2(this.makoState.pos.z, this.makoState.pos.x);
            this.makoState.pos.x = Math.cos(angle) * 182;
            this.makoState.pos.z = Math.sin(angle) * 182;
            this.makoState.speed = -this.makoState.speed * 0.55;
            audioEngine.playBounce();

            const now = Date.now();
            if (now - this.lastBoundaryToastTime > 3000) {
                this.lastBoundaryToastTime = now;
                gameState.addToast('WARNING: PLANET EXPLORABLE GRID BOUNDARY REACHED!', 'warning');
            }
        }

        const terrainY = this.getTerrainHeight(this.makoState.pos.x, this.makoState.pos.z);
        if (terrainY < -1.0) this.makoState.speed *= 0.92;

        this.checkObstacleCollisions();

        this.makoState.pos.y += this.makoState.jumpVel;

        if (this.makoState.pos.y <= terrainY) {
            this.makoState.pos.y = terrainY;
            this.makoState.jumpVel = 0;
            this.makoState.isGrounded = true;
        } else {
            this.makoState.jumpVel -= 0.032;
        }

        this.makoGroup.position.copy(this.makoState.pos);
        this.makoGroup.rotation.y = this.makoState.angle;

        const side = new THREE.Vector3(forward.z, 0, -forward.x);
        const frontY = this.getTerrainHeight(this.makoState.pos.x + forward.x * 2.8, this.makoState.pos.z + forward.z * 2.8);
        const backY = this.getTerrainHeight(this.makoState.pos.x - forward.x * 2.8, this.makoState.pos.z - forward.z * 2.8);
        const leftY = this.getTerrainHeight(this.makoState.pos.x + side.x * 1.8, this.makoState.pos.z + side.z * 1.8);
        const rightY = this.getTerrainHeight(this.makoState.pos.x - side.x * 1.8, this.makoState.pos.z - side.z * 1.8);

        const targetPitch = Math.atan2(frontY - backY, 5.6) * 0.7;
        const targetRoll = Math.atan2(leftY - rightY, 3.6) * 0.5;

        if (this.makoBodyMesh) {
            this.makoBodyMesh.rotation.x = THREE.MathUtils.lerp(this.makoBodyMesh.rotation.x, targetPitch, 0.15);
            this.makoBodyMesh.rotation.z = THREE.MathUtils.lerp(this.makoBodyMesh.rotation.z, targetRoll, 0.15);
        }

        this.makoWheels.forEach((w, idx) => {
            w.rotation.x += this.makoState.speed * 0.75;
            if (idx < 2) w.rotation.y = this.makoState.steerAngle * 4.0;
        });

        state.mako.speed = Math.abs(this.makoState.speed) * 120;
    }

    checkObstacleCollisions() {
        this.obstacles.forEach(ob => {
            const dist = this.makoState.pos.distanceTo(ob.pos);
            const minDist = 2.8 + ob.radius;
            if (dist < minDist) {
                const pushDir = new THREE.Vector3().subVectors(this.makoState.pos, ob.pos).normalize();
                this.makoState.pos.addScaledVector(pushDir, (minDist - dist) + 0.1);
                this.makoState.speed = -this.makoState.speed * 0.45;
                audioEngine.playBounce();
            }
        });
    }

    checkResourceCollisions() {
        this.resourceNodes.forEach(node => {
            if (!node.active) return;
            node.crystal.rotation.y += 0.02;

            if (this.makoState.pos.distanceTo(node.pos) < 3.6) {
                node.active = false;
                this.scene.remove(node.mesh);

                gameState.harvestResource(node.data.type, node.data.amount);
                audioEngine.playImpact();
                gameState.addToast(`Ram Mining: +${node.data.amount} ${node.data.name}!`, 'success');
            }
        });
    }

    updateCamera() {
        const targetCamPos = new THREE.Vector3(
            this.makoState.pos.x - Math.sin(this.makoState.angle + this.cameraYaw) * this.cameraDistance * Math.cos(this.cameraPitch),
            this.makoState.pos.y + this.cameraDistance * Math.sin(this.cameraPitch),
            this.makoState.pos.z - Math.cos(this.makoState.angle + this.cameraYaw) * this.cameraDistance * Math.cos(this.cameraPitch)
        );

        this.camera.position.lerp(targetCamPos, 0.08);
        this.camera.lookAt(this.makoState.pos.x, this.makoState.pos.y + 2.5, this.makoState.pos.z);
    }

    update() {
        if (this.isDestroyed) return;

        const gfxQuality = gameState.getState().graphicsQuality;
        if (this.renderer && this.renderer.shadowMap.enabled !== (gfxQuality === 'high')) {
            this.renderer.shadowMap.enabled = (gfxQuality === 'high');
        }

        const desiredVehicle = gameState.getState().surfaceVehicleType;
        if (desiredVehicle !== this.currentVehicleType) {
            this.updateVehicleModel(desiredVehicle);
        }

        if (this.boundaryMesh && this.boundaryMesh.material.map) {
            this.boundaryMesh.material.map.offset.y += 0.003;
        }

        this.clouds.forEach(c => {
            c.sprite.position.x += c.speed;
            if (c.sprite.position.x > 180) c.sprite.position.x = -180;
        });

        this.updateMakoPhysics();
        this.updateCameraRotation();
        this.checkResourceCollisions();
        this.updateLasers();
        this.updateCamera();

        this.renderer.render(this.scene, this.camera);
        return {
            makoPos: this.makoState.pos,
            makoAngle: this.makoState.angle,
            nodes: this.resourceNodes,
            obstacles: this.obstacles,
            lakes: this.lakes,
            normandyPos: this.normandyLZGroup.position
        };
    }

    destroy() {
        this.isDestroyed = true;
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('wheel', this.onWheel);
        window.removeEventListener('resize', this.onResize);
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.remove();
        }
    }
}
