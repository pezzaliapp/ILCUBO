/*
© 2026 Alessandro Pezzali. ILCUBO — Modulo personalizzazione facce.
Aggiunge un pannello "Personalizza" che permette di sostituire i colori
classici di ciascuna faccia con: Colore | Numero | Lettera | Testo | Emoji | Immagine.

Il modulo si applica DOPO che window.game (cube.js) e' stato creato:
si aggancia a game.cube.updateColors e re-disegna gli sticker con texture
custom, oppure lascia il colore classico quando il modo e' 'color'.
*/
(function () {
  'use strict';

  const STORAGE_KEY = 'ilcubo.faceConfig';
  const FACES = ['U', 'D', 'F', 'B', 'L', 'R'];
  const FACE_LABEL = { U: 'Sopra', D: 'Sotto', F: 'Fronte', B: 'Retro', L: 'Sinistra', R: 'Destra' };
  const MODES = [
    { id: 'color',  label: 'Colore' },
    { id: 'number', label: 'Numero' },
    { id: 'letter', label: 'Lettera' },
    { id: 'text',   label: 'Testo' },
    { id: 'emoji',  label: 'Emoji' },
    { id: 'image',  label: 'Immagine' },
  ];

  // --- Stato persistito --------------------------------------------------
  function defaultFaceConfig() {
    const cfg = { version: 1, faces: {} };
    for (const f of FACES) cfg.faces[f] = { mode: 'color' };
    return cfg;
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultFaceConfig();
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.faces) return defaultFaceConfig();
      const cfg = defaultFaceConfig();
      for (const f of FACES) {
        if (parsed.faces[f] && typeof parsed.faces[f] === 'object') {
          cfg.faces[f] = Object.assign({ mode: 'color' }, parsed.faces[f]);
        }
      }
      return cfg;
    } catch (_) {
      return defaultFaceConfig();
    }
  }

  function saveConfig(cfg) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); } catch (_) {}
  }

  let state = loadConfig();
  let selectedFace = 'U';

  // --- Coordinate sticker → (riga, colonna) ------------------------------
  // Le pieces sono posizionate su una griglia centrata in 0 con passo 1/3,
  // quindi parent.position * 3 da' coordinate intere centrate.
  function stickerCell(parent, faceName, size) {
    const half = (size - 1) / 2;
    const px = Math.round(parent.position.x * 3 + half);
    const py = Math.round(parent.position.y * 3 + half);
    const pz = Math.round(parent.position.z * 3 + half);
    // px,py,pz ∈ [0, size-1]
    switch (faceName) {
      case 'U': return { row: pz,              col: px              };
      case 'D': return { row: size - 1 - pz,   col: px              };
      case 'F': return { row: size - 1 - py,   col: px              };
      case 'B': return { row: size - 1 - py,   col: size - 1 - px   };
      case 'R': return { row: size - 1 - py,   col: size - 1 - pz   };
      case 'L': return { row: size - 1 - py,   col: pz              };
      default:  return { row: 0, col: 0 };
    }
    // NB: questa griglia e' "logica" (top-left = 0,0 guardando la faccia da fuori).
    // L'orientamento della texture sullo sticker viene gestito da textureRotationFor().
  }

  // Rotazione (in radianti) da applicare alla texture per portarla "in piedi"
  // dal punto di vista dell'utente che guarda la faccia da fuori.
  function textureRotationFor(faceName) {
    // Valori di base; il fine-tuning si fa in modalita' di test.
    // L'orientamento di default dello sticker dipende da cube.js (rotation set per face).
    switch (faceName) {
      case 'U': return 0;
      case 'D': return 0;
      case 'F': return 0;
      case 'B': return Math.PI;
      case 'L': return 0;
      case 'R': return 0;
      default:  return 0;
    }
  }

  // --- Texture builders --------------------------------------------------
  const TEX_SIZE = 256;

  function makeCanvas() {
    const c = document.createElement('canvas');
    c.width = TEX_SIZE; c.height = TEX_SIZE;
    return c;
  }

  function fillBg(ctx, hex) {
    ctx.fillStyle = '#' + hex.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  }

  function drawCenteredText(ctx, text, opts) {
    const { color = '#111', font = 'bold 160px system-ui, -apple-system, Segoe UI, Roboto, Arial' } = opts || {};
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, TEX_SIZE / 2, TEX_SIZE / 2 + 8);
  }

  function buildTextureForSticker(faceName, row, col, size, faceCfg, faceColorHex) {
    if (!faceCfg || faceCfg.mode === 'color') return null;
    const canvas = makeCanvas();
    const ctx = canvas.getContext('2d');
    fillBg(ctx, faceColorHex);

    switch (faceCfg.mode) {
      case 'number': {
        // Numera da 1 a N^2 in ordine reading-order (riga × N + col + 1).
        const orient = faceCfg.orient === 'col' ? 'col' : 'row';
        const start = Number.isFinite(faceCfg.start) ? faceCfg.start | 0 : 1;
        const idx = orient === 'col' ? (col * size + row) : (row * size + col);
        drawCenteredText(ctx, String(start + idx), { color: '#111' });
        break;
      }
      case 'letter': {
        const orient = faceCfg.orient === 'col' ? 'col' : 'row';
        const idx = orient === 'col' ? (col * size + row) : (row * size + col);
        // A..Z poi ripetiamo se N^2 > 26.
        const ch = String.fromCharCode(65 + (idx % 26));
        drawCenteredText(ctx, ch, { color: '#111' });
        break;
      }
      case 'text': {
        // testo distribuito su una riga (o colonna) della faccia centrale.
        const txt = String(faceCfg.text || '').slice(0, size);
        const orient = faceCfg.orient === 'col' ? 'col' : 'row';
        // disegno il carattere solo sulla riga/colonna centrale.
        const mid = (size - 1) >> 1;
        let ch = '';
        if (orient === 'row' && row === mid && col < txt.length) ch = txt[col];
        else if (orient === 'col' && col === mid && row < txt.length) ch = txt[row];
        if (ch) drawCenteredText(ctx, ch, { color: '#111' });
        break;
      }
      case 'emoji': {
        const list = Array.isArray(faceCfg.list) ? faceCfg.list : [];
        const idx = row * size + col;
        const e = list[idx] || '';
        if (e) drawCenteredText(ctx, e, { font: 'bold 170px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui' });
        break;
      }
      case 'image': {
        // L'immagine completa e' stata pre-renderizzata in faceCfg._tiles[row][col] come dataURL,
        // oppure la fonte e' in faceCfg.dataURL e renderizziamo on-the-fly tile per tile.
        const img = faceCfg._imgEl;
        if (img && img.complete && img.naturalWidth > 0) {
          const tileW = img.naturalWidth / size;
          const tileH = img.naturalHeight / size;
          try {
            ctx.drawImage(img, col * tileW, row * tileH, tileW, tileH, 0, 0, TEX_SIZE, TEX_SIZE);
          } catch (_) { /* canvas tainted o errore: lascia sfondo */ }
        }
        break;
      }
      default:
        return null;
    }

    if (typeof THREE !== 'undefined' && THREE.CanvasTexture) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.center = new THREE.Vector2(0.5, 0.5);
      tex.rotation = textureRotationFor(faceName);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      return tex;
    }
    return null;
  }

  // --- Applicazione al cubo ---------------------------------------------
  function applyToCube() {
    const g = window.game;
    if (!g || !g.cube || !Array.isArray(g.cube.edges) || g.cube.edges.length === 0) return;
    const size = g.cube.size | 0;
    const colors = (g.themes && typeof g.themes.getColors === 'function') ? g.themes.getColors() : null;
    const fallback = { U: 0xffffff, D: 0xffd000, F: 0x00a74a, B: 0x2f6ee6, L: 0xff6c00, R: 0xd80027, P: 0x111111 };

    // Pre-caricamento immagini se necessario
    for (const f of FACES) {
      const fc = state.faces[f];
      if (fc && fc.mode === 'image' && fc.dataURL && !fc._imgEl) {
        const im = new Image();
        im.onload = () => applyToCube();
        im.src = fc.dataURL;
        fc._imgEl = im;
      }
    }

    g.cube.edges.forEach(edge => {
      const fn = edge.name;
      const faceCfg = state.faces[fn] || { mode: 'color' };
      const colorHex = (colors && colors[fn] != null) ? colors[fn] : fallback[fn];

      // Sempre ripristina tinta material a quella di base
      edge.material.color.setHex(colorHex);

      if (faceCfg.mode === 'color') {
        // Rimuovi texture custom se presente
        if (edge.material.map) {
          edge.material.map.dispose && edge.material.map.dispose();
          edge.material.map = null;
          edge.material.needsUpdate = true;
        }
        return;
      }

      const parent = edge.parent;
      if (!parent) return;
      const { row, col } = stickerCell(parent, fn, size);
      const tex = buildTextureForSticker(fn, row, col, size, faceCfg, colorHex);
      if (tex) {
        // su texture custom usiamo bianco come tint (la texture porta gia' lo sfondo colorato)
        edge.material.color.setHex(0xffffff);
        if (edge.material.map) {
          edge.material.map.dispose && edge.material.map.dispose();
        }
        edge.material.map = tex;
        edge.material.needsUpdate = true;
      }
    });
  }

  // --- Hook su updateColors per re-applicare dopo cambi tema/size --------
  function installHook() {
    const g = window.game;
    if (!g || !g.cube || g.cube.__ilcuboHooked) return false;
    const orig = g.cube.updateColors.bind(g.cube);
    g.cube.updateColors = function (e) {
      orig(e);
      // Riapplica le facce personalizzate dopo il reset colori
      try { applyToCube(); } catch (err) { console.warn('ILCUBO customize: applyToCube failed', err); }
    };
    g.cube.__ilcuboHooked = true;
    return true;
  }

  // attendi che window.game esista (cube.js gira in autoinit)
  function whenGameReady(cb) {
    let tries = 0;
    function tick() {
      if (window.game && window.game.cube && Array.isArray(window.game.cube.edges) && window.game.cube.edges.length > 0) {
        cb();
      } else if (++tries < 300) {
        setTimeout(tick, 50);
      }
    }
    tick();
  }

  // --- UI: pannello Personalizza ----------------------------------------
  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    if (children) for (const c of children) if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    return e;
  }

  function buildPanelShell() {
    if (document.getElementById('customizePanel')) return;

    // Stili scoped via id #customizePanel
    const style = el('style', null);
    style.textContent = `
      .cz-btn {
        position: fixed; left: 1rem; top: 1rem;
        height: 2.25rem; padding: 0 .8rem; border-radius: 1.125rem;
        border: 0; background: rgba(0,0,0,.08); color: #111;
        font: 700 .85rem/1 system-ui,-apple-system,Segoe UI,Roboto,Arial;
        cursor: pointer; z-index: 20;
        box-shadow: 0 2px 6px rgba(0,0,0,.08);
      }
      .cz-btn:focus { outline: 2px solid #4da3ff; outline-offset: 2px; }
      #customizePanel[hidden] { display: none; }
      #customizePanel {
        position: fixed; inset: 0; z-index: 35;
        background: rgba(0,0,0,.45);
        display: grid; place-items: center;
      }
      .cz-card {
        width: min(720px, 94vw); max-height: 90vh; overflow: auto;
        background: #fff; color: #111; border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,.25);
        padding: 16px 18px 12px;
        font: 400 15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial;
      }
      .cz-card h2 { margin: 0 0 8px; font-size: 1.25rem; }
      .cz-faces { display: flex; gap: .4rem; flex-wrap: wrap; margin: 8px 0 12px; }
      .cz-face {
        flex: 1 1 0; min-width: 78px;
        border: 2px solid transparent; border-radius: 10px;
        padding: 8px 6px; cursor: pointer;
        background: #f3f5f8; text-align: center;
        display: flex; flex-direction: column; align-items: center; gap: 4px;
      }
      .cz-face.is-active { border-color: #4da3ff; }
      .cz-face .sw {
        width: 22px; height: 22px; border-radius: 6px;
        box-shadow: inset 0 0 0 1px rgba(0,0,0,.1);
      }
      .cz-face .lbl { font-weight: 700; font-size: .85rem; }
      .cz-face .mode { font-size: .72rem; color: #555; }
      .cz-row { margin: 8px 0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
      .cz-row label { font-weight: 600; min-width: 90px; }
      .cz-row input[type="text"], .cz-row select {
        flex: 1; min-width: 120px;
        padding: .45rem .6rem; border: 1px solid #cfd5df; border-radius: 8px;
        font: inherit; background: #fff;
      }
      .cz-row .warn { color: #b3261e; font-size: .85rem; flex-basis: 100%; }
      .cz-radios { display: inline-flex; gap: .8rem; align-items: center; }
      .cz-emoji-grid { display: grid; gap: 4px; margin-top: 6px; }
      .cz-emoji-grid input {
        width: 100%; aspect-ratio: 1/1;
        font-size: 1.2rem; text-align: center;
        border: 1px solid #cfd5df; border-radius: 6px; background: #fff;
      }
      .cz-actions {
        display: flex; gap: .5rem; justify-content: space-between;
        margin-top: 12px; flex-wrap: wrap;
      }
      .cz-actions .right { display: inline-flex; gap: .5rem; }
      .cz-action {
        border: 0; padding: .55rem .9rem; border-radius: 8px;
        font-weight: 700; cursor: pointer;
      }
      .cz-action.primary { background: #111; color: #fff; }
      .cz-action.ghost   { background: #f1f3f7; color: #111; }
      .cz-action:focus   { outline: 2px solid #4da3ff; outline-offset: 2px; }
      @media (max-width: 480px) {
        .cz-btn { left: .6rem; top: .6rem; }
        .cz-face { min-width: 60px; padding: 6px 4px; }
      }
    `;
    document.head.appendChild(style);

    const btn = el('button', { id: 'customizeToggle', class: 'cz-btn', 'aria-controls': 'customizePanel', 'aria-expanded': 'false', title: 'Personalizza le facce' }, ['Personalizza']);
    btn.addEventListener('click', openPanel);
    document.body.appendChild(btn);

    const panel = el('div', { id: 'customizePanel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'czTitle', hidden: 'hidden' });
    const card = el('div', { class: 'cz-card' });
    card.appendChild(el('h2', { id: 'czTitle', text: 'Personalizza le facce' }));
    card.appendChild(el('p', { text: 'Scegli un tipo per ciascuna faccia. Le modifiche restano memorizzate in questo dispositivo.' }));

    const facesRow = el('div', { id: 'czFaces', class: 'cz-faces' });
    card.appendChild(facesRow);

    const editor = el('div', { id: 'czEditor' });
    card.appendChild(editor);

    const actions = el('div', { class: 'cz-actions' });
    const resetBtn = el('button', { class: 'cz-action ghost', id: 'czReset', text: 'Reset facce' });
    resetBtn.addEventListener('click', () => {
      if (!confirm('Riporto tutte le facce al modo Colore?')) return;
      state = defaultFaceConfig();
      saveConfig(state);
      renderPanel();
      applyToCube();
    });
    const right = el('div', { class: 'right' });
    const closeBtn = el('button', { class: 'cz-action primary', id: 'czClose', text: 'Chiudi' });
    closeBtn.addEventListener('click', closePanel);
    right.appendChild(closeBtn);
    actions.appendChild(resetBtn);
    actions.appendChild(right);
    card.appendChild(actions);

    panel.appendChild(card);
    panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
    document.body.appendChild(panel);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    });
  }

  function openPanel() {
    const panel = document.getElementById('customizePanel');
    if (!panel) return;
    renderPanel();
    panel.hidden = false;
    const btn = document.getElementById('customizeToggle');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    const panel = document.getElementById('customizePanel');
    if (!panel) return;
    panel.hidden = true;
    const btn = document.getElementById('customizeToggle');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function currentSize() {
    return (window.game && window.game.cube && window.game.cube.size) ? window.game.cube.size : 3;
  }

  function colorForFace(face) {
    const g = window.game;
    let c = null;
    if (g && g.themes && typeof g.themes.getColors === 'function') c = g.themes.getColors();
    const fallback = { U: 0xffffff, D: 0xffd000, F: 0x00a74a, B: 0x2f6ee6, L: 0xff6c00, R: 0xd80027 };
    const hex = c && c[face] != null ? c[face] : fallback[face];
    return '#' + hex.toString(16).padStart(6, '0');
  }

  function renderFacesRow() {
    const row = document.getElementById('czFaces');
    if (!row) return;
    row.innerHTML = '';
    for (const f of FACES) {
      const card = el('div', {
        class: 'cz-face' + (f === selectedFace ? ' is-active' : ''),
        role: 'button',
        tabindex: '0',
        'aria-pressed': f === selectedFace ? 'true' : 'false',
        'aria-label': 'Faccia ' + FACE_LABEL[f] + ' — modo ' + (state.faces[f].mode || 'color'),
      });
      card.addEventListener('click', () => { selectedFace = f; renderPanel(); });
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectedFace = f; renderPanel(); } });
      const sw = el('div', { class: 'sw' });
      sw.style.background = colorForFace(f);
      card.appendChild(sw);
      card.appendChild(el('div', { class: 'lbl', text: FACE_LABEL[f] }));
      const modeLabel = (MODES.find(m => m.id === state.faces[f].mode) || MODES[0]).label;
      card.appendChild(el('div', { class: 'mode', text: modeLabel }));
      row.appendChild(card);
    }
  }

  function renderEditor() {
    const host = document.getElementById('czEditor');
    if (!host) return;
    host.innerHTML = '';

    const fc = state.faces[selectedFace];
    const size = currentSize();

    // Mode selector
    const modeRow = el('div', { class: 'cz-row' });
    modeRow.appendChild(el('label', { for: 'czMode', text: 'Modo' }));
    const sel = el('select', { id: 'czMode' });
    for (const m of MODES) {
      const opt = el('option', { value: m.id, text: m.label });
      if (m.id === fc.mode) opt.setAttribute('selected', 'selected');
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => {
      const newMode = sel.value;
      // crea config base per il nuovo modo (preservando dati compatibili)
      const next = { mode: newMode };
      if (newMode === 'number') Object.assign(next, { orient: fc.orient || 'row', start: typeof fc.start === 'number' ? fc.start : 1 });
      if (newMode === 'letter') Object.assign(next, { orient: fc.orient || 'row' });
      if (newMode === 'text')   Object.assign(next, { orient: fc.orient || 'row', text: typeof fc.text === 'string' ? fc.text.slice(0, size) : '' });
      if (newMode === 'emoji')  Object.assign(next, { list: Array.isArray(fc.list) ? fc.list.slice(0, size * size) : new Array(size * size).fill('') });
      if (newMode === 'image')  Object.assign(next, { dataURL: fc.dataURL || '' });
      state.faces[selectedFace] = next;
      saveConfig(state);
      renderPanel();
      applyToCube();
    });
    modeRow.appendChild(sel);
    host.appendChild(modeRow);

    // Pannello dipendente dal modo
    if (fc.mode === 'number')  renderNumberEditor(host, fc, size);
    if (fc.mode === 'letter')  renderLetterEditor(host, fc, size);
    if (fc.mode === 'text')    renderTextEditor(host, fc, size);
    if (fc.mode === 'emoji')   renderEmojiEditor(host, fc, size);
    if (fc.mode === 'image')   renderImageEditor(host, fc, size);
  }

  function renderOrientRadios(host, fc, label) {
    const row = el('div', { class: 'cz-row' });
    row.appendChild(el('label', { text: label || 'Orientamento' }));
    const radios = el('div', { class: 'cz-radios' });
    ['row', 'col'].forEach(o => {
      const id = 'czOr_' + o + '_' + selectedFace;
      const r = el('input', { type: 'radio', name: 'czOr_' + selectedFace, id, value: o });
      if (fc.orient === o || (!fc.orient && o === 'row')) r.setAttribute('checked', 'checked');
      r.addEventListener('change', () => { fc.orient = o; saveConfig(state); applyToCube(); });
      const lab = el('label', { for: id, text: o === 'row' ? 'Orizzontale' : 'Verticale' });
      radios.appendChild(r); radios.appendChild(lab);
    });
    row.appendChild(radios);
    host.appendChild(row);
  }

  function renderNumberEditor(host, fc, size) {
    renderOrientRadios(host, fc);
    const row = el('div', { class: 'cz-row' });
    row.appendChild(el('label', { for: 'czStart', text: 'Partenza' }));
    const input = el('input', { type: 'number', id: 'czStart', min: '0', step: '1' });
    input.value = String(fc.start != null ? fc.start : 1);
    input.addEventListener('input', () => {
      const v = parseInt(input.value, 10);
      fc.start = Number.isFinite(v) ? v : 1;
      saveConfig(state); applyToCube();
    });
    row.appendChild(input);
    host.appendChild(row);
    host.appendChild(el('p', { text: 'Numerazione 1..' + (size * size) + ' (partendo dal valore scelto).' }));
  }

  function renderLetterEditor(host, fc, size) {
    renderOrientRadios(host, fc);
    host.appendChild(el('p', { text: 'A..Z distribuite su ' + (size * size) + ' caselle (ciclico oltre la Z).' }));
  }

  function renderTextEditor(host, fc, size) {
    renderOrientRadios(host, fc);
    const row = el('div', { class: 'cz-row' });
    row.appendChild(el('label', { for: 'czText', text: 'Testo' }));
    const input = el('input', { type: 'text', id: 'czText', maxlength: String(size), placeholder: 'Max ' + size + ' caratteri' });
    input.value = fc.text || '';
    const warn = el('div', { class: 'warn', text: '' });
    input.addEventListener('input', () => {
      let v = input.value;
      if (v.length > size) {
        v = v.slice(0, size);
        warn.textContent = 'Troncato a ' + size + ' caratteri.';
        input.value = v;
      } else {
        warn.textContent = '';
      }
      fc.text = v;
      saveConfig(state); applyToCube();
    });
    row.appendChild(input);
    row.appendChild(warn);
    host.appendChild(row);
    host.appendChild(el('p', { text: 'Il testo viene disegnato sulla riga (o colonna) centrale della faccia.' }));
  }

  function renderEmojiEditor(host, fc, size) {
    const grid = el('div', { class: 'cz-emoji-grid' });
    grid.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
    if (!Array.isArray(fc.list) || fc.list.length !== size * size) fc.list = new Array(size * size).fill('');
    for (let i = 0; i < size * size; i++) {
      const input = el('input', { type: 'text', maxlength: '4', 'aria-label': 'Cella ' + (i + 1), value: fc.list[i] || '' });
      input.addEventListener('input', () => {
        // prende solo il primo carattere "grapheme" semplice
        const v = input.value;
        const seg = Array.from(v)[0] || '';
        fc.list[i] = seg;
        input.value = seg;
        saveConfig(state); applyToCube();
      });
      grid.appendChild(input);
    }
    host.appendChild(grid);
    host.appendChild(el('p', { text: 'Usa il selettore emoji del tuo sistema (su mobile, l\'icona "emoji" sulla tastiera).' }));
  }

  function renderImageEditor(host, fc, size) {
    const row = el('div', { class: 'cz-row' });
    row.appendChild(el('label', { for: 'czImg', text: 'Immagine' }));
    const input = el('input', { type: 'file', id: 'czImg', accept: 'image/png,image/jpeg,image/webp' });
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        fc.dataURL = String(reader.result || '');
        fc._imgEl = null;
        saveConfig(state); applyToCube();
        renderEditor();
      };
      reader.readAsDataURL(file);
    });
    row.appendChild(input);
    host.appendChild(row);
    if (fc.dataURL) {
      const preview = el('img', { src: fc.dataURL, alt: 'anteprima' });
      preview.style.cssText = 'max-width:128px;max-height:128px;border-radius:8px;border:1px solid #ddd;margin-top:6px;';
      host.appendChild(preview);
      const clear = el('button', { class: 'cz-action ghost', text: 'Rimuovi immagine' });
      clear.style.marginLeft = '8px';
      clear.addEventListener('click', () => { fc.dataURL = ''; fc._imgEl = null; saveConfig(state); applyToCube(); renderEditor(); });
      host.appendChild(clear);
    }
    host.appendChild(el('p', { text: 'L\'immagine viene suddivisa in ' + size + '×' + size + ' tile e applicata sulla faccia.' }));
  }

  function renderPanel() {
    renderFacesRow();
    renderEditor();
  }

  // --- Bootstrap ---------------------------------------------------------
  function boot() {
    buildPanelShell();
    whenGameReady(() => {
      installHook();
      applyToCube();
    });
    // Riprova quando si ridimensiona il cubo (size change ricrea this.edges)
    // monitoriamo periodicamente la lunghezza/identita' di edges
    let lastSize = 0, lastFirst = null;
    setInterval(() => {
      const g = window.game;
      if (!g || !g.cube) return;
      const edges = g.cube.edges;
      if (!Array.isArray(edges) || edges.length === 0) return;
      if (g.cube.size !== lastSize || edges[0] !== lastFirst) {
        lastSize = g.cube.size;
        lastFirst = edges[0];
        installHook();
        applyToCube();
      }
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Espone API minima per debug e fase 2 (export/import)
  window.ILCUBO = window.ILCUBO || {};
  window.ILCUBO.customize = {
    getConfig: () => JSON.parse(JSON.stringify(state)),
    setConfig: (cfg) => {
      if (!cfg || !cfg.faces) return;
      state = defaultFaceConfig();
      for (const f of FACES) if (cfg.faces[f]) state.faces[f] = Object.assign({ mode: 'color' }, cfg.faces[f]);
      saveConfig(state);
      applyToCube();
      renderPanel();
    },
    reset: () => { state = defaultFaceConfig(); saveConfig(state); applyToCube(); renderPanel(); },
    apply: applyToCube,
  };
})();
