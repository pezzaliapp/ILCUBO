# source/ — codice sorgente (TENERE PRIVATO)

Questa cartella **non va pubblicata online**: contiene il codice leggibile.
Pubblica solo la cartella `../deploy/`.

## File

- `customize.js` — pannello "Personalizza" (colori/numeri/lettere/testi/emoji/immagini, condivisione JSON/URL, daltonica)
- `gamemodes.js` — pannello "Sfide" (modalità Memo + pattern famosi)
- `qol.js` — pannello "Opzioni" (vibrazione, suoni, export PNG, a11y)
- `_prelude.js` — protezione/attribuzione (copyright console, canary, beacon dominio)
- `build.sh` — genera `../deploy/ilcubo.bundle.min.js`
- documenti legacy: `README.legacy.md`, `readme.html`, `CLAUDE.md`, `PROMPT.md`

## Modificare e ricostruire

1. Modifica i moduli (`customize.js`, `gamemodes.js`, `qol.js`) o `_prelude.js`.
2. Rigenera il bundle:

   ```bash
   bash build.sh
   ```

3. Testa l'app servendo `../deploy/` (`cd ../deploy && python3 -m http.server 8000`).
4. A ogni release, ricordati di bumpare:
   - `window.gameVersion` in `../deploy/index.html`
   - `CACHE_VERSION` in `../deploy/service-worker.js`
   - `version` in `../package.json`

## Note sull'offuscamento

`build.sh` usa `javascript-obfuscator` con impostazioni **conservative**
(`renameGlobals=false`, `renameProperties=false`) per non rompere i riferimenti a
`window.game`, `window.ILCUBO` e `THREE`. Se aggiungi codice che dipende da nomi di
funzione o proprietà esposti pubblicamente, mantieni queste impostazioni.

L'engine `cube.js` e la libreria `three.js` **non** vengono offuscati: il primo è già
minificato, la seconda è una libreria di terze parti.
