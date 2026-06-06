# ILCUBO — pacchetto pulito v0.1.3

Cubo di Rubik 3D giocabile dal browser, con personalizzazione totale delle facce
(colori, numeri, lettere, testi, emoji, immagini), modalità Memo, pattern famosi e altro.

- **Autore**: Alessandro Pezzali — [pezzaliAPP.com](https://www.pezzaliapp.com)
- **Stack**: JavaScript vanilla + Three.js + PWA (manifest, service-worker, cache offline)
- **Licenza**: proprietaria — vedi [`deploy/LICENSE`](./deploy/LICENSE)

> Le componenti di terze parti (the-cube di Boris Šehovac, Three.js) restano
> sotto licenza MIT; vedi [`THIRD-PARTY.txt`](./THIRD-PARTY.txt). La licenza
> proprietaria 'All Rights Reserved' si applica al codice originale ILCUBO
> (moduli di personalizzazione, sfide, opzioni e relativa UI).

## Come è organizzato questo pacchetto

```
ILCUBO/
├── deploy/     →  carica SOLO questa cartella sul web (è l'app pubblica)
└── source/     →  TIENI PRIVATA: codice leggibile per modificare e ricostruire
```

> ⚠️ **Importante per la protezione anti-copia**: pubblica online **solo** `deploy/`.
> Quella cartella contiene i moduli applicativi **offuscati** in `ilcubo.bundle.min.js`.
> La cartella `source/` contiene il codice in chiaro: se la pubblichi, vanifichi
> l'offuscamento. Tienila nel tuo computer / in un repo privato.

## Pubblicare l'app

Copia il **contenuto** di `deploy/` nella cartella del tuo hosting (root del sito o
sottocartella `ILCUBO/`). Per provare in locale:

```bash
cd deploy
python3 -m http.server 8000
# apri http://localhost:8000
```

## Modificare il codice e ricostruire il bundle

Le funzioni dell'app vivono in `source/customize.js`, `source/gamemodes.js`,
`source/qol.js` (codice leggibile). Dopo ogni modifica, rigenera il bundle:

```bash
cd source
bash build.sh
```

Lo script ricrea `deploy/ilcubo.bundle.min.js` (minificato + offuscato) e ne verifica
la validità. Vedi [`source/README.md`](./source/README.md) per i dettagli.

## Protezione e attribuzione (cosa è già attivo)

Essendo una PWA, il codice gira nel browser e **non è tecnicamente blindabile**:
l'obiettivo è rendere la copia scomoda, attribuibile e perseguibile. In questo
pacchetto trovi:

- **Bundle offuscato** dei moduli applicativi (anti copia-incolla facile).
- **Niente copia di riferimento pubblica** (la vecchia cartella `baseline/` è stata rimossa).
- **Avviso di copyright a runtime** in console + **stringa-firma "canary"**
  (`ILCUBO-SIG:…`) per ritrovare cloni con una ricerca o un Google Alert.
- **Watermark** `ILCUBO — pezzaliAPP.com` sull'export PNG.
- **Rilevamento dominio non autorizzato** con **beacon opzionale**.
- **Licenza** "All Rights Reserved" + note di copyright in ogni file core.

### Configurare il beacon di rilevamento (opzionale)

Apri `source/_prelude.js`, sezione `CONFIGURAZIONE LICENZA`:

- `allowedHosts`: i tuoi domini di produzione (oltre a `localhost`).
- `beaconUrl`: il **tuo** endpoint. Se valorizzato, quando l'app gira su un dominio
  non autorizzato invia una segnalazione (host, path, referrer, timestamp). Lascialo
  `''` per disattivarlo.

Poi rigenera il bundle con `bash source/build.sh`.

> Il controllo dominio **non blocca** l'app di proposito: un blocco rigido è
> facilmente aggirabile e rischia di rompere usi legittimi (es. un nuovo tuo
> dominio). Il valore sta nel *sapere* dove gira, non nell'impedirlo.

### Tutela legale consigliata

Per rendere la licenza azionabile, conserva una **prova di data certa** della
paternità (commit Git firmati, PEC a te stesso, o deposito software). Verifica
inoltre la licenza dell'engine `cube.js` (deriva dal progetto KubeApp/da un cubo
open-source preesistente) e rispettane eventuali obblighi di attribuzione: la
coerenza della catena di licenze rafforza le tue rivendicazioni.

## Versioni

Allineate a **0.1.3**: `package.json`, `window.gameVersion` (in `index.html`),
`CACHE_VERSION` (in `service-worker.js`). Vedi [`CHANGELOG.md`](./CHANGELOG.md).

---

© 2016–2026 Alessandro Pezzali — Tutti i diritti riservati.
