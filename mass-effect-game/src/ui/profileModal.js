/* ===================================================================
   FULL PAGE ALLIANCE COMMAND DOSSIER & CAREER OVERLAY (100% SCREEN)
   Full-screen profile dashboard for pilot progress, fleet, and stats
   =================================================================== */

import { gameState } from '../core/state.js';
import { audioEngine } from '../core/audio.js';
import { auth } from '../multiplayer/firebase.js';
import { logoutUser } from '../multiplayer/auth.js';
import { PLANETS_DATA } from '../data/planets.js';
import { SURFACE_VEHICLES_DATA } from '../data/surfaceVehicles.js';
import { SHIPS_DATA } from '../data/ships.js';

export class ProfileModal {
    constructor() {
        this.modalEl = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        const modal = document.createElement('div');
        modal.id = 'user-profile-modal';
        modal.className = 'fixed inset-0 z-50 w-screen h-screen bg-slate-950/95 backdrop-blur-2xl opacity-0 pointer-events-none transition-all duration-300 scale-98 p-4 md:p-8 flex flex-col justify-between overflow-y-auto text-cyan-100 font-sans';
        modal.innerHTML = `
            <!-- Top Header Bar -->
            <header class="flex justify-between items-center border-b border-cyan-500/40 pb-4 mb-6">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-cyan-950/80 text-cyan-300 shadow-[0_0_25px_rgba(56,189,248,0.4)] overflow-hidden">
                        <img id="prof-avatar-img" src="https://via.placeholder.com/64" class="w-full h-full object-cover hidden" alt="Profile">
                        <i id="prof-avatar-icon" class="fa-solid fa-user-astronaut text-3xl"></i>
                    </div>
                    <div>
                        <div class="text-xs text-cyan-400 font-orbitron tracking-[0.3em] uppercase">SYSTEM COMMAND DOSSIER</div>
                        <div id="prof-display-name" class="text-2xl md:text-3xl font-black font-orbitron text-white tracking-wider">COMMANDER (GUEST)</div>
                        <div id="prof-email-badge" class="text-xs text-slate-400 font-mono mt-0.5">Offline / Guest Pilot Session</div>
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <span id="prof-rank-badge" class="hidden md:inline-block bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-4 py-1.5 rounded text-xs font-orbitron font-bold tracking-widest shadow-lg">
                        RANK: SPECTRE COMMANDER
                    </span>

                    <!-- Prominent X Close Button -->
                    <button id="btn-close-profile" class="scifi-button px-5 py-2 text-sm font-bold text-rose-300 border-rose-500/60 hover:text-white flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                        <i class="fa-solid fa-xmark text-base"></i> CLOSE DOSSIER [ESC]
                    </button>
                </div>
            </header>

            <!-- Main Full-Page Dashboard Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 mb-6">
                <!-- Column 1: Officer Identity & Dossier Bio -->
                <div class="space-y-6 flex flex-col justify-between">
                    <div class="scifi-panel p-5 border-cyan-500/40 bg-slate-900/60 shadow-xl space-y-4">
                        <div class="text-xs font-orbitron text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                            <i class="fa-solid fa-address-card"></i> OFFICER CREDENTIALS
                        </div>
                        <div class="space-y-3 text-xs">
                            <div class="flex justify-between border-b border-slate-800 pb-1.5">
                                <span class="text-slate-400">Security Clearance:</span>
                                <span class="font-orbitron font-bold text-emerald-400">LEVEL 5 - SPECTRE</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-800 pb-1.5">
                                <span class="text-slate-400">Affiliation:</span>
                                <span class="font-orbitron font-bold text-sky-300">Systems Alliance Fleet</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-800 pb-1.5">
                                <span class="text-slate-400">Primary Sector:</span>
                                <span class="font-orbitron font-bold text-amber-300">Exodus Cluster Map</span>
                            </div>
                            <div class="flex justify-between border-b border-slate-800 pb-1.5">
                                <span class="text-slate-400">Cloud Sync Status:</span>
                                <span id="prof-sync-indicator" class="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                                    <i class="fa-solid fa-cloud-arrow-up text-xs"></i> Synced (Firestore)
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Career Milestones Summary -->
                    <div class="scifi-panel p-5 border-amber-500/40 bg-slate-900/60 shadow-xl space-y-3">
                        <div class="text-xs font-orbitron text-amber-400 uppercase tracking-widest font-bold flex items-center gap-2 border-b border-amber-500/20 pb-2">
                            <i class="fa-solid fa-trophy"></i> CAREER HIGHLIGHTS
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-center">
                            <div class="bg-black/50 p-3 rounded border border-amber-500/30">
                                <div class="text-[10px] text-amber-400 font-orbitron font-bold">TOTAL CREDITS</div>
                                <div id="prof-stat-credits" class="text-xl font-bold font-orbitron text-amber-300 mt-1">500 C</div>
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-emerald-500/30">
                                <div class="text-[10px] text-emerald-400 font-orbitron font-bold">PLANETS VISITED</div>
                                <div id="prof-stat-planets" class="text-xl font-bold font-orbitron text-emerald-300 mt-1">6 / 6</div>
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-purple-500/30">
                                <div class="text-[10px] text-purple-400 font-orbitron font-bold">MINED RESOURCES</div>
                                <div id="prof-stat-resources" class="text-xl font-bold font-orbitron text-purple-300 mt-1">1,160</div>
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-rose-500/30">
                                <div class="text-[10px] text-rose-400 font-orbitron font-bold">WAR BATTLES</div>
                                <div id="prof-stat-battles" class="text-xl font-bold font-orbitron text-rose-300 mt-1">0 KILLS</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Column 2: Active Fleet Hangar & Upgrade Stats -->
                <div class="scifi-panel p-6 border-cyan-500/40 bg-slate-900/60 shadow-xl flex flex-col justify-between space-y-6">
                    <div>
                        <div class="text-xs font-orbitron text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-2 border-b border-cyan-500/20 pb-3 mb-4">
                            <i class="fa-solid fa-plane-up"></i> ACTIVE FLEET HANGAR & RECON VEHICLE
                        </div>
                        <div class="space-y-4">
                            <div class="bg-black/60 p-4 rounded-lg border border-cyan-500/30">
                                <div class="text-[10px] text-cyan-400 font-orbitron font-bold uppercase tracking-wider mb-1">COMMAND STARSHIP</div>
                                <div id="prof-ship-name" class="text-lg font-bold text-white font-orbitron">SSV Normandy SR-3</div>
                                <div id="prof-ship-desc" class="text-xs text-slate-400 mt-1 leading-relaxed">Alliance Stealth Recon Frigate equipped with Tantalus Drive Core.</div>
                            </div>

                            <div class="bg-black/60 p-4 rounded-lg border border-emerald-500/30">
                                <div class="text-[10px] text-emerald-400 font-orbitron font-bold uppercase tracking-wider mb-1">SURFACE RECON VEHICLE</div>
                                <div id="prof-veh-name" class="text-lg font-bold text-white font-orbitron">M-35 Mako Heavy Rover</div>
                                <div id="prof-veh-stats" class="text-xs text-emerald-300 font-mono mt-1">100 HP | 2 Cannon DMG | +0 Speed Rating</div>
                            </div>
                        </div>
                    </div>

                    <!-- Tech Upgrades Matrix -->
                    <div class="bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-4 space-y-3">
                        <div class="text-xs font-orbitron text-cyan-300 font-bold uppercase tracking-wider">HULL & WEAPON TECH UPGRADES</div>
                        <div class="grid grid-cols-3 gap-2 text-center text-xs">
                            <div class="bg-slate-900/80 p-2.5 rounded border border-cyan-500/30">
                                <div class="text-[9px] text-cyan-400 font-orbitron">ARMOR PLATING</div>
                                <div id="prof-upg-hp" class="text-sm font-bold text-cyan-200 mt-0.5">+0 HP</div>
                            </div>
                            <div class="bg-slate-900/80 p-2.5 rounded border border-amber-500/30">
                                <div class="text-[9px] text-amber-400 font-orbitron">THRUSTERS</div>
                                <div id="prof-upg-speed" class="text-sm font-bold text-amber-200 mt-0.5">+0 SPEED</div>
                            </div>
                            <div class="bg-slate-900/80 p-2.5 rounded border border-rose-500/30">
                                <div class="text-[9px] text-rose-400 font-orbitron">PLASMA CANNON</div>
                                <div id="prof-upg-damage" class="text-sm font-bold text-rose-200 mt-0.5">+0 DMG</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Column 3: Full Cargo Manifest & Resource Values -->
                <div class="scifi-panel p-6 border-purple-500/40 bg-slate-900/60 shadow-xl flex flex-col justify-between space-y-6">
                    <div>
                        <div class="text-xs font-orbitron text-purple-400 uppercase tracking-widest font-bold flex items-center gap-2 border-b border-purple-500/20 pb-3 mb-4">
                            <i class="fa-solid fa-boxes-stacked"></i> FULL CARGO MANIFEST
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div class="bg-purple-950/50 p-3.5 rounded-lg border border-purple-500/30 flex items-center justify-between">
                                <div>
                                    <div class="text-purple-300 font-bold flex items-center gap-1.5"><i class="fa-solid fa-atom"></i> Eezo</div>
                                    <div class="text-[10px] text-purple-400/80">Element Zero</div>
                                </div>
                                <div id="prof-cargo-eezo" class="text-lg font-bold text-white font-mono">0</div>
                            </div>
                            <div class="bg-slate-900/70 p-3.5 rounded-lg border border-slate-500/30 flex items-center justify-between">
                                <div>
                                    <div class="text-slate-200 font-bold flex items-center gap-1.5"><i class="fa-solid fa-gem"></i> Platinum</div>
                                    <div class="text-[10px] text-slate-400">Precious Metal</div>
                                </div>
                                <div id="prof-cargo-plat" class="text-lg font-bold text-white font-mono">0</div>
                            </div>
                            <div class="bg-amber-950/50 p-3.5 rounded-lg border border-amber-500/30 flex items-center justify-between">
                                <div>
                                    <div class="text-amber-300 font-bold flex items-center gap-1.5"><i class="fa-solid fa-cubes"></i> Palladium</div>
                                    <div class="text-[10px] text-amber-400/80">Heavy Alloy</div>
                                </div>
                                <div id="prof-cargo-palla" class="text-lg font-bold text-white font-mono">0</div>
                            </div>
                            <div class="bg-cyan-950/50 p-3.5 rounded-lg border border-cyan-500/30 flex items-center justify-between">
                                <div>
                                    <div class="text-cyan-300 font-bold flex items-center gap-1.5"><i class="fa-solid fa-shield-halved"></i> Iridium</div>
                                    <div class="text-[10px] text-cyan-400/80">Shield Element</div>
                                </div>
                                <div id="prof-cargo-iri" class="text-lg font-bold text-white font-mono">0</div>
                            </div>
                        </div>
                    </div>

                    <!-- Session Logout Button -->
                    <div class="pt-4 border-t border-slate-800 flex justify-between items-center">
                        <div class="text-xs text-slate-400">
                            Alliance Security Protocol v3.2
                        </div>
                        <button id="btn-prof-logout" class="px-5 py-2 text-xs font-bold text-rose-300 border border-rose-500/50 rounded hover:bg-rose-950/60 hover:text-white transition flex items-center gap-2 cursor-pointer hidden">
                            <i class="fa-solid fa-right-from-bracket"></i> LOGOUT SESSION
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer Command Bar -->
            <footer class="border-t border-cyan-500/40 pt-4 flex justify-between items-center text-xs text-slate-400">
                <div>SYSTEMS ALLIANCE COMMAND &bull; EXODUS CLUSTER RECON</div>
                <div>PRESS <kbd class="px-2 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">ESC</kbd> TO RETURN TO FLEET</div>
            </footer>
        `;

        document.body.appendChild(modal);
        this.modalEl = modal;

        this.setupEvents();
    }

