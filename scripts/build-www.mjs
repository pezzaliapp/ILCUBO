/*
 * Prepara la cartella www/ usata dall'app iOS (Capacitor) a partire da docs/.
 * © 2026 Alessandro Pezzali. Tutti i diritti riservati.
 *
 * Il sito (docs/) non viene toccato. Nella copia per l'App Store:
 *  - niente Google Analytics e Microsoft Clarity (l'app non raccoglie dati);
 *  - niente service worker (i file sono già dentro l'app);
 *  - verifica che non compaia il marchio registrato "Rubik" (Apple respinge le app che lo usano);
 *  - testi adattati al touch ("Doppio tocco", "un'app di pezzaliAPP.com");
 *  - integrazione nativa (native/native.js) per salvare e condividere i file.
 *
 * Ogni sostituzione è verificata: se il sito cambia e un testo non viene più
 * trovato, lo script si ferma invece di produrre un'app sbagliata.
 */
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'docs');
const OUT = join(ROOT, 'www');

const FILES = ['index.html', 'styles.css', 'three.js', 'cube.js', 'ilcubo.bundle.min.js', 'LICENSE', 'THIRD-PARTY.txt', 'icons'];

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function replace(text, from, to, label) {
  const hit = typeof from === 'string' ? text.includes(from) : from.test(text);
  if (!hit) fail(`testo non trovato (${label})`);
  return text.replace(from, to);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const f of FILES) {
  const src = join(SRC, f);
  if (!existsSync(src)) fail(`file mancante: docs/${f}`);
  cpSync(src, join(OUT, f), { recursive: true });
}
cpSync(join(ROOT, 'native', 'native.js'), join(OUT, 'native.js'));

/* ---------- index.html ---------- */
let html = readFileSync(join(OUT, 'index.html'), 'utf8');

html = replace(html, /\s*<!-- Google tag \(gtag\.js\)[\s\S]*?<!-- Microsoft Clarity[\s\S]*?<\/script>/, '\n', 'analytics');
html = replace(html, /<script>\s*if \('serviceWorker' in navigator\)[\s\S]*?<\/script>/, '', 'service worker');
html = replace(html, /<link rel="manifest"[^>]*>\s*/, '', 'manifest');
html = replace(html, 'Doppio click e parti!!!', 'Doppio tocco e parti!!!', 'nota iniziale');
html = replace(html, 'una PWA di pezzaliAPP.com', 'un’app di pezzaliAPP.com', 'piè di pagina');
html = replace(html, 'minimum-scale=1.0" />', 'minimum-scale=1.0,viewport-fit=cover" />', 'viewport');
/* Nell'app la pagina parte sotto la barra di stato (StatusBar.overlaysWebView = false):
   resta da tenere lontani pulsanti e testi in basso dalla barra Home dell'iPhone. */
html = replace(html, '</head>', `  <style>
    .is-native .ui__texts, .is-native .ui__buttons, .is-native .ui__prefs,
    .is-native .ui__theme, .is-native .ui__stats { bottom: env(safe-area-inset-bottom); }
  </style>
</head>`, 'stile nativo');
html = replace(html, '<script src="three.js"></script>', '<script src="native.js"></script>\n  <script src="three.js"></script>', 'native.js');
writeFileSync(join(OUT, 'index.html'), html);

/* ---------- cube.js: rimuove una patch finale che non viene mai eseguita ----------
 * Dopo il motore compresso c'è un'aggiunta ("sottotitolo UNA PWA DI PEZZALIAPP.COM")
 * che fa riferimento a una classe interna non visibile da fuori: all'avvio
 * genera "ReferenceError: S is not defined" e non ha alcun effetto. */
let cube = readFileSync(join(OUT, 'cube.js'), 'utf8');
const marker = '\n// --- Modifica per sottotitolo';
if (cube.includes(marker)) cube = cube.slice(0, cube.indexOf(marker)) + '\n';
writeFileSync(join(OUT, 'cube.js'), cube);

/* ---------- Verifiche finali ---------- */
const problems = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    if (!/\.(html|css|js|json|txt|webmanifest)$/.test(name)) continue;
    const text = readFileSync(full, 'utf8');
    const rel = full.slice(OUT.length + 1);
    if (/rubik/i.test(text)) problems.push(`${rel}: contiene "Rubik"`);
    if (/googletagmanager|clarity\.ms|gtag\(/i.test(text)) problems.push(`${rel}: contiene analytics`);
    if (rel.endsWith('.html') && /<(?:script|link)[^>]+(?:src|href)="https?:\/\//i.test(text)) problems.push(`${rel}: carica risorse remote`);
  }
})(OUT);
if (problems.length) fail(`verifiche non superate:\n  ${problems.join('\n  ')}`);

console.log('✓ www/ pronta per l’app iOS');
