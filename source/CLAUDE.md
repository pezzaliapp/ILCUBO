# ILCUBO — Istruzioni per Claude Code

## Contesto
ILCUBO e' l'evoluzione di KubeApp (Cubo di Rubik PWA sviluppato da Alessandro Pezzali, 2016-2025).
Stack: JavaScript vanilla + Three.js + PWA (manifest, service-worker, cache offline).
Autore: Alessandro Pezzali — pezzaliAPP.com
Licenza: proprietaria (vedi LICENSE.txt). Non rimuovere le note di copyright.

## Struttura
- `index.html` — entry point
- `cube.js` — logica del cubo (Three.js) — file grande, lavora a sezioni
- `app.js` — bootstrap UI
- `styles.css` — stile principale
- `service-worker.js` + `manifest.webmanifest` — PWA
- `baseline/` — copia immutabile della versione precedente, solo per riferimento, NON modificare

## Regole d'oro
1. Non rompere la versione attuale: ogni nuova feature deve essere opzionale e disattivabile.
2. Mantieni vanilla JS (niente framework tipo React/Vue). Three.js e' ok.
3. Bump della `window.gameVersion` in `index.html` a ogni release per invalidare la cache PWA.
4. Aggiorna il service-worker quando aggiungi/rinomini file.
5. Commit atomici, messaggi in italiano, prefissi: `feat:`, `fix:`, `style:`, `docs:`, `refactor:`.
6. A ogni feature completata: testare offline (PWA), su mobile (375px) e desktop.
7. Nessun tracker nuovo. Mantieni gtag e Clarity esistenti.

## Stile codice
- Funzioni piccole, nomi parlanti in inglese (variabili) ma stringhe UI in italiano.
- Niente dipendenze pesanti: se serve una libreria, valutala con me prima.
- Accessibilita': aria-label, focus visibili, supporto tastiera.

## Roadmap
Vedi `PROMPT.md` per la lista ordinata di feature da implementare.
Procedi in autonomia, ma fermati se incontri:
- Una scelta architetturale che cambia piu' di 3 file core
- Una dipendenza nuova
- Un dubbio sulla semantica di una feature

## Workflow di lavoro
Per ogni feature della roadmap:
1. Leggi PROMPT.md, prendi la prossima feature non spuntata
2. Implementa
3. Test manuale (server locale: `python3 -m http.server 8000`)
4. Commit con messaggio descrittivo
5. Spunta la feature in PROMPT.md
6. Passa alla successiva

## Push finale
Quando hai completato la roadmap (o un blocco logico):
- `git push origin main`
- Tag versione: `git tag -a v0.1.0 -m "ILCUBO prima release" && git push --tags`
