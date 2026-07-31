/* ===================================================================
   SCI-FI GOOGLE SSO LOGIN MODAL OVERLAY
   Enforces domain restriction badge: @frisseblikken.com & @fresh-forces.com
   =================================================================== */

import { loginWithGoogle, logoutUser, subscribeAuthState } from "../multiplayer/auth.js";
import { audioEngine } from "../core/audio.js";

export class LoginScreen {
    constructor() {
        this.modalEl = null;
        this.currentUser = null;
        this.init();
    }

    init() {
        const container = document.createElement('div');
        container.id = 'login-modal';
        container.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300 opacity-0 pointer-events-none p-4';
        container.innerHTML = `
            <div class="scifi-panel w-full max-w-md p-6 relative border-cyan-500/60 shadow-[0_0_50px_rgba(56,189,248,0.25)] text-cyan-100 flex flex-col items-center text-center">
                <!-- Close Button -->
                <button id="btn-close-login" class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold">✕</button>

                <!-- Alliance Logo Icon -->
                <div class="w-16 h-16 rounded-full border-2 border-cyan-400/80 flex items-center justify-center bg-cyan-950/80 text-cyan-300 mb-4 shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                    <i class="fa-solid fa-user-shield text-2xl"></i>
                </div>

                <!-- Header Title -->
                <div class="text-[10px] text-cyan-400 font-orbitron tracking-[0.3em] uppercase mb-1">Alliance Security Command</div>
                <div class="text-2xl font-bold font-orbitron text-white mb-2 tracking-wider">PILOT AUTHENTICATION</div>

                <p class="text-xs text-slate-300 mb-4 leading-relaxed">
                    Access to Alliance Multiplayer War Server is restricted to authorized officers. Please authenticate using your organization Google account.
                </p>

                <!-- Domain Restriction Badge -->
                <div class="bg-cyan-950/70 border border-cyan-500/40 rounded-lg p-3 w-full mb-6">
                    <div class="text-[10px] text-amber-300 font-orbitron font-bold uppercase tracking-widest mb-1">
                        <i class="fa-solid fa-lock text-amber-400 mr-1"></i> Authorized Domains Only
                    </div>
                    <div class="flex justify-center items-center gap-2 text-xs font-bold text-cyan-200">
                        <span class="bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">@frisseblikken.com</span>
                        <span class="bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">@fresh-forces.com</span>
                    </div>
                </div>

                <!-- Auth Action Area -->
                <div id="login-action-area" class="w-full">
                    <button id="btn-google-sso" class="scifi-button w-full py-3 px-4 text-sm font-bold text-cyan-200 border-cyan-400 flex items-center justify-center gap-3 hover:text-white transition">
                        <i class="fa-brands fa-google text-lg text-amber-400"></i>
                        <span>SIGN IN WITH GOOGLE</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        this.modalEl = container;

        this.setupEvents();
        this.listenAuth();
    }

    setupEvents() {
        document.getElementById('btn-close-login').addEventListener('click', () => this.close());

        document.getElementById('btn-google-sso').addEventListener('click', async () => {
            audioEngine.playPing();
            await loginWithGoogle();
        });
    }

    listenAuth() {
        subscribeAuthState((user) => {
            this.currentUser = user;
            this.renderAuthState();
        });
    }

    renderAuthState() {
        const area = document.getElementById('login-action-area');
        if (!area) return;

        if (this.currentUser) {
            area.innerHTML = `
                <div class="bg-slate-900/90 border border-emerald-500/40 rounded-lg p-4 mb-3 flex items-center gap-3 text-left">
                    <img src="${this.currentUser.photoURL || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full border border-emerald-400" alt="Avatar">
                    <div class="overflow-hidden">
                        <div class="text-xs font-bold text-white truncate font-orbitron">${this.currentUser.displayName}</div>
                        <div class="text-[10px] text-emerald-400 truncate">${this.currentUser.email}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button id="btn-logout" class="px-4 py-2 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded hover:text-white transition">
                        LOGOUT
                    </button>
                    <button id="btn-play-multiplayer" class="scifi-button flex-1 py-2 text-xs font-bold text-emerald-300 border-emerald-400 hover:text-white flex items-center justify-center gap-2">
                        <i class="fa-solid fa-gamepad"></i> ENTER MULTIPLAYER WAR
                    </button>
                </div>
            `;

            document.getElementById('btn-logout')?.addEventListener('click', async () => {
                audioEngine.playPing();
                await logoutUser();
            });

            document.getElementById('btn-play-multiplayer')?.addEventListener('click', () => {
                audioEngine.playPing();
                this.close();
            });
        } else {
            area.innerHTML = `
                <button id="btn-google-sso" class="scifi-button w-full py-3 px-4 text-sm font-bold text-cyan-200 border-cyan-400 flex items-center justify-center gap-3 hover:text-white transition">
                    <i class="fa-brands fa-google text-lg text-amber-400"></i>
                    <span>SIGN IN WITH GOOGLE</span>
                </button>
            `;
            document.getElementById('btn-google-sso')?.addEventListener('click', async () => {
                audioEngine.playPing();
                await loginWithGoogle();
            });
        }
    }

    open() {
        audioEngine.playPing();
        this.modalEl.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        this.modalEl.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
    }

    close() {
        this.modalEl.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
        this.modalEl.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
    }
}

export const loginScreen = new LoginScreen();
