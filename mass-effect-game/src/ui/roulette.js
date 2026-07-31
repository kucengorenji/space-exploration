/* ===================================================================
   ROULETTE WHEEL MINI-GAME
   Max 5 spins per planet. Counter stored in localStorage.
   =================================================================== */

import { gameState } from '../core/state.js';

const PRIZES = [
    { label: 'EEZO\n+120',     color: '#7c3aed', glow: '#a855f7', resource: 'eezo',  amount: 120 },
    { label: 'PLATINUM\n+200', color: '#64748b', glow: '#94a3b8', resource: 'plat',  amount: 200 },
    { label: 'JACKPOT!\n\u00d72',   color: '#b45309', glow: '#f59e0b', resource: 'bonus', amount: 0   },
    { label: 'PALLADIUM\n+250',color: '#92400e', glow: '#fbbf24', resource: 'palla', amount: 250 },
    { label: 'EEZO\n+80',      color: '#5b21b6', glow: '#8b5cf6', resource: 'eezo',  amount: 80  },
    { label: 'IRIDIUM\n+180',  color: '#0e7490', glow: '#22d3ee', resource: 'iri',   amount: 180 },
    { label: 'PLATINUM\n+300', color: '#334155', glow: '#cbd5e1', resource: 'plat',  amount: 300 },
    { label: 'PALLADIUM\n+150',color: '#78350f', glow: '#fcd34d', resource: 'palla', amount: 150 },
    { label: 'IRIDIUM\n+350',  color: '#155e75', glow: '#67e8f9', resource: 'iri',   amount: 350 },
    { label: 'EEZO\n+500',     color: '#4c1d95', glow: '#c084fc', resource: 'eezo',  amount: 500 },
];

const MAX_SPINS = 5;
const STORAGE_KEY = 'mass_effect_probe_spins_v1';

