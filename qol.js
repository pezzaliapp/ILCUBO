/*
© 2026 Alessandro Pezzali. ILCUBO — Qualita' di vita.
- Vibrazione (mobile) a fine rotazione, toggle.
- Suoni discreti (WebAudio, niente asset) su scramble e solve, toggle.
- Export PNG della configurazione del cubo (vista "unfolded").
- Miglioramenti a11y: focus ring visibili sui pulsanti laterali.
*/
(function () {
  'use strict';

  const STORAGE_KEY = 'ilcubo.qol';
  const defaultPrefs = () => ({ vibrate: false, sound: false });

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultPrefs();
      const p = JSON.parse(raw);
      return Object.assign(defaultPrefs(), p);
    } catch (_) { return defaultPrefs(); }
  }
  function savePrefs() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (_) {} }

  let prefs = loadPrefs();

  // --- WebAudio mini sintetizzatore --------------------------------------
  let audioCtx = null;
  function getCtx() {
    if (audioCtx) return audioCtx;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
    return audioCtx;
  }
  function beep(freq, dur, vol) {
    if (!prefs.sound) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) {} }
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.value = 0;
    o.connect(g); g.connect(ctx.destination);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.08, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function soundScramble() {
    if (!prefs.sound) return;
    // tre toni discendenti
    beep(880, 0.08); setTimeout(() => beep(660, 0.08), 90); setTimeout(() => beep(520, 0.10), 180);
  }
  function soundSolve() {
    if (!prefs.sound) return;
    beep(523, 0.12);
    setTimeout(() => beep(659, 0.12), 130);
    setTimeout(() => beep(784, 0.20), 260);
  }
  function soundMove() { if (prefs.sound) beep(440, 0.04, 0.05); }

  // --- Vibrazione ---------------------------------------------------------
  function vibrate(ms) {
    if (!prefs.vibrate) return;
    if (navigator.vibrate) try { navigator.vibrate(ms); } catch (_) {}
  }

  // --- Hook su window.game ------------------------------------------------
  function whenGameReady(cb) {
    let tries = 0;
    function tick() {
      if (window.game && window.game.controls && typeof window.game.controls.onMove === 'function') cb();
      else if (++tries < 300) setTimeout(tick, 50);
    }
    tick();
  }

  function installHooks() {
    if (!window.game || window.game.__ilcuboQolHooked) return;
    const g = window.game;

    // Hook su fine rotazione
    if (g.controls && typeof g.controls.onMove === 'function') {
      const prev = g.controls.onMove;
      g.controls.onMove = function () {
        try { prev.apply(this, arguments); } catch (_) {}
        vibrate(18);
        soundMove();
      };
    }

    // Hook su scramble (cube.scrambler.scramble e' chiamato da game)
    if (g.scrambler && typeof g.scrambler.scramble === 'function') {
      const prev = g.scrambler.scramble.bind(g.scrambler);
      g.scrambler.scramble = function () {
        const r = prev.apply(g.scrambler, arguments);
        soundScramble();
        vibrate([12, 40, 12]);
        return r;
      };
    }

    // Hook su solve detected: cube.js usa game.timer.stop e transition.complete.
    // Il punto piu' affidabile e' agganciare game.complete (se esiste).
    if (typeof g.complete === 'function') {
      const prev = g.complete.bind(g);
      g.complete = function (state) {
        const r = prev(state);
        if (state === true || state === undefined) {
          soundSolve();
          vibrate([30, 60, 30, 60, 30]);
        }
        return r;
      };
    }

    g.__ilcuboQolHooked = true;
  }

  // --- Export PNG (vista unfolded) ----------------------------------------
  function getFaceConfig() {
    return (window.ILCUBO && window.ILCUBO.customize && typeof window.ILCUBO.customize.getConfig === 'function')
      ? window.ILCUBO.customize.getConfig()
      : { faces: { U:{mode:'color'}, D:{mode:'color'}, F:{mode:'color'}, B:{mode:'color'}, L:{mode:'color'}, R:{mode:'color'} }, daltonic: false };
  }

  function getThemeColors() {
    if (window.game && window.game.themes && typeof window.game.themes.getColors === 'function') return window.game.themes.getColors();
    return { U:0xffffff, D:0xffd000, F:0x00a74a, B:0x2f6ee6, L:0xff6c00, R:0xd80027, P:0x111111 };
  }

  function drawFaceUnfold(ctx, x, y, tile, size, faceName, cfg, colors) {
    const colorHex = colors[faceName] != null ? colors[faceName] : 0xcccccc;
    const colorCss = '#' + colorHex.toString(16).padStart(6, '0');
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const px = x + c * tile, py = y + r * tile;
        // sfondo
        ctx.fillStyle = colorCss;
        ctx.fillRect(px + 2, py + 2, tile - 4, tile - 4);
        // contorno
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 2, py + 2, tile - 4, tile - 4);
        // contenuto
        drawCellContent(ctx, px, py, tile, r, c, size, faceName, cfg);
      }
    }
  }

  function drawCellContent(ctx, x, y, tile, row, col, size, faceName, cfg) {
    if (!cfg) return;
    const mode = cfg.mode;
    if (mode === 'color') return;
    ctx.save();
    ctx.fillStyle = '#111';
    ctx.font = 'bold ' + Math.floor(tile * 0.55) + 'px system-ui,-apple-system,Segoe UI,Roboto,Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const cx = x + tile / 2, cy = y + tile / 2 + 2;

    if (mode === 'number') {
      const orient = cfg.orient === 'col' ? 'col' : 'row';
      const start = Number.isFinite(cfg.start) ? cfg.start | 0 : 1;
      const idx = orient === 'col' ? col * size + row : row * size + col;
      ctx.fillText(String(start + idx), cx, cy);
    } else if (mode === 'letter') {
      const orient = cfg.orient === 'col' ? 'col' : 'row';
      const idx = orient === 'col' ? col * size + row : row * size + col;
      ctx.fillText(String.fromCharCode(65 + (idx % 26)), cx, cy);
    } else if (mode === 'text') {
      const txt = String(cfg.text || '').slice(0, size);
      const orient = cfg.orient === 'col' ? 'col' : 'row';
      const mid = (size - 1) >> 1;
      let ch = '';
      if (orient === 'row' && row === mid && col < txt.length) ch = txt[col];
      else if (orient === 'col' && col === mid && row < txt.length) ch = txt[row];
      if (ch) ctx.fillText(ch, cx, cy);
    } else if (mode === 'emoji') {
      const list = Array.isArray(cfg.list) ? cfg.list : [];
      const e = list[row * size + col] || '';
      if (e) {
        ctx.font = 'bold ' + Math.floor(tile * 0.65) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui';
        ctx.fillText(e, cx, cy);
      }
    } else if (mode === 'image') {
      // ridisegnata in maniera approssimata via DOM image se gia' caricata
      const img = window._ilcuboTmpImg && window._ilcuboTmpImg[faceName];
      if (img && img.complete && img.naturalWidth > 0) {
        try {
          const tileW = img.naturalWidth / size, tileH = img.naturalHeight / size;
          ctx.drawImage(img, col * tileW, row * tileH, tileW, tileH, x + 2, y + 2, tile - 4, tile - 4);
        } catch (_) {}
      }
    }
    ctx.restore();
  }

  function exportPng() {
    const cfg = getFaceConfig();
    const colors = getThemeColors();
    const size = (window.game && window.game.cube && window.game.cube.size) ? window.game.cube.size : 3;

    // pre-carica eventuali immagini per faccia
    window._ilcuboTmpImg = {};
    let pending = 0;
    for (const f of ['U','D','F','B','L','R']) {
      const fc = cfg.faces && cfg.faces[f];
      if (fc && fc.mode === 'image' && fc.dataURL) {
        pending++;
        const im = new Image();
        im.onload = im.onerror = () => { window._ilcuboTmpImg[f] = im; if (--pending === 0) doRender(); };
        im.src = fc.dataURL;
      }
    }
    if (pending === 0) doRender();

    function doRender() {
      const tile = 48; // px per cubetto
      const W = (size * 4) * tile;
      const H = (size * 3) * tile;
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#202326';
      ctx.fillRect(0, 0, W, H);

      // layout cross:
      //          [U]
      //       [L][F][R][B]
      //          [D]
      const x0 = size * tile;
      drawFaceUnfold(ctx, x0,         0,                tile, size, 'U', cfg.faces.U, colors);
      drawFaceUnfold(ctx, 0,          size * tile,      tile, size, 'L', cfg.faces.L, colors);
      drawFaceUnfold(ctx, x0,         size * tile,      tile, size, 'F', cfg.faces.F, colors);
      drawFaceUnfold(ctx, x0 + size*tile, size * tile,  tile, size, 'R', cfg.faces.R, colors);
      drawFaceUnfold(ctx, x0 + 2*size*tile, size * tile,tile, size, 'B', cfg.faces.B, colors);
      drawFaceUnfold(ctx, x0,         2 * size * tile,  tile, size, 'D', cfg.faces.D, colors);

      // firma
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = 'bold 14px system-ui,-apple-system,Segoe UI,Roboto,Arial';
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText('ILCUBO — pezzaliAPP.com', W - 8, H - 6);

      cv.toBlob((blob) => {
        if (!blob) { alert('Errore creazione PNG.'); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'ilcubo-snapshot.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 500);
      }, 'image/png');
    }
  }

  // --- A11y: focus visible & keyboard nav --------------------------------
  function injectA11yCss() {
    if (document.getElementById('qol-a11y')) return;
    const s = document.createElement('style');
    s.id = 'qol-a11y';
    s.textContent = `
      .ui__buttons .btn:focus-visible,
      .help-btn:focus-visible,
      .cz-btn:focus-visible,
      .gm-btn:focus-visible,
      .qol-btn:focus-visible {
        outline: 3px solid #4da3ff;
        outline-offset: 3px;
      }
      .ui__buttons .btn { outline: none; }
    `;
    document.head.appendChild(s);
  }

  // Rende focusabili i pulsanti laterali di cube.js (in alcuni casi mancano i tabindex)
  function ensureFocusable() {
    const sels = ['.btn--prefs', '.btn--theme', '.btn--reset', '.btn--back', '.btn--stats'];
    for (const sel of sels) {
      const b = document.querySelector(sel);
      if (b && !b.hasAttribute('tabindex')) b.setAttribute('tabindex', '0');
    }
  }

  // --- Pannello UI --------------------------------------------------------
  function buildPanel() {
    if (document.getElementById('qolPanel')) return;
    const style = document.createElement('style');
    style.textContent = `
      .qol-btn {
        position: fixed; left: 1rem; top: 6.2rem;
        height: 2.25rem; padding: 0 .8rem; border-radius: 1.125rem;
        border: 0; background: rgba(0,0,0,.08); color: #111;
        font: 700 .85rem/1 system-ui,-apple-system,Segoe UI,Roboto,Arial;
        cursor: pointer; z-index: 20;
        box-shadow: 0 2px 6px rgba(0,0,0,.08);
      }
      #qolPanel[hidden] { display:none; }
      #qolPanel {
        position: fixed; inset: 0; z-index: 37;
        background: rgba(0,0,0,.45); display: grid; place-items: center;
      }
      .qol-card {
        width: min(520px, 94vw); max-height: 90vh; overflow:auto;
        background: #fff; color: #111; border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,.25);
        padding: 16px 18px 12px;
        font: 400 15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial;
      }
      .qol-row { display:flex; gap:10px; align-items:center; margin: 10px 0; }
      .qol-row label { user-select: none; cursor: pointer; }
      .qol-actions { display:flex; gap:8px; flex-wrap:wrap; justify-content:space-between; margin-top: 14px; }
      .qol-action {
        border: 0; padding: .55rem .9rem; border-radius: 8px; font-weight: 700; cursor: pointer;
      }
      .qol-action.primary { background:#111; color:#fff; }
      .qol-action.ghost   { background:#f1f3f7; color:#111; }
      @media (max-width: 480px) { .qol-btn { left: .6rem; top: 5.6rem; } }
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'qolToggle'; btn.className = 'qol-btn';
    btn.setAttribute('aria-controls', 'qolPanel');
    btn.setAttribute('aria-expanded', 'false');
    btn.title = 'Opzioni';
    btn.textContent = 'Opzioni';
    btn.addEventListener('click', openPanel);
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'qolPanel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'qolTitle');
    panel.innerHTML = `
      <div class="qol-card">
        <h2 id="qolTitle" style="margin:0 0 8px;font-size:1.2rem;">Opzioni</h2>
        <div class="qol-row">
          <input type="checkbox" id="qolVibrate">
          <label for="qolVibrate">Vibrazione su rotazione (solo mobile)</label>
        </div>
        <div class="qol-row">
          <input type="checkbox" id="qolSound">
          <label for="qolSound">Suoni discreti (mosse, scramble, completamento)</label>
        </div>
        <div class="qol-actions">
          <button class="qol-action ghost" id="qolExportPng">Esporta PNG</button>
          <button class="qol-action primary" id="qolClose">Chiudi</button>
        </div>
        <p style="font-size:.8rem;color:#555;margin:10px 0 0;">L’export PNG genera una vista "srotolata" delle 6 facce con la configurazione attuale.</p>
      </div>
    `;
    panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });
    document.body.appendChild(panel);

    panel.querySelector('#qolVibrate').checked = !!prefs.vibrate;
    panel.querySelector('#qolSound').checked   = !!prefs.sound;
    panel.querySelector('#qolVibrate').addEventListener('change', (e) => { prefs.vibrate = e.target.checked; savePrefs(); if (prefs.vibrate) vibrate(15); });
    panel.querySelector('#qolSound').addEventListener('change',   (e) => { prefs.sound   = e.target.checked; savePrefs(); if (prefs.sound)   beep(660, 0.08); });
    panel.querySelector('#qolClose').addEventListener('click', closePanel);
    panel.querySelector('#qolExportPng').addEventListener('click', exportPng);

    window.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) closePanel(); });
  }

  function openPanel() {
    const p = document.getElementById('qolPanel');
    if (!p) return;
    p.hidden = false;
    document.getElementById('qolToggle').setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    const p = document.getElementById('qolPanel');
    if (!p) return;
    p.hidden = true;
    const b = document.getElementById('qolToggle'); if (b) b.setAttribute('aria-expanded', 'false');
  }

  // --- Boot --------------------------------------------------------------
  function boot() {
    injectA11yCss();
    buildPanel();
    whenGameReady(() => {
      installHooks();
      ensureFocusable();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.ILCUBO = window.ILCUBO || {};
  window.ILCUBO.qol = {
    getPrefs: () => Object.assign({}, prefs),
    setPrefs: (p) => { prefs = Object.assign(defaultPrefs(), p || {}); savePrefs(); },
    exportPng,
  };
})();
