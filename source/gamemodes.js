/*
© 2026 Alessandro Pezzali. ILCUBO — Modalita' di gioco extra.
- Modalita' Memo: mostra la configurazione per X secondi, poi mischia.
- Galleria pattern famosi: mostra alcuni pattern classici con l'algoritmo
  in notazione standard, da eseguire manualmente sul cubo.
*/
(function () {
  'use strict';

  // --- Utils -------------------------------------------------------------
  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else if (k === 'html') e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (children) for (const c of children) if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    return e;
  }

  function gameReady() {
    return !!(window.game && window.game.cube && Array.isArray(window.game.cube.edges) && window.game.cube.edges.length > 0);
  }

  function whenGameReady(cb) {
    let tries = 0;
    function tick() {
      if (gameReady()) cb();
      else if (++tries < 300) setTimeout(tick, 50);
    }
    tick();
  }

  // --- Stili --------------------------------------------------------------
  function injectStyles() {
    if (document.getElementById('gm-styles')) return;
    const style = el('style', { id: 'gm-styles' });
    style.textContent = `
      .gm-btn {
        position: fixed; left: 16px; top: 64px;
        height: 40px; padding: 0 16px; border-radius: 20px;
        border: 0; background: rgba(0,0,0,.08); color: #111;
        font: 700 15px/1 system-ui,-apple-system,Segoe UI,Roboto,Arial;
        cursor: pointer; z-index: 20;
        box-shadow: 0 2px 6px rgba(0,0,0,.08);
      }
      .gm-btn:focus { outline: 2px solid #4da3ff; outline-offset: 2px; }
      #gmPanel[hidden] { display:none; }
      #gmPanel {
        position: fixed; inset: 0; z-index: 36;
        background: rgba(0,0,0,.45);
        display: grid; place-items: center;
      }
      .gm-card {
        width: min(720px, 94vw); max-height: 90vh; overflow:auto;
        background: #fff; color: #111; border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,.25);
        padding: 16px 18px 12px;
        font: 400 15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,Arial;
      }
      .gm-tabs { display: flex; gap: .25rem; margin: 4px 0 12px; border-bottom: 1px solid #e5e8ee; }
      .gm-tab {
        background: transparent; border: 0; padding: .5rem .8rem;
        font: 600 .9rem/1.1 inherit; cursor: pointer; color: #555;
        border-bottom: 3px solid transparent; margin-bottom: -1px;
      }
      .gm-tab.is-active { color: #111; border-color: #4da3ff; }
      .gm-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin: 8px 0; }
      .gm-row input[type="number"], .gm-row input[type="range"] { padding: .35rem .5rem; }
      .gm-action {
        border: 0; padding: .55rem .9rem; border-radius: 8px;
        font-weight: 700; cursor: pointer;
      }
      .gm-action.primary { background: #111; color: #fff; }
      .gm-action.ghost   { background: #f1f3f7; color: #111; }
      .gm-action:focus   { outline: 2px solid #4da3ff; outline-offset: 2px; }
      .gm-pattern { padding: 10px 0; border-bottom: 1px solid #eef0f5; }
      .gm-pattern:last-child { border-bottom: 0; }
      .gm-pattern h4 { margin: 0 0 4px; font-size: 1rem; }
      .gm-pattern code {
        display:block; background:#f3f5f8; padding:.4rem .55rem; border-radius:6px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: .9rem; overflow-x:auto; white-space: nowrap;
      }
      #gmCountdown {
        position: fixed; inset: 0; z-index: 40;
        background: rgba(0,0,0,.55);
        display: grid; place-items: center; color: #fff;
        font: 800 4.5rem/1 system-ui,-apple-system,Segoe UI,Roboto,Arial;
        text-shadow: 0 4px 20px rgba(0,0,0,.4);
      }
      #gmCountdown[hidden] { display:none; }
      #gmCountdown .label { font-size: 1rem; opacity: .9; margin-top: 12px; font-weight: 600; }
      @media (max-width: 480px) { .gm-btn { left: 10px; top: 58px; } }
    `;
    document.head.appendChild(style);
  }

  // --- Pattern famosi -----------------------------------------------------
  const PATTERNS = [
    {
      name: 'Checkerboard (Scacchiera)',
      desc: 'Tutti i quadrati colorati alternati: facce opposte permutate.',
      algo: 'M2 E2 S2',
      cubeSize: 3,
    },
    {
      name: 'Superflip',
      desc: 'Tutti gli spigoli orientati al contrario, posizioni invariate.',
      algo: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
      cubeSize: 3,
    },
    {
      name: 'Cube in a Cube',
      desc: 'Un cubo piccolo annidato in un cubo grande.',
      algo: "F L F U' R U F2 L2 U' L' B D' B' L2 U",
      cubeSize: 3,
    },
    {
      name: 'Cross',
      desc: 'Una croce su ogni faccia.',
      algo: "U F B' L2 U2 L2 F' B U2 L2 U",
      cubeSize: 3,
    },
    {
      name: 'Sei punti',
      desc: 'Un puntino al centro di ogni faccia.',
      algo: 'U D R L F B U D R L F B',
      cubeSize: 3,
    },
  ];

  function buildPatternsTab(host) {
    host.innerHTML = '';
    host.appendChild(el('p', { text: 'Esegui l’algoritmo passo-passo sul cubo (notazione: U=Sopra, D=Sotto, F=Fronte, B=Retro, L=Sinistra, R=Destra; \' = antiorario; 2 = doppio; M/E/S = slice). Richiedono un cubo 3×3.' }));
    for (const p of PATTERNS) {
      const card = el('div', { class: 'gm-pattern' });
      card.appendChild(el('h4', { text: p.name }));
      card.appendChild(el('div', { text: p.desc }));
      card.appendChild(el('code', { text: p.algo }));
      const row = el('div', { class: 'gm-row' });
      const copy = el('button', { class: 'gm-action ghost', text: 'Copia mosse' });
      copy.addEventListener('click', () => {
        const fn = () => { copy.textContent = 'Copiato!'; setTimeout(() => copy.textContent = 'Copia mosse', 1400); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(p.algo).then(fn).catch(fn);
        else fn();
      });
      row.appendChild(copy);
      card.appendChild(row);
      host.appendChild(card);
    }
  }

  // --- Modalita' Memo -----------------------------------------------------
  let memoDuration = 5;

  function buildMemoTab(host) {
    host.innerHTML = '';
    host.appendChild(el('p', { text: 'Memorizza la configurazione attuale del cubo per qualche secondo, poi il cubo verra' + '’' + ' mischiato. La sfida e' + '’' + ': ricostruire la configurazione iniziale.' }));
    const row = el('div', { class: 'gm-row' });
    row.appendChild(el('label', { for: 'gmDuration', text: 'Secondi di memorizzazione' }));
    const input = el('input', { type: 'number', id: 'gmDuration', min: '2', max: '60', step: '1' });
    input.value = String(memoDuration);
    input.style.width = '5rem';
    input.addEventListener('change', () => {
      const v = parseInt(input.value, 10);
      memoDuration = Math.max(2, Math.min(60, Number.isFinite(v) ? v : 5));
      input.value = String(memoDuration);
    });
    row.appendChild(input);
    host.appendChild(row);

    const startRow = el('div', { class: 'gm-row' });
    const start = el('button', { class: 'gm-action primary', text: 'Avvia memo' });
    start.addEventListener('click', () => { closePanel(); startMemoChallenge(memoDuration); });
    startRow.appendChild(start);
    host.appendChild(startRow);

    host.appendChild(el('p', { text: 'Suggerimento: usa la modalita' + '’ ' + 'Personalizza per assegnare numeri o emoji alle facce: rendono il cubo molto piu' + '’ ' + 'memorizzabile.' }));
  }

  function ensureCountdownEl() {
    let cd = document.getElementById('gmCountdown');
    if (cd) return cd;
    cd = el('div', { id: 'gmCountdown', 'aria-live': 'polite', hidden: 'hidden' });
    cd.appendChild(el('span', { id: 'gmCountNum', text: '0' }));
    cd.appendChild(el('div', { class: 'label', text: 'Memorizza la configurazione' }));
    document.body.appendChild(cd);
    return cd;
  }

  function startMemoChallenge(seconds) {
    if (!gameReady()) { alert('Cubo non ancora pronto, riprova fra un istante.'); return; }
    const cd = ensureCountdownEl();
    const num = cd.querySelector('#gmCountNum');
    let remaining = seconds;
    num.textContent = String(remaining);
    cd.hidden = false;

    const tick = () => {
      remaining--;
      if (remaining <= 0) {
        cd.hidden = true;
        triggerScramble();
        return;
      }
      num.textContent = String(remaining);
      setTimeout(tick, 1000);
    };
    setTimeout(tick, 1000);
  }

  function triggerScramble() {
    // Cube.js parte dallo stato Menu: un click su .ui__game avvia il gioco
    // (che esegue scramble + parte timer). Se siamo gia' in Playing, simuliamo
    // due click (back → game) per ottenere un nuovo scramble.
    try {
      const dom = window.game && window.game.dom && window.game.dom.game;
      if (!dom) return;
      // Se siamo gia' in gioco, torna prima al menu
      const I = window.game.state;
      const back = window.game.dom.buttons && window.game.dom.buttons.back;
      if (typeof I === 'number' && I !== 0 && back && typeof back.onclick === 'function') {
        try { back.onclick(); } catch (_) {}
      }
      // click sul cubo per partire
      const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
      dom.dispatchEvent(ev);
    } catch (e) {
      console.warn('ILCUBO: impossibile avviare scramble automatico', e);
    }
  }

  // --- Pannello -----------------------------------------------------------
  let activeTab = 'memo';
  function buildPanelShell() {
    if (document.getElementById('gmPanel')) return;
    injectStyles();

    const btn = el('button', { id: 'gmToggle', class: 'gm-btn', 'aria-controls': 'gmPanel', 'aria-expanded': 'false', title: 'Modalita’ di gioco' }, ['Sfide']);
    btn.addEventListener('click', openPanel);
    document.body.appendChild(btn);

    const panel = el('div', { id: 'gmPanel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gmTitle', hidden: 'hidden' });
    const card = el('div', { class: 'gm-card' });
    card.appendChild(el('h2', { id: 'gmTitle', text: 'Modalita’ di gioco' }));

    const tabs = el('div', { class: 'gm-tabs' });
    const tabMemo = el('button', { class: 'gm-tab', 'data-tab': 'memo', text: 'Memo' });
    const tabPat  = el('button', { class: 'gm-tab', 'data-tab': 'patterns', text: 'Pattern famosi' });
    tabMemo.addEventListener('click', () => { activeTab = 'memo'; renderTabs(); });
    tabPat.addEventListener('click',  () => { activeTab = 'patterns'; renderTabs(); });
    tabs.appendChild(tabMemo); tabs.appendChild(tabPat);
    card.appendChild(tabs);

    const body = el('div', { id: 'gmBody' });
    card.appendChild(body);

    const actions = el('div', { class: 'gm-row' });
    actions.style.justifyContent = 'flex-end';
    const close = el('button', { class: 'gm-action ghost', text: 'Chiudi' });
    close.addEventListener('click', closePanel);
    actions.appendChild(close);
    card.appendChild(actions);

    panel.appendChild(card);
    panel.addEventListener('click', e => { if (e.target === panel) closePanel(); });
    document.body.appendChild(panel);

    window.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) closePanel(); });
  }

  function renderTabs() {
    const body = document.getElementById('gmBody');
    if (!body) return;
    for (const t of document.querySelectorAll('.gm-tab')) t.classList.toggle('is-active', t.dataset.tab === activeTab);
    if (activeTab === 'memo') buildMemoTab(body);
    else buildPatternsTab(body);
  }

  function openPanel() {
    buildPanelShell();
    const p = document.getElementById('gmPanel');
    if (!p) return;
    renderTabs();
    p.hidden = false;
    document.getElementById('gmToggle').setAttribute('aria-expanded', 'true');
  }

  function closePanel() {
    const p = document.getElementById('gmPanel');
    if (!p) return;
    p.hidden = true;
    const b = document.getElementById('gmToggle');
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  // --- Boot ---------------------------------------------------------------
  function boot() {
    buildPanelShell();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.ILCUBO = window.ILCUBO || {};
  window.ILCUBO.gamemodes = {
    open: openPanel,
    startMemo: startMemoChallenge,
    patterns: PATTERNS.slice(),
  };
})();
