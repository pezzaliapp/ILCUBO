# Changelog

Tutte le modifiche rilevanti a ILCUBO sono documentate in questo file.
Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.1.0/);
versioning [SemVer](https://semver.org/lang/it/).

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
