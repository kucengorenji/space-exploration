/* ===================================================================
   REACTIVE UI & HUD MANAGER WITH VEHICLE HANGAR & LASERS
   =================================================================== */

import { gameState } from '../core/state.js';
import { audioEngine } from '../core/audio.js';
import { rouletteManager, getSpinsLeft } from './roulette.js';
import { shopManager } from './shopModal.js';
import { loginScreen } from './loginScreen.js';
import { profileModal } from './profileModal.js';
import { subscribeAuthState } from '../multiplayer/auth.js';

export class HUDManager {
    constructor(appContainer) {
        this.container = appContainer;
        this.modalPlanet = null;
        this.renderLayout();
        this.setupSubscriptions();
    }

    renderLayout() {
        this.container.innerHTML = `
            <!-- 3D Canvas Viewport Container -->
            <div id="canvas-container" class="w-full h-full absolute inset-0 z-0"></div>

            <!-- Scanlines CRT FX -->
            <div class="scanlines absolute inset-0 z-10"></div>

            <!-- Screen Reticle for Space Mode -->
            <div id="target-reticle" class="absolute z-20 pointer-events-none transition-all duration-150 opacity-0 -translate-x-1/2 -translate-y-1/2">
                <div class="w-16 h-16 border-2 border-dashed border-amber-400 rounded-full flex items-center justify-center animate-reticle">
                    <div class="w-3 h-3 bg-amber-400/80 rounded-full"></div>
                </div>
                <div id="reticle-label" class="text-[10px] font-orbitron font-bold text-amber-300 text-center tracking-widest mt-1 bg-black/60 px-2 py-0.5 rounded border border-amber-500/40">
                    TARGET LOCKED
                </div>
            </div>

            <!-- Header Bar -->
            <header class="absolute top-4 left-4 right-4 z-20 flex flex-wrap justify-between items-center pointer-events-none gap-3">
                <div class="scifi-panel p-3 px-5 flex items-center gap-4 pointer-events-auto">
                    <div class="w-10 h-10 rounded-full border border-cyan-400/60 flex items-center justify-center bg-cyan-950/50 text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                        <i id="vessel-icon" class="fa-solid fa-rocket text-lg"></i>
                    </div>
                    <div>
                        <div id="vessel-subtitle" class="text-[10px] text-cyan-400 tracking-widest font-orbitron uppercase">Alliance Vehicle Hangar</div>
                        <div id="vessel-title" class="text-base md:text-lg font-bold text-white tracking-wider flex items-center gap-2 font-orbitron">
                            <select id="vehicle-selector" class="bg-cyan-950/90 text-cyan-200 border border-cyan-500/40 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-cyan-400 font-orbitron font-bold cursor-pointer max-w-[220px]">
                                <!-- Dynamically populated based on Space or Surface mode -->
                            </select>
                            <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">ONLINE</span>
                        </div>
                    </div>
                </div>

                <div class="text-center hidden md:block bg-slate-950/70 backdrop-blur-md px-6 py-2 rounded-lg border border-cyan-500/30">
                    <div id="mode-subtitle" class="text-[10px] text-sky-400 font-orbitron tracking-[0.3em] uppercase">Exodus Cluster</div>
                    <div id="mode-title" class="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-blue-400 font-orbitron">
                        COLORFUL SYSTEM MAP
                    </div>
                </div>

                <!-- Cargo & Telemetry Bar -->
                <div id="header-right-panel" class="scifi-panel p-3 px-5 flex items-center gap-4 pointer-events-auto">
                    <div id="cargo-pill" class="flex items-center gap-3 text-xs">
                        <span class="text-amber-300 font-bold"><i class="fa-solid fa-coins text-amber-400"></i> <span id="hdr-credits">500</span> C</span>
                        <span class="text-purple-300 font-bold"><i class="fa-solid fa-atom text-purple-400"></i> <span id="hdr-eezo">0</span></span>
                        <span class="text-slate-200 font-bold"><i class="fa-solid fa-gem text-slate-300"></i> <span id="hdr-plat">0</span></span>
                        <span class="text-amber-300 font-bold"><i class="fa-solid fa-cubes text-amber-400"></i> <span id="hdr-palla">0</span></span>
                        <span class="text-cyan-300 font-bold"><i class="fa-solid fa-shield-halved text-cyan-400"></i> <span id="hdr-iri">0</span></span>
                    </div>
                    <div class="h-8 w-px bg-cyan-500/20"></div>
                    <button id="btn-open-profile" class="flex items-center gap-2 bg-cyan-950/80 border border-cyan-500/40 rounded px-2.5 py-1 hover:border-cyan-400 transition cursor-pointer" title="Open Pilot Dossier">
                        <div class="w-6 h-6 rounded-full border border-cyan-400 flex items-center justify-center overflow-hidden bg-black/60">
                            <img id="hdr-user-avatar" src="" class="w-full h-full object-cover hidden" alt="Avatar">
                            <i id="hdr-user-icon" class="fa-solid fa-user-astronaut text-xs text-cyan-300"></i>
                        </div>
                        <div class="text-left hidden sm:block">
                            <div id="hdr-user-name" class="text-[10px] font-orbitron font-bold text-white leading-none">COMMANDER</div>
                            <div id="hdr-user-status" class="text-[9px] text-cyan-400 leading-none">GUEST</div>
                        </div>
                    </button>
                    <button id="btn-open-login" class="scifi-button px-3 py-1.5 text-xs font-bold text-cyan-300 border-cyan-500/60 hover:text-white flex items-center gap-1.5" title="Multiplayer SSO Login">
                        <i class="fa-solid fa-users text-cyan-400"></i> MULTIPLAYER
                    </button>
                    <button id="btn-open-shop" class="scifi-button px-3 py-1.5 text-xs font-bold text-amber-300 border-amber-500/60 hover:text-white flex items-center gap-1.5" title="Open Space Shop">
                        <i class="fa-solid fa-cart-shopping text-amber-400"></i> SHOP
                    </button>
                    <button id="btn-gfx-toggle" class="text-cyan-400 hover:text-amber-300 transition p-1" title="Toggle Lighting & Shadow Quality">
                        <i id="gfx-icon" class="fa-solid fa-sun text-lg text-amber-400"></i>
                    </button>
                    <button id="btn-sound-toggle" class="text-cyan-400 hover:text-white transition p-1" title="Toggle Sound Systems">
                        <i id="sound-icon" class="fa-solid fa-volume-high text-lg"></i>
                    </button>
                    <button id="btn-mode-action" class="hidden scifi-button px-3 py-1.5 text-xs font-bold text-cyan-200">
                        RETURN
                    </button>
                </div>
            </header>

            <!-- Proximity Banner (Space Mode) -->
            <div id="proximity-banner" class="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 opacity-0 pointer-events-none">
                <div class="scifi-panel px-6 py-3 flex items-center gap-4 border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                    <div class="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping"></div>
                    <div>
                        <div class="text-[10px] text-amber-400 font-orbitron tracking-widest uppercase">Orbital Approach Target</div>
                        <div id="proximity-planet-name" class="text-lg font-bold text-white font-orbitron">PLANET NAME</div>
                    </div>
                    <div class="flex gap-2">
                        <button id="btn-enter-orbit" class="scifi-button px-4 py-2 text-xs font-bold text-cyan-200 hover:text-white pointer-events-auto flex items-center gap-1.5">
                            <i class="fa-solid fa-crosshairs text-cyan-400"></i> ORBIT / SCAN [E]
                        </button>
                        <button id="btn-land-mako-banner" class="scifi-button px-4 py-2 text-xs font-bold text-emerald-300 border-emerald-400 hover:text-white pointer-events-auto flex items-center gap-1.5">
                            <i class="fa-solid fa-truck-monster text-amber-400"></i> LAND MAKO [SPACE]
                        </button>
                    </div>
                </div>
            </div>

            <!-- Controls Panel -->
            <div class="absolute bottom-4 left-4 z-20 pointer-events-auto">
                <div class="scifi-panel p-3 text-xs text-sky-300/80 space-y-1.5 w-76">
                    <div class="font-bold font-orbitron text-cyan-400 mb-1 flex items-center justify-between border-b border-cyan-500/20 pb-1">
                        <span id="ctrl-title"><i class="fa-solid fa-gamepad mr-1"></i> CONTROLS</span>
                        <span id="ctrl-badge" class="text-[10px] text-amber-400">ACTIVE</span>
                    </div>
                    <div id="ctrl-body">
                        <!-- Populated dynamically -->
                    </div>
                </div>
            </div>

            <!-- Minimap Radar -->
            <div class="absolute bottom-4 right-4 z-20 pointer-events-auto">
                <div class="scifi-panel p-2 flex flex-col items-center">
                    <div class="text-[10px] font-orbitron text-cyan-400 mb-1 tracking-widest flex items-center gap-1">
                        <i class="fa-solid fa-radar text-cyan-400"></i> TACTICAL RADAR
                    </div>
                    <div class="relative w-36 h-36 rounded-full border border-cyan-500/50 bg-cyan-950/70 overflow-hidden flex items-center justify-center cursor-pointer" id="minimap-container">
                        <div class="absolute w-28 h-28 rounded-full border border-cyan-500/20"></div>
                        <div class="absolute w-18 h-18 rounded-full border border-cyan-500/20"></div>
                        <div class="absolute w-8 h-8 rounded-full border border-cyan-500/20"></div>
                        <div class="absolute w-full h-[1px] bg-cyan-500/20"></div>
                        <div class="absolute h-full w-[1px] bg-cyan-500/20"></div>
                        <canvas id="minimap-canvas" width="144" height="144" class="absolute inset-0 z-10"></canvas>
                    </div>
                </div>
            </div>

            <!-- Planet Modal -->
            <div id="planet-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 opacity-0 pointer-events-none scale-95">
                <div class="scifi-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative text-cyan-100 flex flex-col gap-6">
                    <div class="flex justify-between items-start border-b border-cyan-500/30 pb-4">
                        <div>
                            <div class="text-xs text-cyan-400 font-orbitron tracking-widest uppercase flex items-center gap-2">
                                <i class="fa-solid fa-globe text-amber-400"></i> Planetary Survey Command
                            </div>
                            <h2 id="modal-planet-name" class="text-3xl md:text-4xl font-black font-orbitron text-white tracking-wider">PLANET NAME</h2>
                            <p id="modal-planet-type" class="text-sm text-sky-300/80 font-semibold tracking-wide">Terrestrial World</p>
                        </div>
                        <button id="btn-close-modal" class="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-800 text-cyan-300 flex items-center justify-center transition">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div class="md:col-span-5 flex flex-col items-center justify-center relative min-h-[220px]">
                            <div class="w-48 h-48 rounded-full border border-cyan-400/40 flex items-center justify-center relative bg-cyan-950/30 shadow-[0_0_35px_rgba(14,165,233,0.25)] overflow-hidden">
                                <canvas id="planet-preview-canvas" width="190" height="190" class="rounded-full"></canvas>
                                <div class="absolute inset-0 rounded-full border border-dashed border-cyan-400/40 animate-spin pointer-events-none" style="animation-duration: 20s;"></div>
                            </div>
                            <div class="mt-3 text-center">
                                <span class="text-[11px] font-orbitron text-cyan-400 tracking-widest uppercase">Orbit Radius: </span>
                                <span id="modal-orbit-dist" class="text-xs text-white font-bold font-mono">142.5 AU</span>
                            </div>
                        </div>

                        <div class="md:col-span-7 space-y-4">
                            <div class="grid grid-cols-2 gap-3 bg-cyan-950/40 p-3 rounded-lg border border-cyan-500/20 text-xs">
                                <div><span class="text-cyan-400/70 block uppercase font-orbitron text-[10px]">Mass Radius</span><span id="modal-radius" class="text-white font-bold text-sm font-mono">6,371 km</span></div>
                                <div><span class="text-cyan-400/70 block uppercase font-orbitron text-[10px]">Surface Temp</span><span id="modal-temp" class="text-white font-bold text-sm font-mono">-15° C</span></div>
                                <div><span class="text-cyan-400/70 block uppercase font-orbitron text-[10px]">Atmosphere</span><span id="modal-atmosphere" class="text-white font-bold text-sm">Nitrogen-Oxygen</span></div>
                                <div><span class="text-cyan-400/70 block uppercase font-orbitron text-[10px]">Hazard Rating</span><span id="modal-hazard" class="text-amber-300 font-bold text-sm">Low (Class 1)</span></div>
                            </div>

                            <div>
                                <h4 class="text-xs font-orbitron text-cyan-400 uppercase tracking-widest mb-1">Orbital Survey Log</h4>
                                <p id="modal-description" class="text-xs text-cyan-100/90 leading-relaxed bg-black/40 p-3 rounded border border-cyan-500/15 max-h-24 overflow-y-auto">Survey data...</p>
                            </div>

                            <div class="space-y-2">
                                <h4 class="text-xs font-orbitron text-cyan-400 uppercase tracking-widest">Scanned Element Density</h4>
                                <div class="space-y-1.5 text-xs">
                                    <div><div class="flex justify-between text-[11px] mb-0.5"><span class="text-purple-300 font-bold"><i class="fa-solid fa-atom mr-1"></i> Eezo</span><span id="res-eezo-val" class="text-purple-300 font-mono">High</span></div><div class="w-full h-2 bg-purple-950/60 rounded-full overflow-hidden border border-purple-500/30"><div id="res-eezo-bar" class="h-full bg-gradient-to-r from-purple-600 to-indigo-400 w-3/4"></div></div></div>
                                    <div><div class="flex justify-between text-[11px] mb-0.5"><span class="text-slate-200 font-bold"><i class="fa-solid fa-gem mr-1"></i> Platinum</span><span id="res-plat-val" class="text-slate-300 font-mono">Moderate</span></div><div class="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden border border-slate-500/30"><div id="res-plat-bar" class="h-full bg-gradient-to-r from-slate-400 to-sky-200 w-1/2"></div></div></div>
                                    <div><div class="flex justify-between text-[11px] mb-0.5"><span class="text-amber-300 font-bold"><i class="fa-solid fa-cubes mr-1"></i> Palladium</span><span id="res-palla-val" class="text-amber-300 font-mono">Rich</span></div><div class="w-full h-2 bg-amber-950/60 rounded-full overflow-hidden border border-amber-500/30"><div id="res-palla-bar" class="h-full bg-gradient-to-r from-amber-600 to-yellow-300 w-4/5"></div></div></div>
                                    <div><div class="flex justify-between text-[11px] mb-0.5"><span class="text-cyan-300 font-bold"><i class="fa-solid fa-shield-halved mr-1"></i> Iridium</span><span id="res-iri-val" class="text-cyan-300 font-mono">Trace</span></div><div class="w-full h-2 bg-cyan-950/60 rounded-full overflow-hidden border border-cyan-500/30"><div id="res-iri-bar" class="h-full bg-gradient-to-r from-cyan-600 to-teal-300 w-1/4"></div></div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-wrap justify-between items-center border-t border-cyan-500/30 pt-4 gap-3">
                        <div class="text-xs text-emerald-400 font-bold tracking-wide flex items-center gap-2"><i class="fa-solid fa-circle-check"></i> SCAN COMPLETED</div>
                        <div class="flex flex-wrap gap-3">
                            <button id="btn-land-mako-modal" class="scifi-button px-5 py-2 text-sm font-bold text-emerald-300 border-emerald-400 hover:text-white flex items-center gap-2"><i class="fa-solid fa-truck-monster text-amber-300"></i> DEPLOY VEHICLE [SPACE]</button>
                            <button id="btn-launch-probe" class="scifi-button px-5 py-2 text-sm font-bold text-white flex items-center gap-2"><i class="fa-solid fa-crosshairs"></i> LAUNCH PROBE [P]</button>
                            <button id="btn-open-roulette" class="scifi-button px-5 py-2 text-sm font-bold flex items-center gap-2" style="border-color:rgba(245,158,11,.6);color:#fde68a;">
                                <i class="fa-solid fa-dice" style="color:#f59e0b;"></i>
                                <span id="roulette-btn-label">SPIN ROULETTE</span>
                                <span id="roulette-spins-badge" class="text-[10px] px-1.5 py-0.5 rounded-full" style="background:rgba(245,158,11,.2);border:1px solid rgba(245,158,11,.4);color:#fbbf24;">5 LEFT</span>
                            </button>
                            <button id="btn-leave-orbit" class="px-5 py-2 text-sm font-bold text-cyan-300 hover:text-white bg-cyan-950/60 border border-cyan-500/40 rounded transition">LEAVE ORBIT [Q]</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Toast Container -->
            <div id="toast-container" class="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>
        `;
    }

