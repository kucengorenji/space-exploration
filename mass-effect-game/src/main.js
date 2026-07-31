/* ===================================================================
   MASS EFFECT CLONE - APPLICATION ENTRY POINT & ENGINE ROUTER
   =================================================================== */

import './styles/main.css';
import { gameState } from './core/state.js';
import { HUDManager } from './ui/hud.js';
import { SpaceEngine } from './space/spaceEngine.js';
import { SurfaceEngine } from './surface/surfaceEngine.js';

class App {
    constructor() {
        this.appEl = document.getElementById('app');
        this.hud = new HUDManager(this.appEl);
        this.currentEngine = null;

        this.init();
    }

    init() {
        // Subscribe to Game State mode switches ('space' vs 'surface')
        gameState.subscribe(state => {
            this.switchEngine(state.mode);
        });

        // Disable browser right-click context menu for smooth 3D camera controls
        window.addEventListener('contextmenu', (e) => e.preventDefault());

        // Initialize starting mode
        this.switchEngine(gameState.getState().mode);

        // Start unified render loop
        this.animate();
    }

    switchEngine(mode) {
        if (this.currentEngineMode === mode) return;
        this.currentEngineMode = mode;

        if (this.currentEngine) {
            this.currentEngine.destroy();
            this.currentEngine = null;
        }

        const canvasContainer = document.getElementById('canvas-container');
        canvasContainer.innerHTML = ''; // Clear canvas

        if (mode === 'space') {
            this.currentEngine = new SpaceEngine(canvasContainer, (planetData) => {
                this.hud.openModal(planetData);
            });
        } else if (mode === 'surface') {
            this.currentEngine = new SurfaceEngine(canvasContainer);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.currentEngine) {
            const res = this.currentEngine.update();

            if (this.currentEngineMode === 'space' && res) {
                // Update proximity banner & target reticle in space mode
                this.hud.showProximityBanner(res.prox.closest ? res.prox.closest.data : null, res.prox.distance);

                if (res.prox.closest) {
                    const screenPos = res.prox.closest.mesh.position.clone();
                    screenPos.project(this.currentEngine.camera);
                    const rx = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
                    const ry = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;
                    this.hud.updateReticlePosition(rx, ry, `${res.prox.closest.data.name} [${res.prox.distance.toFixed(1)} AU]`);
                } else {
                    this.hud.updateReticlePosition(null, null, '');
                }

                // Draw Minimap for Space
                this.drawSpaceMinimap(res.shipPos, res.planets, res.prox.closest);
            } else if (this.currentEngineMode === 'surface' && res) {
                // Hide proximity banner & target reticle in surface mode
                this.hud.showProximityBanner(null, 0);
                this.hud.updateReticlePosition(null, null, '');

                // Draw Minimap for Surface Mako
                this.drawSurfaceMinimap(res.makoPos, res.makoAngle, res.nodes, res.obstacles, res.lakes, res.normandyPos);
            }
        }
    }

    drawSpaceMinimap(shipPos, planets, closest) {
        const canvas = document.getElementById('minimap-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = 72, cy = 72, scale = 72 / 280;

        ctx.clearRect(0, 0, 144, 144);
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        planets.forEach(p => {
            const px = cx + p.mesh.position.x * scale;
            const py = cy + p.mesh.position.z * scale;
            ctx.fillStyle = (closest && closest.data.id === p.data.id) ? '#f59e0b' : '#38bdf8';
            ctx.beginPath();
            ctx.arc(px, py, (closest && closest.data.id === p.data.id) ? 4 : 3, 0, Math.PI * 2);
            ctx.fill();
        });

        const sx = cx + shipPos.x * scale;
        const sy = cy + shipPos.z * scale;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSurfaceMinimap(makoPos, makoAngle, nodes, obstacles, lakes, normandyPos) {
        const canvas = document.getElementById('minimap-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = 72, cy = 72, scale = 72 / 190;

        ctx.clearRect(0, 0, 144, 144);

        lakes.forEach(l => {
            ctx.fillStyle = 'rgba(2, 132, 199, 0.5)';
            ctx.beginPath();
            ctx.arc(cx + l.x * scale, cy + l.z * scale, l.r * scale, 0, Math.PI * 2);
            ctx.fill();
        });

        if (normandyPos) {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(cx + normandyPos.x * scale, cy + normandyPos.z * scale, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        obstacles.forEach(ob => {
            ctx.fillStyle = ob.type === 'tree' ? '#166534' : '#64748b';
            ctx.beginPath();
            ctx.arc(cx + ob.pos.x * scale, cy + ob.pos.z * scale, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        nodes.forEach(n => {
            if (!n.active) return;
            ctx.fillStyle = '#' + n.data.color.toString(16).padStart(6, '0');
            ctx.beginPath();
            ctx.arc(cx + n.pos.x * scale, cy + n.z * scale || cy + n.pos.z * scale, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        const mx = cx + makoPos.x * scale;
        const my = cy + makoPos.z * scale;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + Math.sin(makoAngle) * 7, my + Math.cos(makoAngle) * 7);
        ctx.stroke();
    }
}

// Start App when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    new App();
});
