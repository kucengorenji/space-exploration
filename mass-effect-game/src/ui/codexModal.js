/* ===================================================================
   ALLIANCE CODEX & INTEL DATABASE FULL-PAGE OVERLAY MODAL (100% SCREEN)
   Interactive stacked document files for Planetary Intel, Rank,
   Economy/Stats, and Tactical Game Mechanics Tutorial.
   =================================================================== */

import { gameState } from '../core/state.js';
import { audioEngine } from '../core/audio.js';
import { PLANETS_DATA } from '../data/planets.js';
import { BIOMES_DATA } from '../data/biomes.js';
import { SURFACE_VEHICLES_DATA } from '../data/surfaceVehicles.js';
import { SHIPS_DATA } from '../data/ships.js';

export class CodexModal {
    constructor() {
        this.modalEl = null;
        this.isOpen = false;
        this.activeTab = 'planets'; // 'planets' | 'rank' | 'economy' | 'tutorial'
        this.init();
    }

    init() {
        const modal = document.createElement('div');
        modal.id = 'alliance-codex-modal';
        modal.className = 'fixed inset-0 z-50 w-screen h-screen bg-slate-950/95 backdrop-blur-2xl opacity-0 pointer-events-none transition-all duration-300 scale-98 p-4 md:p-8 flex flex-col justify-between text-cyan-100 overflow-y-auto font-sans';
        modal.innerHTML = `
            <!-- Top Header Bar -->
            <header class="flex justify-between items-center border-b border-cyan-500/40 pb-4 mb-6">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg border-2 border-cyan-400 flex items-center justify-center bg-cyan-950/80 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                        <i class="fa-solid fa-book-bookmark text-2xl"></i>
                    </div>
                    <div>
                        <div class="text-xs text-cyan-400 font-orbitron tracking-[0.3em] uppercase">SYSTEMS ALLIANCE ARCHIVES</div>
                        <div class="text-2xl md:text-3xl font-black font-orbitron text-white tracking-wider">ALLIANCE CODEX & INTEL DATABASE</div>
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <button id="btn-close-codex" class="scifi-button px-5 py-2 text-sm font-bold text-rose-300 border-rose-500/60 hover:text-white flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                        <i class="fa-solid fa-xmark text-base"></i> CLOSE CODEX [ESC]
                    </button>
                </div>
            </header>

            <!-- Document Folder Stack Tab Navigation -->
            <div class="flex items-center gap-2 border-b border-cyan-500/30 mb-6 overflow-x-auto pb-1">
                <button data-tab="planets" class="codex-tab-btn px-6 py-2.5 rounded-t-lg font-orbitron font-bold text-xs tracking-wider transition flex items-center gap-2 cursor-pointer bg-cyan-500/20 text-cyan-200 border-t-2 border-x border-cyan-400 shadow-lg">
                    <i class="fa-solid fa-globe text-cyan-400"></i> PLANETARY INTEL
                </button>
                <button data-tab="rank" class="codex-tab-btn px-6 py-2.5 rounded-t-lg font-orbitron font-bold text-xs tracking-wider transition flex items-center gap-2 cursor-pointer bg-slate-900/60 text-slate-400 hover:text-cyan-300 border-t-2 border-x border-transparent">
                    <i class="fa-solid fa-award text-amber-400"></i> SPECTRE RANK & REPUTATION
                </button>
                <button data-tab="economy" class="codex-tab-btn px-6 py-2.5 rounded-t-lg font-orbitron font-bold text-xs tracking-wider transition flex items-center gap-2 cursor-pointer bg-slate-900/60 text-slate-400 hover:text-cyan-300 border-t-2 border-x border-transparent">
                    <i class="fa-solid fa-chart-line text-emerald-400"></i> ECONOMY & FLEET CATALOG
                </button>
                <button data-tab="tutorial" class="codex-tab-btn px-6 py-2.5 rounded-t-lg font-orbitron font-bold text-xs tracking-wider transition flex items-center gap-2 cursor-pointer bg-slate-900/60 text-slate-400 hover:text-cyan-300 border-t-2 border-x border-transparent">
                    <i class="fa-solid fa-gamepad text-purple-400"></i> TACTICAL MANUAL (TUTORIAL)
                </button>
            </div>

            <!-- Tab Content Container (Interactive Document Stack) -->
            <div id="codex-content-body" class="flex-1 overflow-y-auto mb-6">
                <!-- Content populated dynamically -->
            </div>

            <!-- Footer Bar -->
            <footer class="border-t border-cyan-500/40 pt-4 flex justify-between items-center text-xs text-slate-400">
                <div>SYSTEMS ALLIANCE INTEL DIVISION &bull; SECURITY CLEARANCE SPECTRE</div>
                <div>PRESS <kbd class="px-2 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">ESC</kbd> TO EXIT CODEX</div>
            </footer>
        `;

        document.body.appendChild(modal);
        this.modalEl = modal;

        this.setupEvents();
    }

