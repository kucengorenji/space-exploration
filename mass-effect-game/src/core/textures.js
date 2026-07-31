/* ===================================================================
   PROCEDURAL CANVAS TEXTURE GENERATOR FOR PLANETS & SURFACE ENVIRONMENT
   (Grass, Leaves, Rocks, Clouds, Sky Gradient, and Planet Surfaces)
   =================================================================== */

import * as THREE from 'three';

// 🌿 Grass Canvas Texture for Surface Terrain
export function createGrassCanvasTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base Lush Green Field
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 512, 512);

    // Natural Soil Patches
    for (let i = 0; i < 40; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#166534' : '#14532d';
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 40, 0, Math.PI * 2);
        ctx.fill();
    }

    // Individual Grass Blade Sprites
    for (let i = 0; i < 4000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const len = 4 + Math.random() * 10;
        const angle = (Math.random() - 0.5) * 0.8;

        ctx.strokeStyle = ['#22c55e', '#4ade80', '#16a34a', '#86efac'][Math.floor(Math.random() * 4)];
        ctx.lineWidth = 1 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.sin(angle) * len, y - Math.cos(angle) * len);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(32, 32);
    return texture;
}

// 🍃 Leaves Sprite Canvas Texture for Trees
export function createLeavesCanvasTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 0, 256, 256);

    // Leaf cluster shapes
    for (let i = 0; i < 180; i++) {
        ctx.fillStyle = ['#15803d', '#22c55e', '#14532d', '#4ade80'][Math.floor(Math.random() * 4)];
        const cx = Math.random() * 256;
        const cy = Math.random() * 256;
        const rx = 6 + Math.random() * 14;
        const ry = 4 + Math.random() * 10;

        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
}

// 🪨 Rock Texture for Boulders & Obstacles
export function createRockCanvasTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 256, 256);

    // Stone Noise Patches
    for (let i = 0; i < 150; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#334155' : '#64748b';
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, 5 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();
    }

    // Cracks & Craggy Veins
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        let x = Math.random() * 256;
        let y = Math.random() * 256;
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 40);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// ☁️ Fluffy White Cloud Sprite Texture
export function createCloudCanvasTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.5, 'rgba(240, 249, 255, 0.6)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

// 🌌 Colorful Planet Surface Texture
export function createPlanetCanvasTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    if (type === 'pyros' || type === 'Volcanic World') {
        ctx.fillStyle = '#1e0502';
        ctx.fillRect(0, 0, 512, 256);

        for (let i = 0; i < 40; i++) {
            ctx.strokeStyle = Math.random() > 0.3 ? '#ff3300' : '#ffaa00';
            ctx.lineWidth = 2 + Math.random() * 6;
            ctx.beginPath();
            let x = Math.random() * 512;
            let y = Math.random() * 256;
            ctx.moveTo(x, y);
            for (let j = 0; j < 6; j++) {
                x += (Math.random() - 0.5) * 60;
                y += (Math.random() - 0.5) * 40;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        for (let i = 0; i < 20; i++) {
            const rx = Math.random() * 512;
            const ry = Math.random() * 256;
            const rad = 10 + Math.random() * 25;
            const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
            grad.addColorStop(0, '#ffcc00');
            grad.addColorStop(0.5, '#ff4400');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(rx, ry, rad, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (type === 'aethel' || type === 'Garden / Earth-like') {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = '#15803d';
        for (let i = 0; i < 18; i++) {
            const cx = Math.random() * 512;
            const cy = Math.random() * 256;
            const rx = 30 + Math.random() * 70;
            const ry = 20 + Math.random() * 40;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 25; i++) {
            const cx = Math.random() * 512;
            const cy = Math.random() * 256;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 40 + Math.random() * 60, 8 + Math.random() * 15, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (type === 'cryo' || type === 'Frozen Cryo Planet') {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = '#e0f2fe';
        for (let i = 0; i < 30; i++) {
            const cx = Math.random() * 512;
            const cy = Math.random() * 256;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 25 + Math.random() * 50, 15 + Math.random() * 30, Math.random(), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        for (let i = 0; i < 35; i++) {
            ctx.beginPath();
            let x = Math.random() * 512;
            let y = Math.random() * 256;
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 80, y + (Math.random() - 0.5) * 50);
            ctx.stroke();
        }
    } else if (type === 'kronos' || type === 'Gas Giant (Ringed)') {
        const colors = ['#ca8a04', '#eab308', '#d97706', '#f59e0b', '#78350f', '#fef08a'];
        for (let y = 0; y < 256; y += 8) {
            ctx.fillStyle = colors[Math.floor(y / 8) % colors.length];
            ctx.fillRect(0, y, 512, 8 + Math.sin(y * 0.1) * 3);
        }

        const grad = ctx.createRadialGradient(320, 140, 5, 320, 140, 40);
        grad.addColorStop(0, '#ef4444');
        grad.addColorStop(0.6, '#b91c1c');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(320, 140, 45, 25, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (type === 'aegis' || type === 'Arid Wasted World') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = '#f59e0b';
        for (let i = 0; i < 22; i++) {
            const cx = Math.random() * 512;
            const cy = Math.random() * 256;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 35 + Math.random() * 55, 12 + Math.random() * 20, 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 4;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            let x = Math.random() * 512;
            let y = Math.random() * 256;
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 90, y + (Math.random() - 0.5) * 60);
            ctx.stroke();
        }
    } else {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        for (let x = 0; x < 512; x += 32) {
            ctx.strokeRect(x, 0, 32, 256);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}
