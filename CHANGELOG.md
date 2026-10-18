# Changelog

Tutte le modifiche rilevanti a ILCUBO sono documentate in questo file.
Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/);
versioning [SemVer](https://semver.org/lang/it/).

## [0.1.6] — 2026-10-18

### Aggiunto
- **App iOS per l'App Store** (`ios/`, Capacitor 8): il gioco gira interamente nell'app, offline.
  La copia per l'app (`www/`, generata da `npm run ios:sync`) esclude analytics e service worker,
  salva ed esporta i file tramite il foglio di condivisione di iOS e usa link verso il sito.
  Guida, testi e screenshot in `PUBBLICAZIONE-IOS.md` e `store/screenshots/`.
- `docs/privacy.html`: informativa privacy dell'app iOS.

### Cambiato
- Tolto il marchio registrato "Rubik" da sito, manifest e documentazione ("cubo magico").
- Schema colori "Erno" rinominato "Vivace".
- `source/build.sh` scrive il bundle in `docs/` (prima in `deploy/`, cartella non più esistente).
- Versioni allineate a **0.1.6** (`package.json`, `window.gameVersion`, `CACHE_VERSION`, README).

- **Licenze e attribuzioni verificate e completate** (`THIRD-PARTY.txt`, `docs/LICENSE`, README):
  aggiunti RoundedBoxGeometry (Dusan Bosnjak, MIT) e il carattere Bungee (SIL OFL 1.1, testo
  integrale), precisata l'origine MIT di "The Cube" (Pen pubblica su CodePen).
- Sezione **Crediti** nella guida dell'app.
- Icone del sito provenienti dal repository "the-cube" sostituite con icone originali ILCUBO;
  `browserconfig.xml` corretto (percorso e colore).

### Corretto
- `cube.js`: rimossa una patch finale mai eseguita che all'avvio generava
  `ReferenceError: S is not defined`.

## [0.1.3] — 2026-06-06

### Aggiunto
- **Bundle applicativo protetto** (`ilcubo.bundle.min.js`): `customize.js`,
  `gamemodes.js` e `qol.js` sono ora concatenati, minificati e **offuscati**
  in un unico file. Sorgenti leggibili spostati in `source/` (da tenere privati);
  ricostruzione via `source/build.sh`.
- **Prelude di protezione** (`source/_prelude.js`): avviso di copyright a runtime
  in console, stringa-firma "canary" (`ILCUBO-SIG:…`), rilevamento dominio non
  autorizzato e **beacon opzionale** (configurabile, disattivato di default).

### Cambiato
- **Struttura repo** separata in `deploy/` (pubblicabile) e `source/` (privata).
- `index.html` carica il bundle unico al posto dei tre moduli separati.
- `service-worker.js`: `CACHE_VERSION` → `ilcubo-v013`; in cache anche
  `manifest.webmanifest`, `favicon.ico` e `apple-touch-icon.png`.
- `manifest.webmanifest` arricchito: `description`, `scope`, `id`, `lang`,
  `categories` e icona `purpose: "maskable"`.
- Versioni allineate a **0.1.3** (`package.json`, `window.gameVersion`, cache SW).
- `og:url` corretto su `https://www.pezzaliapp.com/ILCUBO/`.
- Anno di copyright uniformato a **2016–2026** nella licenza.

### Rimosso
- `app.js` (prototipo morto, non referenziato, puntava a DOM inesistente).
- `style.css` (placeholder vuoto non referenziato).
- `upup.min.js` / `upup.sw.min.js` (libreria UpUp superata dal service-worker custom).
- `baseline/` (copia di riferimento ~640 KB: regalava una versione pulita ai copioni;
  resta nella cronologia Git).
- `LICENSE.txt` duplicato (mantenuto solo `LICENSE`).
- Cartella di sistema `__MACOSX/` (spazzatura macOS).

## [0.1.2] — 2026-05-14

### Corretto
- **Pulsanti UI ora leggibili** (`customize.js`, `gamemodes.js`, `qol.js`,
  `index.html`): i pulsanti "Personalizza", "Sfide", "Opzioni" e il pulsante
  aiuto "?" erano dimensionati in unita' `rem`. Poiche' `cube.js` imposta
  dinamicamente il `font-size` della pagina in proporzione alla finestra
  (sistema responsive originale di KubeApp), su schermi grandi quei pulsanti
  diventavano minuscoli e illeggibili. Convertiti a unita' fisse `px`
  (altezza 40px, font 15px) e leggermente ingranditi. Aggiornate anche le
  media query per schermi stretti.
- Bump `gameVersion` a `0.1.2` e cache a `ilcubo-v012`.

## [0.1.1] — 2026-05-14

### Corretto
- **Texture delle facce personalizzate ora visibili** (`customize.js`): gli
  sticker generati da `cube.js` (ExtrudeBufferGeometry di una Shape con
  coordinate ~[-1/6, +1/6]) avevano coordinate UV nello spazio-forma e non
  in [0,1]. Le texture custom (numero, lettera, testo, emoji, immagine)
  venivano quindi applicate ma campionate solo in un angolo invisibile,
  facendo sembrare l'app identica alla versione classica. Aggiunta la
  funzione `normalizeStickerUVs()` che clona la geometria dello sticker e
  rimappa l'attributo `uv` su [0,1] in base al bounding box dell'attributo
  `position`. La geometria condivisa non viene alterata (clone + flag
  `__ilcuboUVfixed`).
- Bump `gameVersion` a `0.1.1` e cache service worker a `ilcubo-v011` per
  invalidare la cache PWA e servire subito il codice aggiornato.

## [0.1.0] — 2026-05-13

Prima release ILCUBO, evoluzione di KubeApp.

### Aggiunto
- **Personalizzazione facce** (`customize.js`): per ciascuna delle 6 facce
  e' possibile scegliere il modo Colore, Numero (1..N²), Lettera (A..Z),
  Testo (max N caratteri, orientamento riga/colonna, troncamento+warning),
  Emoji (uno per cubetto), Immagine (suddivisa in N×N tile come texture).
  Persistenza in `localStorage` chiave `ilcubo.faceConfig`. Pulsante
  "Reset facce" per tornare al classico.
- **Condivisione**: esporta/importa configurazione come JSON; URL
  condivisibile `?cfg=<base64url>` (immagini escluse per dimensione);
  pulsante "Copia link" con feedback visivo.
- **Modalita' daltonica**: badge a forma diversa per faccia
  (•/■/▲/▼/◀/▶) per distinguerle anche senza percepire i colori.
- **Pannello Sfide** (`gamemodes.js`): modalita' Memo con countdown
  configurabile e scramble automatico; galleria pattern famosi
  (Checkerboard, Superflip, Cube-in-cube, Cross, Sei punti) con
  algoritmo in notazione standard e pulsante "Copia mosse".
- **Pannello Opzioni** (`qol.js`):
  - Vibrazione su mobile a fine rotazione (toggle).
  - Suoni discreti via WebAudio su move/scramble/solve (toggle, off
    di default).
  - Export PNG della configurazione in vista "srotolata" 4×3 facce.
  - Focus ring visibili per i pulsanti laterali (a11y).

### Cambiato
- Rebrand del progetto: `package.json` ora `"ilcubo"` v0.1.0, titolo
  e meta in `index.html`, `manifest.webmanifest` (`name`/`short_name`),
  `window.gameVersion = '0.1.0'`, `service-worker` con
  `CACHE_VERSION = "ilcubo-v010"`.

### Note
- L'engine del cubo (`cube.js`) e' rimasto intatto: i nuovi moduli si
  agganciano a `window.game` senza modificarlo, hookando
  `cube.updateColors` (per le texture personalizzate) e
  `controls.onMove` (per vibrazione/suoni).
- Tutte le nuove funzioni sono opzionali e ripristinabili al default.
