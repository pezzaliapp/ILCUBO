# ILCUBO

Evoluzione di **KubeApp** (Il Cubo di Rubik PWA): un cubo di Rubik 3D giocabile dal browser, con **personalizzazione totale delle facce** (colori, numeri, lettere, testi, emoji, immagini), modalita' Memo, galleria di pattern famosi e altro.

- **Stato**: v0.1.0 — prima release ILCUBO
- **Autore**: Alessandro Pezzali — [pezzaliAPP.com](https://www.pezzaliapp.com)
- **Stack**: JavaScript vanilla + Three.js + PWA (manifest, service-worker, cache offline)

Storia e versione precedente: vedi [`README.legacy.md`](./README.legacy.md).

## Novita' rispetto a KubeApp

- 🎨 **Personalizza ogni faccia** scegliendo fra: Colore, Numero (1..N²), Lettera (A..Z), Testo (max N caratteri), Emoji (uno per cubetto), Immagine (suddivisa in N×N tile).
- 🔗 **Condividi la configurazione** via export/import JSON o tramite un URL `?cfg=…` (base64). Le immagini si condividono solo via JSON.
- 🧠 **Modalita' Memo**: memorizzi la configurazione per X secondi, il cubo viene mischiato, devi ricostruirlo.
- 🏆 **Pattern famosi**: Checkerboard, Superflip, Cube-in-cube, Cross, Sei punti — con algoritmo in notazione standard pronto da copiare.
- 👁️ **Modalita' daltonica**: badge di forma diversa per faccia (•/■/▲/▼/◀/▶) per distinguere le facce senza percepire i colori.
- 📳 **Vibrazione** (mobile) a fine rotazione, opzionale.
- 🔊 **Suoni discreti** (WebAudio, senza asset) su mossa/scramble/solve, opzionali.
- 🖼️ **Esporta PNG** della configurazione in vista "srotolata" (4×3 facce).
- ♿ **Accessibilita'**: focus visibili, navigazione tastiera.

Le nuove funzioni sono opzionali e disattivabili. Il modo di gioco classico resta identico.

## Sviluppo

```bash
# server locale per testare la PWA
python3 -m http.server 8000
# poi apri http://localhost:8000
```

Per invalidare la cache offline durante lo sviluppo, bumpa la costante `window.gameVersion` in `index.html` e `CACHE_VERSION` in `service-worker.js`.

## Struttura

- `index.html` — entry point + UI guida
- `cube.js` — engine del cubo (Three.js, originale KubeApp)
- `customize.js` — pannello "Personalizza" + condivisione JSON/URL + daltonica
- `gamemodes.js` — pannello "Sfide" (Memo + pattern famosi)
- `qol.js` — pannello "Opzioni" (vibrazione, suoni, export PNG, a11y)
- `service-worker.js` + `manifest.webmanifest` — PWA
- `baseline/` — copia immutabile della versione KubeApp di partenza (solo riferimento)

## Roadmap

Vedi [`PROMPT.md`](./PROMPT.md) (tutte le fasi 0–5 completate per la v0.1.0).
Changelog: [`CHANGELOG.md`](./CHANGELOG.md).

---

© 2016–2026 Alessandro Pezzali — Tutti i diritti riservati.
