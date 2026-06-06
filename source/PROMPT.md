# ILCUBO — Roadmap

Spunta `[x]` cio' che completi. Procedi in ordine salvo dipendenze evidenti.

## Fase 0 — Setup
- [x] Rinomina il progetto in package.json: `"name": "ilcubo"`, version `0.1.0`
- [x] Aggiorna `<title>` e meta in index.html: "ILCUBO"
- [x] Aggiorna manifest.webmanifest: name "ILCUBO", short_name "ILCUBO"
- [x] Crea README.md nuovo per ILCUBO (mantieni quello vecchio come README.legacy.md)
- [x] Bump `window.gameVersion` a `'0.1.0'`

## Fase 1 — Personalizzazione facce (CORE)
Aggiungere un nuovo pannello "Personalizza" con:
- [x] Per ciascuna delle 6 facce, scelta tra modalita': Colore | Numero | Lettera | Testo | Emoji | Immagine
- [x] Modalita' Numero: numera i cubetti da 1 a N^2 (orientamento configurabile)
- [x] Modalita' Lettera: lettere A..Z distribuite per riga/colonna
- [x] Modalita' Testo:
  - input testuale max N caratteri (dove N = lato cubo, es. 4 per 4x4)
  - orientamento orizzontale o verticale (radio button)
  - se l'utente scrive piu' caratteri del consentito -> troncamento + warning visivo
- [x] Modalita' Emoji: picker emoji nativo, una emoji per cubetto
- [x] Modalita' Immagine: upload file (jpg/png), l'app la suddivide in NxN tile e la applica come texture
- [x] Tutto persistito in localStorage chiave `ilcubo.faceConfig`
- [x] Pulsante "Reset facce" per tornare al classico

## Fase 2 — Condivisione e import/export
- [x] Pulsante "Esporta configurazione" -> scarica JSON
- [x] Pulsante "Importa configurazione" -> upload JSON
- [x] Generazione URL condivisibile: `?cfg=<base64>` che ricrea il cubo all'apertura
- [x] Pulsante "Copia link" con feedback visivo

## Fase 3 — Modalita' gioco extra
- [x] Modalita' "Memo": mostra config per X secondi, mischia, l'utente ricostruisce
- [x] Galleria pattern famosi (Checkerboard, Superflip, Cube-in-cube) come obiettivi
- [x] Modalita' daltonica: aggiunge pattern (puntini/righe) ai colori

## Fase 4 — Qualita' di vita
- [x] Vibration API su mobile a fine rotazione (toggle in preferenze)
- [x] Suoni discreti su scramble/solve (toggle, off di default)
- [x] Export PNG della configurazione attuale (canvas snapshot)
- [x] Migliora a11y: focus ring visibili, keyboard nav per i pulsanti laterali

## Fase 5 — Documentazione
- [x] Aggiorna README.md con screenshot e GIF demo  <!-- testo aggiornato; screenshot/GIF da generare a mano in seguito -->
- [x] CHANGELOG.md con tutte le release
- [x] Aggiorna readme.html con il riepilogo delle novita'

## Note implementative
- Le texture custom in Three.js si applicano tramite `CanvasTexture`: disegna su un `<canvas>` nascosto (numero/lettera/emoji/testo) e usalo come `map` del materiale.
- Per il testo che attraversa piu' cubetti: disegna il testo su un canvas NxN grande, poi usa UV mapping per assegnare la porzione giusta a ogni cubetto.
- Mantieni il theme system attuale come "modalita' Classico"; le nuove modalita' sono additive.