    setupEvents() {
        document.getElementById('btn-close-profile').addEventListener('click', () => this.close());
        this.modalEl.addEventListener('click', (e) => {
            if (e.target === this.modalEl) this.close();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        document.getElementById('btn-prof-logout')?.addEventListener('click', async () => {
            audioEngine.playPing();
            this.close();
            await logoutUser();
        });
    }

    open() {
        this.isOpen = true;
        audioEngine.playPing();
        this.updateUI();
        this.modalEl.classList.remove('opacity-0', 'pointer-events-none', 'scale-98');
        this.modalEl.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
    }

    close() {
        this.isOpen = false;
        this.modalEl.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
        this.modalEl.classList.add('opacity-0', 'pointer-events-none', 'scale-98');
    }

    updateUI() {
        const state = gameState.getState();
        const user = auth.currentUser;
        const stats = gameState.getEffectiveVehicleStats();
        const currentVeh = SURFACE_VEHICLES_DATA[state.surfaceVehicleType] || SURFACE_VEHICLES_DATA.mako;
        const currentShip = SHIPS_DATA[state.shipType] || SHIPS_DATA.normandy;

        const avatarImg = document.getElementById('prof-avatar-img');
        const avatarIcon = document.getElementById('prof-avatar-icon');
        const logoutBtn = document.getElementById('btn-prof-logout');
        const syncIndicator = document.getElementById('prof-sync-indicator');

        if (user) {
            avatarImg.src = user.photoURL || 'https://via.placeholder.com/64';
            avatarImg.classList.remove('hidden');
            avatarIcon.classList.add('hidden');

            document.getElementById('prof-display-name').textContent = user.displayName?.toUpperCase() || 'COMMANDER';
            document.getElementById('prof-email-badge').textContent = user.email;
            document.getElementById('prof-email-badge').className = 'text-xs text-cyan-300 font-mono font-bold';
            document.getElementById('prof-rank-badge').textContent = 'RANK: SPECTRE COMMANDER';
            logoutBtn?.classList.remove('hidden');
            if (syncIndicator) syncIndicator.innerHTML = '<i class="fa-solid fa-cloud-arrow-up text-xs text-emerald-400"></i> Synced (Firestore)';
        } else {
            avatarImg.classList.add('hidden');
            avatarIcon.classList.remove('hidden');

            document.getElementById('prof-display-name').textContent = 'COMMANDER (GUEST)';
            document.getElementById('prof-email-badge').textContent = 'Offline / Guest Pilot Session';
            document.getElementById('prof-email-badge').className = 'text-xs text-slate-400 font-mono';
            document.getElementById('prof-rank-badge').textContent = 'RANK: GUEST RECON';
            logoutBtn?.classList.add('hidden');
            if (syncIndicator) syncIndicator.innerHTML = '<i class="fa-solid fa-hard-drive text-xs text-slate-400"></i> Local Storage Only';
        }

        document.getElementById('prof-stat-credits').textContent = `${state.credits} C`;
        document.getElementById('prof-stat-planets').textContent = `${PLANETS_DATA.length} / ${PLANETS_DATA.length}`;

        const totalCargo = state.cargo.eezo + state.cargo.plat + state.cargo.palla + state.cargo.iri;
        document.getElementById('prof-stat-resources').textContent = totalCargo.toLocaleString();

        document.getElementById('prof-ship-name').textContent = currentShip.name;
        document.getElementById('prof-ship-desc').textContent = currentShip.description;

        document.getElementById('prof-veh-name').textContent = currentVeh.name;
        document.getElementById('prof-veh-stats').textContent = `${stats.hp} HP | ${stats.damage} Cannon DMG | ${stats.speedModifier >= 0 ? '+' : ''}${stats.speedModifier} Speed Rating`;

        document.getElementById('prof-upg-hp').textContent = `+${state.vehicleUpgrades.hpBonus} HP`;
        document.getElementById('prof-upg-speed').textContent = `+${state.vehicleUpgrades.speedBonus} SPD`;
        document.getElementById('prof-upg-damage').textContent = `+${state.vehicleUpgrades.damageBonus} DMG`;

        document.getElementById('prof-cargo-eezo').textContent = state.cargo.eezo;
        document.getElementById('prof-cargo-plat').textContent = state.cargo.plat;
        document.getElementById('prof-cargo-palla').textContent = state.cargo.palla;
        document.getElementById('prof-cargo-iri').textContent = state.cargo.iri;
    }
}

export const profileModal = new ProfileModal();
