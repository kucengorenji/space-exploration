/* ===================================================================
   THREE.JS COLORFUL SOLAR SYSTEM SPACE ENGINE WITH FINE-TUNED SHADOWS & LIGHTING
   =================================================================== */

import * as THREE from 'three';
import { gameState } from '../core/state.js';
import { audioEngine } from '../core/audio.js';
import { createPlanetCanvasTexture } from '../core/textures.js';
import { PLANETS_DATA } from '../data/planets.js';
import { createShipMesh } from '../factories/modelRegistry.js';

export class SpaceEngine {
    constructor(containerEl, onPlanetSelect) {
        this.container = containerEl;
        this.onPlanetSelect = onPlanetSelect;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.shipMesh = null;
        this.currentShipType = null;
        this.sunMesh = null;
        this.sunCoronaMesh = null;
        this.sunOuterHaloMesh = null;
        this.solarDirLight = null;
        this.planetMeshes = [];
        this.closestPlanet = null;
        this.isDestroyed = false;

        this.lasers = [];
        this.lastShootTime = 0;

        // Camera Orbit Angles (I, J, K, L Controls)
        this.cameraDistance = 140;
        this.cameraPitch = 0.8;
        this.cameraYaw = 0;

        this.shipState = {
            pos: new THREE.Vector3(0, 0, 85),
            vel: new THREE.Vector3(0, 0, 0),
            targetPos: null,
            rotation: 0,
            roll: 0,
            maxSpeed: 1.5
        };

        this.keys = {};
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x060814, 0.0007);

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 160, 180);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        /* ENABLE HIGH-QUALITY THREE.JS SHADOW MAPPING */
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        /* REALISTIC SOLAR LIGHTING & SHADOW MAP SYSTEM */
        // 1. High-power Central Sun PointLight emanating from core (0,0,0)
        const centralSunLight = new THREE.PointLight(0xfffaea, 14.0, 2000, 0.2);
        centralSunLight.position.set(0, 0, 0);
        centralSunLight.castShadow = true;
        centralSunLight.shadow.mapSize.width = 2048;
        centralSunLight.shadow.mapSize.height = 2048;
        centralSunLight.shadow.bias = -0.0005;
        this.scene.add(centralSunLight);

        // 2. Solar Directional Key Light emanating from core (0,0,0)
        this.solarDirLight = new THREE.DirectionalLight(0xfff5ea, 3.0);
        this.solarDirLight.position.set(0, 0, 0);
        this.solarDirLight.castShadow = true;
        this.solarDirLight.shadow.mapSize.width = 2048;
        this.solarDirLight.shadow.mapSize.height = 2048;
        this.scene.add(this.solarDirLight);

        // 3. Deep Space High-Contrast Ambient Light (Low intensity for realistic pitch-black night side shading)
        const spaceAmbientLight = new THREE.AmbientLight(0x0f172a, 0.22);
        this.scene.add(spaceAmbientLight);

        this.createColorfulSpaceNebula();
        this.createSun();
        PLANETS_DATA.forEach(p => this.createPlanet(p));

        this.updateShipModel(gameState.getState().shipType);

        this.setupEvents();
    }

    createColorfulSpaceNebula() {
        const count = 4000;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 1500;
            positions[i + 1] = (Math.random() - 0.5) * 1500;
            positions[i + 2] = (Math.random() - 0.5) * 1500;

            const rChoice = Math.random();
            if (rChoice < 0.3) {
                colors[i] = 0.2; colors[i+1] = 0.8; colors[i+2] = 1.0;
            } else if (rChoice < 0.6) {
                colors[i] = 0.8; colors[i+1] = 0.4; colors[i+2] = 1.0;
            } else {
                colors[i] = 1.0; colors[i+1] = 0.9; colors[i+2] = 0.6;
            }
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.85 });
        this.scene.add(new THREE.Points(geo, mat));

        for (let n = 0; n < 8; n++) {
            const nGeo = new THREE.SphereGeometry(60 + Math.random() * 40, 16, 16);
            const nMat = new THREE.MeshBasicMaterial({
                color: [0x4c1d95, 0x0284c7, 0x831843, 0x1e1b4b][n % 4],
                transparent: true,
                opacity: 0.14,
                side: THREE.BackSide
            });
            const nebula = new THREE.Mesh(nGeo, nMat);
            nebula.position.set((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 800);
            this.scene.add(nebula);
        }
    }

    createSun() {
        const sunGroup = new THREE.Group();

        const coreGeo = new THREE.SphereGeometry(15, 36, 36);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.sunMesh = new THREE.Mesh(coreGeo, coreMat);
        sunGroup.add(this.sunMesh);

        const coronaGeo = new THREE.SphereGeometry(19, 36, 36);
        const coronaMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.65, wireframe: true });
        this.sunCoronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
        sunGroup.add(this.sunCoronaMesh);

        const haloGeo = new THREE.SphereGeometry(32, 36, 36);
        const haloMat = new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.28 });
        this.sunOuterHaloMesh = new THREE.Mesh(haloGeo, haloMat);
        sunGroup.add(this.sunOuterHaloMesh);

        const flareGeo = new THREE.SphereGeometry(52, 36, 36);
        const flareMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.12 });
        sunGroup.add(new THREE.Mesh(flareGeo, flareMat));

        this.scene.add(sunGroup);
    }

    /* 🪐 PLANET MESHES WITH SHADOW CASTING & DAY/NIGHT SHADING */
    createPlanet(data) {
        const orbitGeo = new THREE.BufferGeometry();
        const points = [];
        const segments = 128;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(theta) * data.orbitRadius, 0, Math.sin(theta) * data.orbitRadius));
        }
        orbitGeo.setFromPoints(points);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28 });
        this.scene.add(new THREE.Line(orbitGeo, orbitMat));

        let mesh;
        if (data.isStation) {
            const stationGroup = new THREE.Group();
            const coreGeo = new THREE.OctahedronGeometry(data.radius, 1);
            const coreMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.05 });
            const stationCore = new THREE.Mesh(coreGeo, coreMat);
            stationCore.castShadow = true;
            stationCore.receiveShadow = true;
            stationGroup.add(stationCore);

            const ringGeo = new THREE.TorusGeometry(data.radius * 1.6, 0.4, 12, 32);
            const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.castShadow = true;
            ring.receiveShadow = true;
            stationGroup.add(ring);

            mesh = stationGroup;
        } else {
            const group = new THREE.Group();

            const texture = createPlanetCanvasTexture(data.id || data.type);
            const planetGeo = new THREE.SphereGeometry(data.radius, 36, 36);

            // Realistic PBR Material with Day/Night Shading
            const planetMat = new THREE.MeshStandardMaterial({
                map: texture,
                color: 0xffffff,
                roughness: 0.45,
                metalness: 0.15
            });
            const planetMesh = new THREE.Mesh(planetGeo, planetMat);
            planetMesh.castShadow = true;
            planetMesh.receiveShadow = true;
            group.add(planetMesh);

            const atmosphereGeo = new THREE.SphereGeometry(data.radius * 1.08, 32, 32);
            const atmosphereMat = new THREE.MeshBasicMaterial({
                color: data.ambienceColor || data.color,
                transparent: true,
                opacity: 0.25
            });
            group.add(new THREE.Mesh(atmosphereGeo, atmosphereMat));

            if (data.hasRings) {
                const ringGeo = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.3, 48);
                const ringMat = new THREE.MeshStandardMaterial({ color: data.ringColor, side: THREE.DoubleSide, transparent: true, opacity: 0.75, roughness: 0.6 });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = Math.PI / 2.3;
                ring.castShadow = true;
                ring.receiveShadow = true;
                group.add(ring);
            }

            mesh = group;
        }

        const angle = data.orbitAngle || Math.random() * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * data.orbitRadius, 0, Math.sin(angle) * data.orbitRadius);
        this.scene.add(mesh);

        this.planetMeshes.push({ data, mesh, angle });
    }

    /* 🚀 SHINING STARSHIPS WITH SHADOW CASTING & DIRECT SOLAR REFLECTIONS */
    updateShipModel(type = 'normandy') {
        if (this.shipMesh) {
            this.scene.remove(this.shipMesh);
        }
        this.currentShipType = type;

        this.shipMesh = createShipMesh(type);
        this.shipMesh.position.copy(this.shipState.pos);
        this.scene.add(this.shipMesh);
    }

    setupEvents() {
        this.onKeyDown = (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;

            if (e.code === 'Space' || key === ' ') {
                if (this.closestPlanet) {
                    gameState.landOnPlanet(this.closestPlanet.data);
                } else {
                    this.shootLaser();
                }
            } else if (key === 'f') {
                this.shootLaser();
            }

            if (key === 'e' && this.closestPlanet) {
                this.onPlanetSelect(this.closestPlanet.data);
            }
        };

        this.onKeyUp = (e) => { this.keys[e.key.toLowerCase()] = false; };

        this.isMouseDown = false;

        this.onPointerDown = (e) => {
            if (e.target.closest('.scifi-panel') || e.target.closest('#planet-modal') || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT') return;

            if (e.button === 0) {
                const mouse = new THREE.Vector2(
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1
                );

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, this.camera);

                const intersects = raycaster.intersectObjects(this.planetMeshes.map(p => p.mesh), true);
                if (intersects.length > 0) {
                    const hitMesh = intersects[0].object;
                    const matchedPlanet = this.planetMeshes.find(p => p.mesh === hitMesh || p.mesh.children.includes(hitMesh));
                    if (matchedPlanet) {
                        audioEngine.playLockOn();
                        this.onPlanetSelect(matchedPlanet.data);
                        return;
                    }
                }

                this.shootLaser();
            } else if (e.button === 2) {
                this.isMouseDown = true;
                this.prevMouseX = e.clientX;
                this.prevMouseY = e.clientY;
            }
        };

        this.onPointerUp = () => { this.isMouseDown = false; };

        this.onPointerMove = (e) => {
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
            this.cameraDistance = Math.max(40, Math.min(300, this.cameraDistance + e.deltaY * 0.1));
        };

        this.onResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('pointerdown', this.onPointerDown);
        window.addEventListener('pointerup', this.onPointerUp);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('wheel', this.onWheel);
        window.addEventListener('resize', this.onResize);
    }

    shootLaser() {
        const now = Date.now();
        if (now - this.lastShootTime < 180) return;
        this.lastShootTime = now;

        audioEngine.playLaserShoot();

        // Ship forward heading aligned with velocity direction
        const forwardDir = new THREE.Vector3(
            Math.sin(this.shipState.rotation),
            0,
            Math.cos(this.shipState.rotation)
        );

        const sideDir = new THREE.Vector3(
            Math.cos(this.shipState.rotation),
            0,
            -Math.sin(this.shipState.rotation)
        );

        const offsets = [-1.4, 1.4];
        offsets.forEach(off => {
            const laserGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.0, 8);
            laserGeo.rotateX(Math.PI / 2);
            const laserMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

            const mesh = new THREE.Mesh(laserGeo, laserMat);
            // Position laser at nose (+3.8 units ahead) and offset left/right
            mesh.position.copy(this.shipState.pos)
                .addScaledVector(forwardDir, 3.8)
                .addScaledVector(sideDir, off);

            mesh.rotation.y = this.shipState.rotation;

            this.scene.add(mesh);
            this.lasers.push({ mesh, dir: forwardDir.clone(), dist: 0 });
        });
    }

    updateLasers() {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const l = this.lasers[i];
            l.mesh.position.addScaledVector(l.dir, 3.2);
            l.dist += 3.2;

            if (l.dist > 180) {
                this.scene.remove(l.mesh);
                this.lasers.splice(i, 1);
            }
        }
    }

    updateCameraRotation() {
        if (this.keys['i']) {
            this.cameraPitch = Math.max(0.1, Math.min(Math.PI / 2.1, this.cameraPitch - 0.025));
        }
        if (this.keys['k']) {
            this.cameraPitch = Math.max(0.1, Math.min(Math.PI / 2.1, this.cameraPitch + 0.025));
        }
        if (this.keys['j']) {
            this.cameraYaw += 0.03;
        }
        if (this.keys['l'] && !this.keys['w'] && !this.keys['a'] && !this.keys['s'] && !this.keys['d']) {
            this.cameraYaw -= 0.03;
        }
    }

    updateShipMovement() {
        let forwardInput = 0;
        let sideInput = 0;

        if (this.keys['w'] || this.keys['arrowup']) forwardInput += 1;
        if (this.keys['s'] || this.keys['arrowdown']) forwardInput -= 1;
        if (this.keys['a'] || this.keys['arrowleft']) sideInput += 1;
        if (this.keys['d'] || this.keys['arrowright']) sideInput -= 1;

        if (forwardInput !== 0 || sideInput !== 0) {
            this.shipState.targetPos = null;

            const camForward = new THREE.Vector3(Math.sin(this.cameraYaw), 0, Math.cos(this.cameraYaw));
            const camRight = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw));

            const moveDir = new THREE.Vector3();
            moveDir.addScaledVector(camForward, forwardInput);
            moveDir.addScaledVector(camRight, sideInput);
            moveDir.normalize();

            this.shipState.vel.addScaledVector(moveDir, 0.16);
        } else if (this.shipState.targetPos) {
            const dist = this.shipState.pos.distanceTo(this.shipState.targetPos);
            if (dist > 2.0) {
                const dir = new THREE.Vector3().subVectors(this.shipState.targetPos, this.shipState.pos).normalize();
                this.shipState.vel.addScaledVector(dir, 0.16);
            } else {
                this.shipState.targetPos = null;
            }
        }

        if (this.shipState.vel.length() > this.shipState.maxSpeed) {
            this.shipState.vel.setLength(this.shipState.maxSpeed);
        }
        this.shipState.vel.multiplyScalar(0.94);
        this.shipState.pos.add(this.shipState.vel);

        if (this.shipState.pos.length() > 290) {
            this.shipState.pos.setLength(290);
        }

        this.shipMesh.position.copy(this.shipState.pos);

        if (this.shipState.vel.length() > 0.05) {
            const targetAngle = Math.atan2(this.shipState.vel.x, this.shipState.vel.z);
            let diff = targetAngle - this.shipState.rotation;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            this.shipState.rotation += diff * 0.15;
            this.shipMesh.rotation.y = this.shipState.rotation;

            const targetRoll = sideInput * 0.35;
            this.shipState.roll = THREE.MathUtils.lerp(this.shipState.roll, targetRoll, 0.15);
            this.shipMesh.rotation.z = this.shipState.roll;
        } else {
            this.shipState.roll = THREE.MathUtils.lerp(this.shipState.roll, 0, 0.15);
            this.shipMesh.rotation.z = this.shipState.roll;
        }
    }

    checkPlanetProximity() {
        let nearest = null;
        let minDistance = Infinity;

        this.planetMeshes.forEach(p => {
            const dist = this.shipMesh.position.distanceTo(p.mesh.position);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = p;
            }
        });

        if (minDistance < 24) {
            if (this.closestPlanet !== nearest) {
                audioEngine.playLockOn();
            }
            this.closestPlanet = nearest;
        } else {
            this.closestPlanet = null;
        }
        return { closest: this.closestPlanet, distance: minDistance };
    }

    update() {
        if (this.isDestroyed) return;

        const gfxQuality = gameState.getState().graphicsQuality;
        if (this.renderer && this.renderer.shadowMap.enabled !== (gfxQuality === 'high')) {
            this.renderer.shadowMap.enabled = (gfxQuality === 'high');
        }

        const desiredShipType = gameState.getState().shipType;
        if (desiredShipType !== this.currentShipType) {
            this.updateShipModel(desiredShipType);
        }

        if (this.sunMesh) this.sunMesh.rotation.y += 0.003;
        if (this.sunCoronaMesh) this.sunCoronaMesh.rotation.y -= 0.005;
        if (this.sunOuterHaloMesh) {
            this.sunOuterHaloMesh.rotation.z += 0.002;
            const time = Date.now() * 0.0015;
            this.sunOuterHaloMesh.scale.setScalar(1.0 + Math.sin(time) * 0.08);
        }

        this.planetMeshes.forEach(p => {
            p.angle += p.data.orbitSpeed * 0.5;
            p.mesh.position.x = Math.cos(p.angle) * p.data.orbitRadius;
            p.mesh.position.z = Math.sin(p.angle) * p.data.orbitRadius;
            p.mesh.rotation.y += 0.01;
        });

        this.updateShipMovement();
        this.updateCameraRotation();
        this.updateLasers();

        // Track solar directional key light position aiming at ship
        if (this.solarDirLight && this.shipMesh) {
            this.solarDirLight.target = this.shipMesh;
        }

        const prox = this.checkPlanetProximity();

        const targetCamPos = new THREE.Vector3(
            this.shipState.pos.x - Math.sin(this.cameraYaw) * this.cameraDistance * Math.cos(this.cameraPitch),
            this.cameraDistance * Math.sin(this.cameraPitch),
            this.shipState.pos.z - Math.cos(this.cameraYaw) * this.cameraDistance * Math.cos(this.cameraPitch)
        );

        this.camera.position.lerp(targetCamPos, 0.08);
        this.camera.lookAt(this.shipState.pos.x, 0, this.shipState.pos.z);

        this.renderer.render(this.scene, this.camera);
        return { prox, shipPos: this.shipState.pos, planets: this.planetMeshes };
    }

    destroy() {
        this.isDestroyed = true;
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('pointerdown', this.onPointerDown);
        window.removeEventListener('resize', this.onResize);
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.remove();
        }
    }
}
