# ILCUBO — pacchetto pulito v0.1.3

Cubo di Rubik 3D giocabile direttamente dal browser, con personalizzazione completa delle facce (colori, numeri, lettere, testi, emoji, immagini), modalità Memo, pattern famosi e altre funzionalità interattive.

- **Autore:** Alessandro Pezzali — [pezzaliAPP.com](https://www.pezzaliapp.com/)
- **Stack:** JavaScript vanilla + Three.js + PWA (manifest, service worker, cache offline)
- **Versione:** 0.1.3
- **Licenza:** proprietaria — [docs/LICENSE](./docs/LICENSE)
- **Componenti di terze parti:** [THIRD-PARTY.txt](./THIRD-PARTY.txt)

> **Proprietà intellettuale**
>
> ILCUBO è un progetto sviluppato da Alessandro Pezzali.
>
> Le componenti di terze parti, tra cui *The Cube* di Boris Šehovac e Three.js, mantengono le rispettive licenze MIT e i relativi diritti d'autore.
>
> La licenza proprietaria **All Rights Reserved** si applica esclusivamente al codice originale ILCUBO, inclusi i moduli di personalizzazione, le sfide, le opzioni e le relative interfacce.
>
> Nessuna disposizione della licenza proprietaria limita i diritti concessi dalle licenze open source delle componenti di terze parti.

## Come è organizzato il repository

```text
ILCUBO/
├── docs/                 → App pubblica e documentazione
│   ├── icons/            → Icone applicazione
│   ├── LICENSE           → Licenza proprietaria
│   ├── THIRD-PARTY.txt   → Licenze e attribuzioni
│   ├── cube.js           → Motore del cubo
│   ├── ilcubo.bundle.min.js
│   ├── index.html
│   ├── manifest.webmanifest
│   ├── service-worker.js
│   ├── styles.css
│   └── three.js
├── source/               → Codice sorgente leggibile
├── .gitignore
├── CHANGELOG.md
├── README.md
├── THIRD-PARTY.txt
└── package.json
```

> ⚠️ **Importante — protezione del codice sorgente**
>
> La cartella `source/` contiene codice leggibile utilizzato per modificare e ricostruire ILCUBO.
>
> Attualmente questa cartella è presente nel repository GitHub pubblico. L'offuscamento del bundle distribuito non protegge quindi il codice sorgente pubblicato.
>
> Per una maggiore tutela, è consigliabile conservare il codice originale in un repository privato e mantenere nel repository pubblico soltanto i file necessari alla distribuzione, la documentazione e le attribuzioni obbligatorie.
>
> La semplice eliminazione della cartella dal ramo principale non cancella automaticamente le versioni precedenti dalla cronologia Git.

## Pubblicare l'app

L'applicazione pubblica è contenuta nella cartella `docs/`, configurata per la distribuzione tramite GitHub Pages.

Per eseguire una prova in locale:

```bash
cd docs
python3 -m http.server 8000
```

Aprire nel browser:

`http://localhost:8000`

L'applicazione può essere pubblicata anche su un hosting statico compatibile, mantenendo i percorsi necessari al funzionamento della PWA.

## Modificare il codice e ricostruire il bundle

Le principali funzionalità personalizzate dell'applicazione sono sviluppate nei moduli:

- `source/customize.js` — personalizzazione delle facce.
- `source/gamemodes.js` — modalità di gioco e sfide.
- `source/qol.js` — funzionalità aggiuntive e miglioramenti dell'esperienza utente.

Dopo ogni modifica, rigenerare il bundle:

```bash
cd source
bash build.sh
```

Lo script ricostruisce il bundle JavaScript minificato e offuscato e ne verifica la validità.

**Nota:** verificare che il percorso di destinazione configurato nello script corrisponda alla cartella pubblica `docs/`.

Per ulteriori informazioni consultare [source/README.md](./source/README.md).

## Protezione e attribuzione

ILCUBO è una Progressive Web App. Il codice JavaScript viene eseguito nel browser e non può essere reso completamente inaccessibile.

Le misure di protezione previste dal progetto comprendono:

- **Bundle minificato e offuscato:** rende meno immediata la lettura del codice distribuito.
- **Rimozione della precedente cartella `baseline/`:** evita di mantenere una copia di riferimento aggiuntiva nel pacchetto corrente.
- **Avviso di copyright a runtime:** identificazione del progetto nella console.
- **Firma identificativa canary:** stringa `ILCUBO-SIG:…` per facilitare l'individuazione di eventuali copie.
- **Watermark:** dicitura `ILCUBO — pezzaliAPP.com` nelle esportazioni PNG.
- **Controllo del dominio:** rilevamento di eventuali esecuzioni su domini non autorizzati.
- **Beacon opzionale:** segnalazione verso un endpoint configurato dal titolare.
- **Licenza proprietaria:** tutela delle componenti originali sviluppate per ILCUBO.
- **Attribuzione open source:** conservazione dei diritti e delle licenze dei componenti di terze parti.

Queste misure non garantiscono l'impossibilità di copiare o analizzare il software.

## Configurare il beacon di rilevamento (opzionale)

Aprire il file `source/_prelude.js`, nella sezione `CONFIGURAZIONE LICENZA`.

Parametri principali:

- `allowedHosts`: elenco dei domini autorizzati, oltre a `localhost`.
- `beaconUrl`: indirizzo dell'endpoint di proprietà del titolare.

Quando configurato, il beacon può trasmettere informazioni quali dominio, percorso, referrer e timestamp in caso di esecuzione su un dominio non autorizzato.

Per disattivarlo, lasciare:

```javascript
beaconUrl: ''
```

Dopo le modifiche, rigenerare il bundle mediante lo script di build.

> Il controllo del dominio non blocca intenzionalmente l'applicazione. La funzione è pensata per individuare eventuali utilizzi non autorizzati, riducendo il rischio di compromettere installazioni legittime.
>
> Qualora il beacon venga attivato, occorre valutare anche gli obblighi di informativa e protezione dei dati applicabili.

## Licenze e diritti d'autore

### Codice originale ILCUBO

Copyright © 2016–2026 Alessandro Pezzali.

Tutti i diritti riservati.

Il codice originale, le funzionalità personalizzate e le interfacce specificamente sviluppate per ILCUBO sono disciplinati dalla licenza proprietaria disponibile in:

[docs/LICENSE](./docs/LICENSE)

### Componenti open source

**The Cube — Boris Šehovac**

- Progetto originale: [github.com/bsehovac/the-cube](https://github.com/bsehovac/the-cube)
- Licenza: MIT

**Three.js**

- Sito ufficiale: [threejs.org](https://threejs.org/)
- Repository: [github.com/mrdoob/three.js](https://github.com/mrdoob/three.js)
- Licenza: MIT

Le condizioni e gli avvisi di copyright relativi alle componenti di terze parti sono documentati in:

[THIRD-PARTY.txt](./THIRD-PARTY.txt)

Le licenze originali devono essere rispettate anche nelle copie distribuite dell'applicazione.

### Verifica delle dipendenze

È opportuno completare la verifica della provenienza e della licenza del motore `cube.js`, indicato nella documentazione come derivato da KubeApp o da un precedente progetto open source.

Eventuali ulteriori obblighi di attribuzione devono essere conservati.

## Tutela del progetto

Per documentare la paternità e l'evoluzione del software è consigliabile conservare:

- Cronologia dei commit Git.
- Copie datate delle versioni rilasciate.
- Documentazione tecnica e progettuale.
- Eventuali prove di data certa o depositi del software.
- Elenco delle dipendenze e delle rispettive licenze.

I commit Git costituiscono elementi documentali utili, ma non garantiscono da soli una data certa legalmente opponibile.

## Versioni

**Versione corrente: 0.1.3**

La numerazione della versione deve rimanere coerente tra:

- `package.json`
- `window.gameVersion` in `index.html`
- `CACHE_VERSION` in `service-worker.js`

Per la cronologia delle modifiche consultare:

[CHANGELOG.md](./CHANGELOG.md)

---

**ILCUBO — Alessandro Pezzali**

[www.pezzaliapp.com](https://www.pezzaliapp.com/)

© 2016–2026 Alessandro Pezzali — Tutti i diritti riservati.

Le componenti open source di terze parti mantengono le rispettive licenze e attribuzioni.
