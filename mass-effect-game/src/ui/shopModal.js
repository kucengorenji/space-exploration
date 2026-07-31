/* ===================================================================
   SCI-FI SHOP SYSTEM & VEHICLE UPGRADE MODAL OVERLAY
   =================================================================== */

import { gameState } from '../core/state.js';
import { audioEngine } from '../core/audio.js';
import { SURFACE_VEHICLES_DATA } from '../data/surfaceVehicles.js';

export class ShopManager {
    constructor() {
        this.modalEl = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        const modal = document.createElement('div');
        modal.id = 'space-shop-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md opacity-0 pointer-events-none transition-all duration-300 scale-95 p-4';
        modal.innerHTML = `
            <div class="scifi-panel w-full max-w-3xl p-6 relative border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-cyan-100 flex flex-col max-h-[90vh]">
                <!-- Header -->
                <div class="flex justify-between items-center border-b border-amber-500/30 pb-4 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full border border-amber-400 flex items-center justify-center bg-amber-950/60 text-amber-400">
                            <i class="fa-solid fa-cart-shopping text-lg"></i>
                        </div>
                        <div>
                            <div class="text-[10px] text-amber-400 font-orbitron tracking-widest uppercase">Alliance Armory & Recon Hangar</div>
                            <div class="text-xl font-bold font-orbitron text-white">SPACE TECH SHOP</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="bg-amber-950/70 border border-amber-500/40 rounded px-4 py-1.5 flex items-center gap-2">
                            <i class="fa-solid fa-coins text-amber-400"></i>
                            <span id="shop-credits-val" class="font-orbitron font-bold text-amber-300 text-base">500</span>
                            <span class="text-xs text-amber-400/70 font-bold">CREDITS</span>
                        </div>
                        <button id="btn-close-shop" class="text-slate-400 hover:text-white text-xl font-bold px-2">✕</button>
                    </div>
                </div>

                <!-- Scrollable Body -->
                <div class="overflow-y-auto pr-2 flex-1 space-y-5">
                    <!-- Current Active Vehicle Stats Bar -->
                    <div class="bg-slate-900/80 border border-cyan-500/30 rounded-lg p-4">
                        <div class="flex justify-between items-center mb-3">
                            <div class="text-xs font-orbitron text-cyan-400 uppercase tracking-wider font-bold">
                                ACTIVE VEHICLE: <span id="shop-active-veh-name" class="text-white">M-35 Mako</span>
                            </div>
                            <div id="shop-active-veh-type" class="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-orbitron">
                                6-WHEEL ROVER
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-3 text-center">
                            <div class="bg-black/50 p-2.5 rounded border border-emerald-500/30">
                                <div class="text-[10px] text-emerald-400 font-bold tracking-wider"><i class="fa-solid fa-shield-heart"></i> HULL INTEGRITY</div>
                                <div id="stat-val-hp" class="text-lg font-bold font-orbitron text-emerald-300">100 HP</div>
                            </div>
                            <div class="bg-black/50 p-2.5 rounded border border-rose-500/30">
                                <div class="text-[10px] text-rose-400 font-bold tracking-wider"><i class="fa-solid fa-bolt"></i> CANNON DAMAGE</div>
                                <div id="stat-val-dmg" class="text-lg font-bold font-orbitron text-rose-300">2 DMG</div>
                            </div>
                            <div class="bg-black/50 p-2.5 rounded border border-amber-500/30">
                                <div class="text-[10px] text-amber-400 font-bold tracking-wider"><i class="fa-solid fa-gauge-high"></i> SPEED RATING</div>
                                <div id="stat-val-speed" class="text-lg font-bold font-orbitron text-amber-300">+0 MOD</div>
                            </div>
                        </div>
                    </div>

                    <!-- Upgrade Items Section -->
                    <div>
                        <div class="text-xs font-orbitron text-amber-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-wrench"></i> AVAILABLE VEHICLE UPGRADES
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <!-- Item 1: HP -->
                            <div class="bg-slate-950/70 border border-emerald-500/40 rounded-lg p-4 flex flex-col justify-between hover:border-emerald-400 transition">
                                <div>
                                    <div class="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                                        <i class="fa-solid fa-shield-halved"></i>
                                    </div>
                                    <div class="font-orbitron font-bold text-white text-sm mb-1">Titanium Plating</div>
                                    <div class="text-xs text-emerald-300 font-bold mb-2">+10 Hull HP</div>
                                    <div class="text-[11px] text-slate-400 mb-3">Reinforces chassis frame to absorb extra combat impact on hazardous planets.</div>
                                </div>
                                <div>
                                    <div class="text-xs font-bold text-amber-300 font-orbitron mb-2">100 CREDITS</div>
                                    <button id="btn-buy-hp" class="scifi-button w-full py-1.5 text-xs font-bold text-emerald-300 border-emerald-500 hover:text-white">
                                        BUY +10 HP
                                    </button>
                                </div>
                            </div>

                            <!-- Item 2: Speed -->
                            <div class="bg-slate-950/70 border border-amber-500/40 rounded-lg p-4 flex flex-col justify-between hover:border-amber-400 transition">
                                <div>
                                    <div class="w-8 h-8 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                                        <i class="fa-solid fa-gauge-high"></i>
                                    </div>
                                    <div class="font-orbitron font-bold text-white text-sm mb-1">Nitro Thruster</div>
                                    <div class="text-xs text-amber-300 font-bold mb-2">+3 Speed Modifier</div>
                                    <div class="text-[11px] text-slate-400 mb-3">Injects liquid nitro into engine thrusters for faster terrain movement.</div>
                                </div>
                                <div>
                                    <div class="text-xs font-bold text-amber-300 font-orbitron mb-2">120 CREDITS</div>
                                    <button id="btn-buy-speed" class="scifi-button w-full py-1.5 text-xs font-bold text-amber-300 border-amber-500 hover:text-white">
                                        BUY +3 SPEED
                                    </button>
                                </div>
                            </div>

                            <!-- Item 3: Damage -->
                            <div class="bg-slate-950/70 border border-rose-500/40 rounded-lg p-4 flex flex-col justify-between hover:border-rose-400 transition">
                                <div>
                                    <div class="w-8 h-8 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
                                        <i class="fa-solid fa-burst"></i>
                                    </div>
                                    <div class="font-orbitron font-bold text-white text-sm mb-1">Plasma Cannon</div>
                                    <div class="text-xs text-rose-300 font-bold mb-2">+3 Cannon Damage</div>
                                    <div class="text-[11px] text-slate-400 mb-3">Upgrades laser focal lenses to deal significantly higher damage per shot.</div>
                                </div>
                                <div>
                                    <div class="text-xs font-bold text-amber-300 font-orbitron mb-2">150 CREDITS</div>
                                    <button id="btn-buy-dmg" class="scifi-button w-full py-1.5 text-xs font-bold text-rose-300 border-rose-500 hover:text-white">
                                        BUY +3 DMG
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cargo Resource Exchange (Earn Credits) -->
                    <div class="bg-slate-900/60 border border-cyan-500/30 rounded-lg p-4">
                        <div class="text-xs font-orbitron text-cyan-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-[#06b6d4]"></i> RESOURCE EXCHANGE (SELL FOR CREDITS)
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <button id="sell-eezo" class="bg-purple-950/60 border border-purple-500/40 hover:border-purple-400 rounded p-2 text-center transition">
                                <div class="text-[10px] text-purple-300 font-bold">10 EEZO</div>
                                <div class="text-xs text-amber-300 font-orbitron font-bold">+100 Credits</div>
                            </button>
                            <button id="sell-plat" class="bg-slate-900/80 border border-slate-400/40 hover:border-slate-300 rounded p-2 text-center transition">
                                <div class="text-[10px] text-slate-200 font-bold">10 PLATINUM</div>
                                <div class="text-xs text-amber-300 font-orbitron font-bold">+60 Credits</div>
                            </button>
                            <button id="sell-palla" class="bg-amber-950/60 border border-amber-500/40 hover:border-amber-400 rounded p-2 text-center transition">
                                <div class="text-[10px] text-amber-300 font-bold">10 PALLADIUM</div>
                                <div class="text-xs text-amber-300 font-orbitron font-bold">+80 Credits</div>
                            </button>
                            <button id="sell-iri" class="bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 rounded p-2 text-center transition">
                                <div class="text-[10px] text-cyan-300 font-bold">10 IRIDIUM</div>
                                <div class="text-xs text-amber-300 font-orbitron font-bold">+70 Credits</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalEl = modal;

        this.setupEvents();
    }

    setupEvents() {
        document.getElementById('btn-close-shop').addEventListener('click', () => this.close());
        this.modalEl.addEventListener('click', (e) => {
            if (e.target === this.modalEl) this.close();
        });

        document.getElementById('btn-buy-hp').addEventListener('click', () => {
            if (gameState.buyUpgrade('hp')) {
                audioEngine.playPing();
                this.updateUI();
            }
        });

        document.getElementById('btn-buy-speed').addEventListener('click', () => {
            if (gameState.buyUpgrade('speed')) {
                audioEngine.playPing();
                this.updateUI();
            }
        });

        document.getElementById('btn-buy-dmg').addEventListener('click', () => {
            if (gameState.buyUpgrade('damage')) {
                audioEngine.playPing();
                this.updateUI();
            }
        });

        // Sell Resource Listeners
        document.getElementById('sell-eezo').addEventListener('click', () => {
            if (gameState.sellResource('eezo', 10)) { audioEngine.playPing(); this.updateUI(); }
        });
        document.getElementById('sell-plat').addEventListener('click', () => {
            if (gameState.sellResource('plat', 10)) { audioEngine.playPing(); this.updateUI(); }
        });
        document.getElementById('sell-palla').addEventListener('click', () => {
            if (gameState.sellResource('palla', 10)) { audioEngine.playPing(); this.updateUI(); }
        });
        document.getElementById('sell-iri').addEventListener('click', () => {
            if (gameState.sellResource('iri', 10)) { audioEngine.playPing(); this.updateUI(); }
        });
    }

    open() {
        this.isOpen = true;
        audioEngine.playPing();
        this.updateUI();
        this.modalEl.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        this.modalEl.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
    }

    close() {
        this.isOpen = false;
        this.modalEl.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
        this.modalEl.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
    }

    updateUI() {
        const state = gameState.getState();
        const stats = gameState.getEffectiveVehicleStats();
        const currentVeh = SURFACE_VEHICLES_DATA[state.surfaceVehicleType] || SURFACE_VEHICLES_DATA.mako;

        document.getElementById('shop-credits-val').textContent = state.credits;
        document.getElementById('shop-active-veh-name').textContent = currentVeh.name;
        document.getElementById('shop-active-veh-type').textContent = currentVeh.type.toUpperCase();

        document.getElementById('stat-val-hp').textContent = `${stats.hp} HP`;
        document.getElementById('stat-val-dmg').textContent = `${stats.damage} DMG`;
        document.getElementById('stat-val-speed').textContent = `${stats.speedModifier >= 0 ? '+' : ''}${stats.speedModifier} MOD`;
    }
}

export const shopManager = new ShopManager();