    setupEvents() {
        document.getElementById('btn-close-codex').addEventListener('click', () => this.close());

        this.modalEl.querySelectorAll('.codex-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    switchTab(tabKey) {
        this.activeTab = tabKey;
        audioEngine.playPing();

        this.modalEl.querySelectorAll('.codex-tab-btn').forEach(btn => {
            const isSelected = btn.dataset.tab === tabKey;
            btn.className = isSelected
                ? 'codex-tab-btn px-6 py-2.5 rounded-t-lg font-orbitron font-bold text-xs tracking-wider transition flex items-center gap-2 cursor-pointer bg-cyan-500/20 text-cyan-200 border-t-2 border-x border-cyan-400 shadow-lg'
                : 'codex-tab-btn px-6 py-2.5 rounded-t-lg font-orbitron font-bold text-xs tracking-wider transition flex items-center gap-2 cursor-pointer bg-slate-900/60 text-slate-400 hover:text-cyan-300 border-t-2 border-x border-transparent';
        });

        this.renderTabContent();
    }

    open() {
        this.isOpen = true;
        audioEngine.playPing();
        this.switchTab('planets');
        this.modalEl.classList.remove('opacity-0', 'pointer-events-none', 'scale-98');
        this.modalEl.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
    }

    close() {
        this.isOpen = false;
        this.modalEl.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
        this.modalEl.classList.add('opacity-0', 'pointer-events-none', 'scale-98');
    }

    renderTabContent() {
        const body = document.getElementById('codex-content-body');
        if (!body) return;

        if (this.activeTab === 'planets') {
            body.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${PLANETS_DATA.map(p => {
                        const biome = BIOMES_DATA[p.id] || {};
                        return `
                            <div class="scifi-panel p-5 border-cyan-500/30 bg-slate-900/60 shadow-xl space-y-4 hover:border-cyan-400 transition">
                                <div class="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                                    <h3 class="font-orbitron font-bold text-lg text-white flex items-center gap-2">
                                        <i class="fa-solid fa-globe text-cyan-400"></i> ${p.name}
                                    </h3>
                                    <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">${p.orbitRadius} AU</span>
                                </div>
                                <p class="text-xs text-slate-300 leading-relaxed">${p.description}</p>
                                <div class="space-y-1.5 text-xs bg-black/40 p-3 rounded border border-slate-800">
                                    <div class="flex justify-between"><span class="text-slate-400">Biome Class:</span><span class="font-bold text-cyan-300">${biome.name || 'Standard'}</span></div>
                                    <div class="flex justify-between"><span class="text-purple-300">Eezo Deposit:</span><span class="font-mono text-purple-200">${p.resources.eezo}%</span></div>
                                    <div class="flex justify-between"><span class="text-slate-200">Platinum Deposit:</span><span class="font-mono text-slate-300">${p.resources.plat}%</span></div>
                                    <div class="flex justify-between"><span class="text-amber-300">Palladium Deposit:</span><span class="font-mono text-amber-200">${p.resources.palla}%</span></div>
                                    <div class="flex justify-between"><span class="text-cyan-300">Iridium Deposit:</span><span class="font-mono text-cyan-200">${p.resources.iri}%</span></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (this.activeTab === 'rank') {
            const state = gameState.getState();
            body.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="scifi-panel p-6 border-amber-500/40 bg-slate-900/60 shadow-xl space-y-5">
                        <div class="text-xs font-orbitron text-amber-400 uppercase tracking-widest font-bold border-b border-amber-500/20 pb-3 flex items-center gap-2">
                            <i class="fa-solid fa-award"></i> COMMANDER SPECTRE PROFILE & REPUTATION
                        </div>
                        <div class="space-y-3 text-xs">
                            <div class="flex justify-between border-b border-slate-800 pb-2">
                                <span class="text-slate-400">Current Title:</span>
                                <span class="font-orbitron font-bold text-amber-300">SPECTRE FIRST RECON COMMANDER</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-800 pb-2">
                                <span class="text-slate-400">Security Clearance:</span>
                                <span class="font-orbitron font-bold text-emerald-400">CLASSIFIED LEVEL 5</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-800 pb-2">
                                <span class="text-slate-400">Total Credits Earned:</span>
                                <span class="font-mono font-bold text-amber-300">${state.credits} C</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-800 pb-2">
                                <span class="text-slate-400">Alliance Honor Medals:</span>
                                <span class="font-bold text-cyan-300">EXODUS STAR OF HONOR</span>
                            </div>
                        </div>
                    </div>

                    <div class="scifi-panel p-6 border-cyan-500/40 bg-slate-900/60 shadow-xl space-y-4">
                        <div class="text-xs font-orbitron text-cyan-400 uppercase tracking-widest font-bold border-b border-cyan-500/20 pb-3 flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved"></i> SPECTRE CLEARANCE BADGES
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div class="bg-black/50 p-3 rounded border border-cyan-500/30 flex items-center gap-3">
                                <i class="fa-solid fa-jet-fighter text-2xl text-cyan-400"></i>
                                <div>
                                    <div class="font-bold text-white">ACE PILOT</div>
                                    <div class="text-[10px] text-slate-400">Starship Flight Master</div>
                                </div>
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-emerald-500/30 flex items-center gap-3">
                                <i class="fa-solid fa-truck-monster text-2xl text-emerald-400"></i>
                                <div>
                                    <div class="font-bold text-white">MAKO EXPERT</div>
                                    <div class="text-[10px] text-slate-400">Surface Recon Master</div>
                                </div>
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-purple-500/30 flex items-center gap-3">
                                <i class="fa-solid fa-atom text-2xl text-purple-400"></i>
                                <div>
                                    <div class="font-bold text-white">EEZO GEOLOGIST</div>
                                    <div class="text-[10px] text-slate-400">Element Zero Specialist</div>
                                </div>
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-amber-500/30 flex items-center gap-3">
                                <i class="fa-solid fa-crosshairs text-2xl text-amber-400"></i>
                                <div>
                                    <div class="font-bold text-white">MARKSMAN</div>
                                    <div class="text-[10px] text-slate-400">Precision Lasers</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.activeTab === 'economy') {
            body.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Surface Vehicle Base Traits -->
                    <div class="scifi-panel p-6 border-emerald-500/40 bg-slate-900/60 shadow-xl space-y-4">
                        <div class="text-xs font-orbitron text-emerald-400 uppercase tracking-widest font-bold border-b border-emerald-500/20 pb-3 flex items-center gap-2">
                            <i class="fa-solid fa-truck-monster"></i> RECON VEHICLES CATALOG & BASE TRAITS
                        </div>
                        <div class="space-y-3">
                            ${Object.values(SURFACE_VEHICLES_DATA).map(v => `
                                <div class="bg-black/50 p-3.5 rounded border border-emerald-500/30 text-xs">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="font-bold text-white font-orbitron">${v.name}</span>
                                        <span class="text-amber-300 font-mono font-bold">${v.price} C</span>
                                    </div>
                                    <div class="text-slate-400 text-[11px] mb-2">${v.description}</div>
                                    <div class="flex gap-4 text-[10px] font-mono text-emerald-300">
                                        <span>HP: ${v.baseHp}</span>
                                        <span>DMG: ${v.baseDamage}</span>
                                        <span>SPEED: ${v.speedModifier >= 0 ? '+' : ''}${v.speedModifier}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Resource Valuation & Shop Upgrades -->
                    <div class="scifi-panel p-6 border-amber-500/40 bg-slate-900/60 shadow-xl space-y-5">
                        <div class="text-xs font-orbitron text-amber-400 uppercase tracking-widest font-bold border-b border-amber-500/20 pb-3 flex items-center gap-2">
                            <i class="fa-solid fa-coins"></i> EXCHANGE RATES & TECH UPGRADES
                        </div>
                        <div class="space-y-3 text-xs">
                            <div class="bg-black/50 p-3 rounded border border-amber-500/30 space-y-1.5">
                                <div class="font-bold text-amber-300 font-orbitron">RESOURCE SALE EXCHANGE VALUES</div>
                                <div class="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                                    <span>Eezo: 10 Credits / 10 Units</span>
                                    <span>Platinum: 6 Credits / 10 Units</span>
                                    <span>Palladium: 8 Credits / 10 Units</span>
                                    <span>Iridium: 7 Credits / 10 Units</span>
                                </div>
                            </div>

                            <div class="bg-black/50 p-3 rounded border border-cyan-500/30 space-y-1.5">
                                <div class="font-bold text-cyan-300 font-orbitron">SPACE TECH SHOP UPGRADES</div>
                                <div class="space-y-1 text-[11px] text-slate-300">
                                    <div>&bull; 🛡️ <span class="font-bold text-white">Titanium Armor Plating</span>: +10 HP (Cost: 100 C)</div>
                                    <div>&bull; ⚡ <span class="font-bold text-white">Nitro Thrusters</span>: +3 Speed Rating (Cost: 120 C)</div>
                                    <div>&bull; 🔫 <span class="font-bold text-white">Plasma Cannon Upgrade</span>: +3 Damage (Cost: 150 C)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.activeTab === 'tutorial') {
            body.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Space Mode Controls & Scanning -->
                    <div class="scifi-panel p-6 border-cyan-500/40 bg-slate-900/60 shadow-xl space-y-4">
                        <div class="text-xs font-orbitron text-cyan-400 uppercase tracking-widest font-bold border-b border-cyan-500/20 pb-3 flex items-center gap-2">
                            <i class="fa-solid fa-rocket"></i> SPACE MODE FLIGHT & ORBITAL SURVEY
                        </div>
                        <div class="space-y-3 text-xs leading-relaxed text-slate-300">
                            <div class="bg-black/50 p-3 rounded border border-cyan-500/30">
                                <div class="font-bold text-white font-orbitron mb-1"><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">W A S D</kbd> / Mouse Click</div>
                                Navigasi kapal antariksa di peta sistem bintang Exodus Cluster.
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-cyan-500/30">
                                <div class="font-bold text-white font-orbitron mb-1"><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">E / SPACEBAR</kbd> - Orbit & Scan</div>
                                Dekati planet hingga banner muncul, lalu tekan E untuk orbit dan membuka survey planet.
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-cyan-500/30">
                                <div class="font-bold text-white font-orbitron mb-1"><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">P</kbd> - Launch Survey Probe & Roulette</div>
                                Luncurkan probe survey untuk memindai deposit tambang dan memainkan Roulette Spin resource.
                            </div>
                        </div>
                    </div>

                    <!-- Planet Surface Recon & Combat Controls -->
                    <div class="scifi-panel p-6 border-emerald-500/40 bg-slate-900/60 shadow-xl space-y-4">
                        <div class="text-xs font-orbitron text-emerald-400 uppercase tracking-widest font-bold border-b border-emerald-500/20 pb-3 flex items-center gap-2">
                            <i class="fa-solid fa-truck-monster"></i> PLANET SURFACE RECON & COMBAT
                        </div>
                        <div class="space-y-3 text-xs leading-relaxed text-slate-300">
                            <div class="bg-black/50 p-3 rounded border border-emerald-500/30">
                                <div class="font-bold text-white font-orbitron mb-1"><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">W S</kbd> Drive / <kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">A D</kbd> Steer</div>
                                Kendalikan Mako / Hover Fighter menyusuri lanskap 3D planet.
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-emerald-500/30">
                                <div class="font-bold text-white font-orbitron mb-1"><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">LEFT CLICK / F</kbd> - Cannon Lasers</div>
                                Tembakkan meriam plasma merah untuk menghancurkan deposit kristal dan musuh.
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-emerald-500/30">
                                <div class="font-bold text-white font-orbitron mb-1"><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">RIGHT CLICK DRAG / IJKL</kbd> 3D Camera</div>
                                Tahan klik kanan mouse atau IJKL untuk memutar kamera 360°. Saat dilepas, kamera otomatis kembali ke posisi chase di belakang kendaraan.
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

export const codexModal = new CodexModal();