// ── localStorage helpers ──────────────────────────────────────────────
function loadCounts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveCounts(c) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {}
}
export function getSpinsLeft(planet) {
    return MAX_SPINS - (loadCounts()[planet] || 0);
}
function recordSpin(planet) {
    const c = loadCounts();
    c[planet] = (c[planet] || 0) + 1;
    saveCounts(c);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

// ── RouletteManager ───────────────────────────────────────────────────
export class RouletteManager {
    constructor() {
        this._overlay  = null;
        this._canvas   = null;
        this._ctx      = null;
        this._spinning = false;
        this._curAngle = 0;
        this._targetAngle = 0;
        this._startAngle  = 0;
        this._spinStart   = 0;
        this._spinDur     = 4500; // ms
        this._prizeIdx    = -1;
        this._planet      = null;
        this._raf         = null;
        this._built       = false;
    }

    // ── build DOM once ────────────────────────────────────────────────
    _ensureBuilt() {
        if (this._built) return;
        this._built = true;

        const el = document.createElement('div');
        el.id = 'roulette-overlay';
        Object.assign(el.style, {
            position: 'fixed', inset: '0', zIndex: '200',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(18px)',
            opacity: '0', pointerEvents: 'none', transition: 'opacity 0.3s'
        });

        el.innerHTML = `
<div id="roulette-panel" style="display:flex;flex-direction:column;align-items:center;gap:20px;transition:transform 0.3s;transform:scale(0.9);">

  <!-- Header -->
  <div style="text-align:center;">
    <div style="font-size:10px;font-family:Orbitron,sans-serif;letter-spacing:.4em;color:#f59e0b;text-transform:uppercase;margin-bottom:4px;">
      &#127922; PROBE DATA ROULETTE
    </div>
    <h2 style="font-size:clamp(18px,4vw,28px);font-weight:900;font-family:Orbitron,sans-serif;background:linear-gradient(90deg,#fbbf24,#fef9c3,#fb923c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:.12em;margin:0;">
      SPIN FOR RESOURCES
    </h2>
    <div id="rlt-planet-lbl" style="font-size:11px;font-family:Orbitron,sans-serif;color:#67e8f9;margin-top:4px;letter-spacing:.2em;"></div>
  </div>

  <!-- Wheel wrapper -->
  <div style="position:relative;width:320px;height:320px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;inset:0;border-radius:50%;border:2px solid rgba(245,158,11,.45);box-shadow:0 0 55px rgba(245,158,11,.22),inset 0 0 40px rgba(0,0,0,.7);"></div>
    <canvas id="rlt-canvas" width="300" height="300" style="border-radius:50%;display:block;"></canvas>
    <!-- pointer -->
    <div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);width:0;height:0;
                border-left:12px solid transparent;border-right:12px solid transparent;
                border-top:24px solid #f59e0b;filter:drop-shadow(0 0 6px #f59e0b);"></div>
    <!-- hub -->
    <div style="position:absolute;width:34px;height:34px;border-radius:50%;
                background:radial-gradient(circle,#1e293b,#0f172a);
                border:3px solid rgba(245,158,11,.7);box-shadow:0 0 16px rgba(245,158,11,.5);"></div>
  </div>

  <!-- Spins remaining -->
  <div id="rlt-spins" style="font-size:11px;font-family:Orbitron,sans-serif;letter-spacing:.25em;color:rgba(251,191,36,.75);">
    — / — SPINS REMAINING
  </div>

  <!-- Prize banner (hidden until spin completes) -->
  <div id="rlt-prize-banner" style="display:none;width:320px;text-align:center;padding:12px 24px;
       border-radius:10px;background:rgba(0,0,0,.75);border:1px solid rgba(245,158,11,.5);
       box-shadow:0 0 24px rgba(245,158,11,.2);">
    <div style="font-size:10px;font-family:Orbitron,sans-serif;color:#f59e0b;letter-spacing:.3em;margin-bottom:4px;">REWARD ACQUIRED</div>
    <div id="rlt-prize-txt" style="font-size:24px;font-weight:900;font-family:Orbitron,sans-serif;letter-spacing:.1em;"></div>
    <div id="rlt-prize-sub" style="font-size:11px;color:#67e8f9;margin-top:4px;font-family:Orbitron,sans-serif;"></div>
  </div>

  <!-- Buttons -->
  <div style="display:flex;gap:12px;align-items:center;">
    <button id="rlt-btn-spin"
            style="padding:12px 32px;font-size:15px;font-weight:900;font-family:Orbitron,sans-serif;
                   color:#fde68a;background:transparent;border:2px solid rgba(245,158,11,.65);
                   border-radius:6px;cursor:pointer;letter-spacing:.12em;
                   box-shadow:0 0 22px rgba(245,158,11,.2);transition:all .2s;">
      &#9654; SPIN THE WHEEL
    </button>
    <button id="rlt-btn-close"
            style="padding:12px 20px;font-size:12px;font-weight:700;font-family:Orbitron,sans-serif;
                   color:#67e8f9;background:rgba(8,47,73,.55);border:1px solid rgba(56,189,248,.35);
                   border-radius:6px;cursor:pointer;letter-spacing:.1em;transition:all .2s;">
      CLOSE [Q]
    </button>
  </div>

</div>`;

        document.body.appendChild(el);
        this._overlay = el;
        this._canvas  = el.querySelector('#rlt-canvas');
        this._ctx     = this._canvas.getContext('2d');

        el.querySelector('#rlt-btn-spin').addEventListener('click', () => this.spin());
        el.querySelector('#rlt-btn-close').addEventListener('click', () => this.hide());
        window.addEventListener('keydown', e => {
            if (e.key.toLowerCase() === 'q' && this._overlay.style.opacity === '1') this.hide();
        });

        this._drawWheel(0);
    }

    // ── draw canvas wheel ─────────────────────────────────────────────
    _drawWheel(rot) {
        const ctx = this._ctx;
        const W = this._canvas.width, H = this._canvas.height;
        const cx = W / 2, cy = H / 2, r = cx - 4;
        const n = PRIZES.length, sa = (2 * Math.PI) / n;
        ctx.clearRect(0, 0, W, H);

        for (let i = 0; i < n; i++) {
            const a0 = rot + i * sa - Math.PI / 2;
            const a1 = a0 + sa;
            const p  = PRIZES[i];
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath();
            ctx.fillStyle = p.color; ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 2; ctx.stroke();

            const ma = a0 + sa / 2;
            const tx = cx + Math.cos(ma) * r * 0.65;
            const ty = cy + Math.sin(ma) * r * 0.65;
            ctx.save();
            ctx.translate(tx, ty); ctx.rotate(ma + Math.PI / 2);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.font = 'bold 10px "Orbitron",sans-serif';
            ctx.fillStyle = '#fff'; ctx.shadowColor = p.glow; ctx.shadowBlur = 8;
            p.label.split('\n').forEach((l, li, arr) =>
                ctx.fillText(l, 0, (li - (arr.length - 1) / 2) * 13));
            ctx.restore();
        }

        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(245,158,11,.55)'; ctx.lineWidth = 4; ctx.stroke();
    }

    // ── public: open modal ────────────────────────────────────────────
    open(planet) {
        this._ensureBuilt();
        this._planet   = planet;
        this._spinning = false;
        this._prizeIdx = -1;

        const left = getSpinsLeft(planet);
        document.getElementById('rlt-planet-lbl').textContent       = `\u{1F4E1} ${planet.toUpperCase()} \u2014 PROBE DATA`;
        document.getElementById('rlt-spins').textContent             = `${left} / ${MAX_SPINS} SPINS REMAINING`;
        document.getElementById('rlt-prize-banner').style.display   = 'none';

        this._curAngle = 0;
        this._drawWheel(0);

        const btn = document.getElementById('rlt-btn-spin');
        if (left <= 0) {
            btn.disabled = true; btn.style.opacity = '.35';
            btn.textContent = '\uD83D\uDD12 NO SPINS LEFT';
        } else {
            btn.disabled = false; btn.style.opacity = '1';
            btn.innerHTML = '&#9654; SPIN THE WHEEL';
        }

        this._overlay.style.opacity = '1';
        this._overlay.style.pointerEvents = 'auto';
        document.getElementById('roulette-panel').style.transform = 'scale(1)';
    }

    // ── public: hide modal ────────────────────────────────────────────
    hide() {
        if (!this._built) return;
        this._overlay.style.opacity = '0';
        this._overlay.style.pointerEvents = 'none';
        document.getElementById('roulette-panel').style.transform = 'scale(0.9)';
        if (this._raf) cancelAnimationFrame(this._raf);
    }

    // ── public: start spin ────────────────────────────────────────────
    spin() {
        if (this._spinning) return;
        if (getSpinsLeft(this._planet) <= 0) return;

        this._prizeIdx = Math.floor(Math.random() * PRIZES.length);

        const n = PRIZES.length, sa = (2 * Math.PI) / n;
        const fullSpins  = 5 + Math.floor(Math.random() * 5);
        const inSlice    = (0.15 + Math.random() * 0.7) * sa;
        const targetNorm = (2 * Math.PI - (this._prizeIdx * sa + inSlice) + 2 * Math.PI) % (2 * Math.PI);

        this._startAngle  = this._curAngle;
        this._targetAngle = this._curAngle + fullSpins * 2 * Math.PI + targetNorm - (this._curAngle % (2 * Math.PI));
        this._spinning    = true;
        this._spinStart   = performance.now();

        recordSpin(this._planet);

        const btn = document.getElementById('rlt-btn-spin');
        btn.disabled = true; btn.style.opacity = '.5';
        btn.textContent = '\u23F3 SPINNING...';

        document.getElementById('rlt-prize-banner').style.display = 'none';
        this._raf = requestAnimationFrame(() => this._animate());
    }

    _animate() {
        const t = Math.min((performance.now() - this._spinStart) / this._spinDur, 1);
        this._curAngle = this._startAngle + (this._targetAngle - this._startAngle) * easeOut(t);
        this._drawWheel(this._curAngle);
        if (t < 1) {
            this._raf = requestAnimationFrame(() => this._animate());
        } else {
            this._curAngle = this._targetAngle;
            this._drawWheel(this._curAngle);
            this._spinning = false;
            this._onSpinComplete();
        }
    }

    _onSpinComplete() {
        const p  = PRIZES[this._prizeIdx];
        const st = gameState.getState();

        if (p.resource === 'bonus') {
            gameState.addCargo('eezo',  st.cargo.eezo);
            gameState.addCargo('plat',  st.cargo.plat);
            gameState.addCargo('palla', st.cargo.palla);
            gameState.addCargo('iri',   st.cargo.iri);
        } else {
            gameState.addCargo(p.resource, p.amount);
        }

        const banner = document.getElementById('rlt-prize-banner');
        banner.style.display    = 'block';
        banner.style.borderColor = p.glow;
        banner.style.boxShadow  = `0 0 24px ${p.glow}55`;

        const prizeLabel = p.label.replace('\n', ' ');
        document.getElementById('rlt-prize-txt').textContent = p.resource === 'bonus' ? '\uD83C\uDF89 JACKPOT!' : prizeLabel;
        document.getElementById('rlt-prize-txt').style.color = p.glow;
        document.getElementById('rlt-prize-sub').textContent = p.resource === 'bonus' ? 'ALL CARGO DOUBLED!' : 'Added to cargo hold';

        const left = getSpinsLeft(this._planet);
        document.getElementById('rlt-spins').textContent = `${left} / ${MAX_SPINS} SPINS REMAINING`;

        const btn = document.getElementById('rlt-btn-spin');
        if (left <= 0) {
            btn.disabled = true; btn.style.opacity = '.35';
            btn.textContent = '\uD83D\uDD12 NO SPINS LEFT';
        } else {
            btn.disabled = false; btn.style.opacity = '1';
            btn.innerHTML = '&#9654; SPIN AGAIN';
        }

        gameState.addToast(
            p.resource === 'bonus'
                ? '\uD83C\uDFB0 JACKPOT! All cargo doubled!'
                : `\uD83C\uDFB0 Roulette: ${prizeLabel} added to cargo!`,
            'success'
        );
    }
}

export const rouletteManager = new RouletteManager();
