/* ===================================================================
   PILOT PROFILE & CAREER ACCOMPLISHMENTS MODAL OVERLAY
   Tracks logged-in user profile, stats, rank, and saved achievements
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
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md opacity-0 pointer-events-none transition-all duration-300 scale-95 p-4';
        modal.innerHTML = `
            <div class="scifi-panel w-full max-w-2xl p-6 relative border-cyan-500/60 shadow-[0_0_50px_rgba(56,189,248,0.25)] text-cyan-100 flex flex-col max-h-[90vh]">
                <!-- Header -->
                <div class="flex justify-between items-center border-b border-cyan-500/30 pb-4 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-cyan-950/80 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                            <img id="prof-avatar-img" src="https://via.placeholder.com/48" class="w-full h-full rounded-full object-cover hidden" alt="Profile">
                            <i id="prof-avatar-icon" class="fa-solid fa-user-astronaut text-2xl"></i>
                        </div>
                        <div>
                            <div class="text-[10px] text-cyan-400 font-orbitron tracking-widest uppercase">Alliance Dossier</div>
                            <div id="prof-display-name" class="text-xl font-bold font-orbitron text-white">COMMANDER (GUEST)</div>
                            <div id="prof-email-badge" class="text-xs text-slate-400 font-mono">Offline / Guest Pilot Session</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span id="prof-rank-badge" class="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded text-xs font-orbitron font-bold">
                            RANK: SPECTRE RECON
                        </span>
                        <button id="btn-close-profile" class="text-slate-400 hover:text-white text-xl font-bold px-2">✕</button>
                    </div>
                </div>

                <!-- Scrollable Body -->
                <div class="overflow-y-auto pr-2 flex-1 space-y-5">
                    <!-- Career Highlights Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="bg-slate-900/80 p-3 rounded-lg border border-cyan-500/30 text-center">
                            <div class="text-[10px] text-cyan-400 font-orbitron tracking-wider font-bold mb-1">TOTAL CREDITS</div>
                            <div id="prof-stat-credits" class="text-lg font-bold font-orbitron text-amber-300">500 C</div>
                        </div>
                        <div class="bg-slate-900/80 p-3 rounded-lg border border-emerald-500/30 text-center">
                            <div class="text-[10px] text-emerald-400 font-orbitron tracking-wider font-bold mb-1">PLANETS VISITED</div>
                            <div id="prof-stat-planets" class="text-lg font-bold font-orbitron text-emerald-300">6 / 6</div>
                        </div>
                        <div class="bg-slate-900/80 p-3 rounded-lg border border-purple-500/30 text-center">
                            <div class="text-[10px] text-purple-400 font-orbitron tracking-wider font-bold mb-1">TOTAL RESOURCES</div>
                            <div id="prof-stat-resources" class="text-lg font-bold font-orbitron text-purple-300">1,160</div>
                        </div>
                        <div class="bg-slate-900/80 p-3 rounded-lg border border-rose-500/30 text-center">
                            <div class="text-[10px] text-rose-400 font-orbitron tracking-wider font-bold mb-1">WAR BATTLES</div>
                            <div id="prof-stat-battles" class="text-lg font-bold font-orbitron text-rose-300">0 KILLS</div>
                        </div>
                    </div>

                    <!-- Active Hangar & Upgrades Overview -->
                    <div class="bg-slate-950/80 border border-amber-500/30 rounded-lg p-4">
                        <div class="text-xs font-orbitron text-amber-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-plane-up font-bold"></i> ACTIVE FLEET & RECON SPECIFICATIONS
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="bg-black/50 p-3 rounded border border-cyan-500/30">
                                <div class="text-[10px] text-cyan-400 font-orbitron font-bold uppercase mb-1">ACTIVE STARSHIP</div>
                                <div id="prof-ship-name" class="text-sm font-bold text-white font-orbitron">SSV Normandy SR-3</div>
                                <div id="prof-ship-desc" class="text-[11px] text-slate-400 mt-1">Alliance Stealth Recon Frigate</div>
                            </div>
                            <div class="bg-black/50 p-3 rounded border border-emerald-500/30">
                                <div class="text-[10px] text-emerald-400 font-orbitron font-bold uppercase mb-1">ACTIVE RECON VEHICLE</div>
                                <div id="prof-veh-name" class="text-sm font-bold text-white font-orbitron">M-35 Mako Heavy Rover</div>
                                <div id="prof-veh-stats" class="text-[11px] text-emerald-300 mt-1 font-mono">100 HP | 2 DMG | +0 Speed Rating</div>
                            </div>
                        </div>
                    </div>

                    <!-- Cargo Storage Breakdown -->
                    <div class="bg-slate-900/70 border border-cyan-500/30 rounded-lg p-4">
                        <div class="text-xs font-orbitron text-cyan-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-boxes-stacked"></i> ALLIANCE CARGO MANIFEST
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div class="bg-purple-950/40 p-2.5 rounded border border-purple-500/30 text-purple-200">
                                <i class="fa-solid fa-atom text-purple-400 mr-1"></i> Eezo: <span id="prof-cargo-eezo" class="font-bold text-white">0</span>
                            </div>
                            <div class="bg-slate-900/60 p-2.5 rounded border border-slate-500/30 text-slate-200">
                                <i class="fa-solid fa-gem text-slate-300 mr-1"></i> Platinum: <span id="prof-cargo-plat" class="font-bold text-white">0</span>
                            </div>
                            <div class="bg-amber-950/40 p-2.5 rounded border border-amber-500/30 text-amber-200">
                                <i class="fa-solid fa-cubes text-amber-400 mr-1"></i> Palladium: <span id="prof-cargo-palla" class="font-bold text-white">0</span>
                            </div>
                            <div class="bg-cyan-950/40 p-2.5 rounded border border-cyan-500/30 text-cyan-200">
                                <i class="fa-solid fa-shield-halved text-cyan-400 mr-1"></i> Iridium: <span id="prof-cargo-iri" class="font-bold text-white">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="border-t border-cyan-500/30 pt-4 mt-4 flex justify-between items-center">
                    <div id="prof-session-type" class="text-xs text-slate-400 flex items-center gap-2">
                        <i class="fa-solid fa-circle text-[8px] text-emerald-400 animate-pulse"></i> Session Synced with Firebase Cloud
                    </div>
                    <div class="flex gap-3">
                        <button id="btn-prof-logout" class="px-4 py-1.5 text-xs font-bold text-rose-300 border border-rose-500/40 rounded hover:text-white transition hidden">
                            LOGOUT SESSION
                        </button>
                        <button id="btn-prof-close" class="scifi-button px-5 py-1.5 text-xs font-bold text-cyan-200 border-cyan-400 hover:text-white">
                            CLOSE DOSSIER
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalEl = modal;

        this.setupEvents();
    }

    setupEvents() {
        document.getElementById('btn-close-profile').addEventListener('click', () => this.close());
        document.getElementById('btn-prof-close').addEventListener('click', () => this.close());
        this.modalEl.addEventListener('click', (e) => {
            if (e.target === this.modalEl) this.close();
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
        const user = auth.currentUser;
        const stats = gameState.getEffectiveVehicleStats();
        const currentVeh = SURFACE_VEHICLES_DATA[state.surfaceVehicleType] || SURFACE_VEHICLES_DATA.mako;
        const currentShip = SHIPS_DATA[state.shipType] || SHIPS_DATA.normandy;

        const avatarImg = document.getElementById('prof-avatar-img');
        const avatarIcon = document.getElementById('prof-avatar-icon');
        const logoutBtn = document.getElementById('btn-prof-logout');

        if (user) {
            avatarImg.src = user.photoURL || 'https://via.placeholder.com/48';
            avatarImg.classList.remove('hidden');
            avatarIcon.classList.add('hidden');

            document.getElementById('prof-display-name').textContent = user.displayName?.toUpperCase() || 'COMMANDER';
            document.getElementById('prof-email-badge').textContent = user.email;
            document.getElementById('prof-email-badge').className = 'text-xs text-cyan-300 font-mono font-bold';
            document.getElementById('prof-rank-badge').textContent = 'RANK: SPECTRE COMMANDER';
            logoutBtn?.classList.remove('hidden');
        } else {
            avatarImg.classList.add('hidden');
            avatarIcon.classList.remove('hidden');

            document.getElementById('prof-display-name').textContent = 'COMMANDER (GUEST)';
            document.getElementById('prof-email-badge').textContent = 'Offline / Guest Pilot Session';
            document.getElementById('prof-email-badge').className = 'text-xs text-slate-400 font-mono';
            document.getElementById('prof-rank-badge').textContent = 'RANK: GUEST RECON';
            logoutBtn?.classList.add('hidden');
        }

        document.getElementById('prof-stat-credits').textContent = `${state.credits} C`;
        document.getElementById('prof-stat-planets').textContent = `${PLANETS_DATA.length} / ${PLANETS_DATA.length}`;

        const totalCargo = state.cargo.eezo + state.cargo.plat + state.cargo.palla + state.cargo.iri;
        document.getElementById('prof-stat-resources').textContent = totalCargo.toLocaleString();

        document.getElementById('prof-ship-name').textContent = currentShip.name;
        document.getElementById('prof-ship-desc').textContent = currentShip.description;

        document.getElementById('prof-veh-name').textContent = currentVeh.name;
        document.getElementById('prof-veh-stats').textContent = `${stats.hp} HP | ${stats.damage} DMG | ${stats.speedModifier >= 0 ? '+' : ''}${stats.speedModifier} Speed Rating`;

        document.getElementById('prof-cargo-eezo').textContent = state.cargo.eezo;
        document.getElementById('prof-cargo-plat').textContent = state.cargo.plat;
        document.getElementById('prof-cargo-palla').textContent = state.cargo.palla;
        document.getElementById('prof-cargo-iri').textContent = state.cargo.iri;
    }
}

export const profileModal = new ProfileModal();