    setupSubscriptions() {
        gameState.subscribe(state => this.updateUI(state));

        // Immediately sync UI on setup to populate initial vehicle options & controls box
        this.updateUI(gameState.getState());

        // Shortcut Q to close modal
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'q' && this.modalPlanet) {
                this.closeModal();
            }
        });

        // Vehicle Hangar Selector Listener
        const vehSel = document.getElementById('vehicle-selector');
        vehSel.addEventListener('change', (e) => {
            const st = gameState.getState();
            if (st.mode === 'surface') {
                gameState.setSurfaceVehicleType(e.target.value);
            } else {
                gameState.setShipType(e.target.value);
            }
            audioEngine.playPing();
        });

        document.getElementById('btn-open-profile').addEventListener('click', () => {
            profileModal.open();
        });

        document.getElementById('btn-open-login').addEventListener('click', () => {
            loginScreen.open();
        });

        document.getElementById('btn-open-shop').addEventListener('click', () => {
            shopManager.open();
        });

        // Sync header profile badge with Firebase Auth state
        subscribeAuthState((user) => {
            const avatarImg = document.getElementById('hdr-user-avatar');
            const avatarIcon = document.getElementById('hdr-user-icon');
            const userName = document.getElementById('hdr-user-name');
            const userStatus = document.getElementById('hdr-user-status');

            if (user) {
                if (avatarImg) {
                    avatarImg.src = user.photoURL || '';
                    avatarImg.classList.remove('hidden');
                }
                if (avatarIcon) avatarIcon.classList.add('hidden');
                if (userName) userName.textContent = user.displayName?.split(' ')[0].toUpperCase() || 'PILOT';
                if (userStatus) userStatus.textContent = 'ONLINE';
            } else {
                if (avatarImg) avatarImg.classList.add('hidden');
                if (avatarIcon) avatarIcon.classList.remove('hidden');
                if (userName) userName.textContent = 'COMMANDER';
                if (userStatus) userStatus.textContent = 'GUEST';
            }
        });

        document.getElementById('btn-gfx-toggle').addEventListener('click', () => {
            gameState.toggleGraphicsQuality();
        });

        document.getElementById('btn-sound-toggle').addEventListener('click', () => {
            gameState.toggleSound();
        });

        document.getElementById('btn-mode-action').addEventListener('click', () => {
            if (gameState.getState().mode === 'surface') {
                gameState.returnToOrbit();
            }
        });

        document.getElementById('btn-close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('btn-leave-orbit').addEventListener('click', () => this.closeModal());

        document.getElementById('btn-launch-probe').addEventListener('click', () => {
            if (gameState.launchProbe()) {
                audioEngine.playPing();
                if (this.modalPlanet) this.openModal(this.modalPlanet);
                // Auto-open roulette after a successful probe launch
                if (this.modalPlanet && getSpinsLeft(this.modalPlanet.name) > 0) {
                    setTimeout(() => rouletteManager.open(this.modalPlanet.name), 350);
                }
            }
        });

        document.getElementById('btn-open-roulette').addEventListener('click', () => {
            if (this.modalPlanet) rouletteManager.open(this.modalPlanet.name);
        });

        document.getElementById('btn-land-mako-modal').addEventListener('click', () => {
            if (this.modalPlanet) {
                const planet = this.modalPlanet;
                this.closeModal();
                gameState.landOnPlanet(planet);
            }
        });

        document.getElementById('btn-land-mako-banner').addEventListener('click', () => {
            const planet = this.closestPlanetData;
            if (planet) {
                this.closeModal();
                gameState.landOnPlanet(planet);
            }
        });

        document.getElementById('btn-enter-orbit').addEventListener('click', () => {
            const planet = this.closestPlanetData;
            if (planet) this.openModal(planet);
        });
    }

    updateUI(state) {
        // Populate and Sync Hangar Dropdown
        const vehSel = document.getElementById('vehicle-selector');
        if (state.mode === 'surface') {
            if (vehSel.dataset.mode !== 'surface') {
                vehSel.dataset.mode = 'surface';
                vehSel.innerHTML = `
                    <option value="mako">M-35 Mako Heavy Rover</option>
                    <option value="hover_fighter">Sky-Hover Anti-Grav Fighter</option>
                    <option value="apex_speeder">Apex Surface Speeder Trike</option>
                    <option value="titan_crawler">Titan Armored Mobile Crawler</option>
                `;
            }
            if (vehSel.value !== state.surfaceVehicleType) {
                vehSel.value = state.surfaceVehicleType;
            }
        } else {
            if (vehSel.dataset.mode !== 'space') {
                vehSel.dataset.mode = 'space';
                vehSel.innerHTML = `
                    <option value="normandy">SSV Normandy SR-3 (Frigate)</option>
                    <option value="interceptor">Apex Interceptor (Scout Fighter)</option>
                    <option value="dreadnought">Titan Dreadnought (Cruiser)</option>
                    <option value="shadow">Shadow Phantom (Stealth Spec)</option>
                `;
            }
            if (vehSel.value !== state.shipType) {
                vehSel.value = state.shipType;
            }
        }

        // Cargo Pill
        document.getElementById('hdr-eezo').textContent = state.mode === 'surface' ? `+${state.mako.harvestedThisSession.eezo}` : state.cargo.eezo;
        document.getElementById('hdr-plat').textContent = state.mode === 'surface' ? `+${state.mako.harvestedThisSession.plat}` : state.cargo.plat;
        document.getElementById('hdr-palla').textContent = state.mode === 'surface' ? `+${state.mako.harvestedThisSession.palla}` : state.cargo.palla;
        document.getElementById('hdr-iri').textContent = state.mode === 'surface' ? `+${state.mako.harvestedThisSession.iri}` : state.cargo.iri;
        if (document.getElementById('hdr-credits')) {
            document.getElementById('hdr-credits').textContent = state.credits;
        }

        const shopBtn = document.getElementById('btn-open-shop');
        if (shopBtn) {
            shopBtn.style.display = state.mode === 'space' ? 'inline-flex' : 'none';
        }

        // Sound & Graphics Icons
        const sIcon = document.getElementById('sound-icon');
        if (sIcon) sIcon.className = state.soundEnabled ? 'fa-solid fa-volume-high text-lg' : 'fa-solid fa-volume-xmark text-lg text-red-400';

        const gIcon = document.getElementById('gfx-icon');
        if (gIcon) {
            gIcon.className = state.graphicsQuality === 'high'
                ? 'fa-solid fa-sun text-lg text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : 'fa-solid fa-lightbulb text-lg text-slate-400 opacity-60';
        }

        // Header Mode
        const modeTitle = document.getElementById('mode-title');
        const modeSub = document.getElementById('mode-subtitle');
        const vesselIcon = document.getElementById('vessel-icon');
        const vesselSub = document.getElementById('vessel-subtitle');
        const btnMode = document.getElementById('btn-mode-action');

        if (state.mode === 'surface') {
            this.closeModal();
            vesselIcon.className = 'fa-solid fa-truck-monster text-lg text-emerald-400';
            vesselSub.textContent = 'Surface Recon Vehicle Hangar';
            modeSub.textContent = 'CLEAR BLUE SKY & LAKES';
            modeTitle.textContent = state.activePlanet.name;
            btnMode.classList.remove('hidden');
            btnMode.innerHTML = '<i class="fa-solid fa-rocket text-amber-400 mr-1"></i> RETURN TO ORBIT';
        } else {
            vesselIcon.className = 'fa-solid fa-rocket text-lg text-cyan-400';
            vesselSub.textContent = 'Alliance Starship Hangar';
            modeSub.textContent = 'EXODUS CLUSTER';
            modeTitle.textContent = 'COLORFUL SYSTEM MAP';
            btnMode.classList.add('hidden');
        }

        // Controls Box
        const ctrlBody = document.getElementById('ctrl-body');
        const ctrlBadge = document.getElementById('ctrl-badge');
        if (state.mode === 'surface') {
            ctrlBadge.textContent = 'SURFACE VEHICLE';
            ctrlBody.innerHTML = `
                <div><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">W / S</kbd> : Drive / Reverse</div>
                <div><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">A / D</kbd> : Steer Vehicle</div>
                <div><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">LEFT CLICK / F</kbd> : Cannon Lasers</div>
                <div><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">I J K L</kbd> : Rotate 3D Camera</div>
                <div><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">SHIFT / SPACE</kbd> : Nitro / Thrusters</div>
            `;
        } else {
            ctrlBadge.textContent = 'STARSHIP ORBIT';
            ctrlBody.innerHTML = `
                <div><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">W A S D</kbd> : Fly Starship (Diagonals)</div>
                <div><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">LEFT CLICK / F</kbd> : Plasma Lasers</div>
                <div><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">I J K L</kbd> : Rotate 3D Camera</div>
                <div><kbd class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 rounded text-cyan-200">E / SPACEBAR</kbd> : Orbit / Land Vehicle</div>
            `;
        }

        // Toasts
        this.renderToasts(state.toasts);
    }

    renderToasts(toasts) {
        const container = document.getElementById('toast-container');
        container.innerHTML = '';
        toasts.forEach(t => {
            const div = document.createElement('div');
            const colorClass = t.type === 'success' ? 'border-emerald-400 text-emerald-200 bg-emerald-950/90' :
                             t.type === 'warning' ? 'border-amber-400 text-amber-200 bg-amber-950/90' :
                             'border-cyan-400 text-cyan-200 bg-cyan-950/90';
            div.className = `scifi-panel p-3 text-xs border ${colorClass} shadow-lg transition-all duration-300 flex items-center gap-2 pointer-events-auto`;
            div.innerHTML = `<i class="fa-solid fa-circle-info text-sm"></i> <span>${t.message}</span>`;
            container.appendChild(div);
        });
    }

    showProximityBanner(planetData, distance) {
        this.closestPlanetData = planetData;
        const banner = document.getElementById('proximity-banner');
        const nameEl = document.getElementById('proximity-planet-name');
        const reticle = document.getElementById('target-reticle');

        if (gameState.getState().mode === 'surface' || !planetData) {
            banner.classList.remove('opacity-100', 'pointer-events-auto');
            banner.classList.add('opacity-0', 'pointer-events-none');
            reticle.classList.remove('opacity-100');
            reticle.classList.add('opacity-0');
            return;
        }

        if (planetData) {
            nameEl.textContent = planetData.name;
            banner.classList.remove('opacity-0', 'pointer-events-none');
            banner.classList.add('opacity-100', 'pointer-events-auto');
        }
    }

    updateReticlePosition(screenX, screenY, label) {
        const reticle = document.getElementById('target-reticle');
        if (gameState.getState().mode === 'surface' || screenX === null || screenY === null) {
            reticle.classList.remove('opacity-100');
            reticle.classList.add('opacity-0');
            return;
        }

        reticle.style.left = `${screenX}px`;
        reticle.style.top = `${screenY}px`;
        document.getElementById('reticle-label').textContent = label;
        reticle.classList.remove('opacity-0');
        reticle.classList.add('opacity-100');
    }

    openModal(planetData) {
        this.modalPlanet = planetData;
        audioEngine.playPing();

        document.getElementById('modal-planet-name').textContent = planetData.name;
        document.getElementById('modal-planet-type').textContent = planetData.type;
        document.getElementById('modal-orbit-dist').textContent = `${planetData.orbitRadius.toFixed(1)} AU`;
        document.getElementById('modal-radius').textContent = planetData.massRadius;
        document.getElementById('modal-temp').textContent = planetData.temp;
        document.getElementById('modal-atmosphere').textContent = planetData.atmosphere;
        document.getElementById('modal-hazard').textContent = planetData.hazard;
        document.getElementById('modal-description').textContent = planetData.description;

        this.setResBar('eezo', planetData.resources.eezo);
        this.setResBar('plat', planetData.resources.plat);
        this.setResBar('palla', planetData.resources.palla);
        this.setResBar('iri', planetData.resources.iri);

        // Update roulette button badge
        const spinsLeft = getSpinsLeft(planetData.name);
        const badge = document.getElementById('roulette-spins-badge');
        const rouletteBtn = document.getElementById('btn-open-roulette');
        if (badge) badge.textContent = `${spinsLeft} LEFT`;
        if (rouletteBtn) {
            rouletteBtn.disabled  = spinsLeft <= 0;
            rouletteBtn.style.opacity = spinsLeft <= 0 ? '0.35' : '1';
            const lbl = document.getElementById('roulette-btn-label');
            if (lbl) lbl.textContent = spinsLeft <= 0 ? 'ROULETTE USED' : 'SPIN ROULETTE';
        }

        const modal = document.getElementById('planet-modal');
        modal.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        modal.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
    }

    closeModal() {
        const modal = document.getElementById('planet-modal');
        modal.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
        modal.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        this.modalPlanet = null;
    }

    setResBar(key, pct) {
        const bar = document.getElementById(`res-${key}-bar`);
        const val = document.getElementById(`res-${key}-val`);
        bar.style.width = `${pct}%`;
        val.textContent = pct > 70 ? 'Rich Deposit' : pct > 40 ? 'Moderate' : pct > 15 ? 'Trace' : 'Depleted';
    }
}
