# Pubblicare ILCUBO sull'App Store

La cartella `ios/` contiene l'app nativa per iPhone e iPad (Capacitor 8). Il gioco gira tutto
dentro l'app, offline. Il sito in `docs/` non cambia: la copia per l'app viene preparata da
`npm run ios:sync` nella cartella `www/` (generata, non va su GitHub).

## Differenze fra il sito e l'app

| | Sito (`docs/`) | App iOS (`www/`) |
| --- | --- | --- |
| Google Analytics, Microsoft Clarity | presenti | **rimossi**: l'app non raccoglie dati |
| Service worker | presente | non serve: i file sono nell'app |
| "Doppio click e parti" | sì | "Doppio tocco e parti" |
| Esporta JSON / immagine | download del browser | foglio di condivisione iOS (File, AirDrop, Mail, Foto…) |
| Copia link | indirizzo della pagina | indirizzo del sito `www.alessandropezzali.it/ILCUBO/` |

"Rubik" è un marchio registrato e Apple respinge le app che lo usano: è stato tolto ovunque
(sito, app, documentazione) e `scripts/build-www.mjs` si ferma se ricompare nella copia per l'app.

Le sostituzioni sono in `scripts/build-www.mjs` e vengono verificate: se un testo del sito cambia
e non viene più trovato, lo script si ferma con un messaggio invece di produrre un'app sbagliata.

## Sul Mac

```bash
npm install
npm run ios:sync      # prepara www/ e la copia dentro l'app iOS
npm run ios:open      # apre Xcode
```

In Xcode → target **App** → **Signing & Capabilities**: *Automatically manage signing*, Team
**Alessandro Pezzali**. Bundle ID: `com.alessandropezzali.ILCUBO`. Versione **1.0.0**, build **1**.

Prova sul simulatore: tocca due volte per mischiare, ruota il cubo, Personalizza → metti un'immagine
su una faccia (chiede il permesso per le Foto), Esporta JSON (si apre la condivisione), Opzioni →
istantanea PNG.

Invio: scegli **Any iOS Device (arm64)** → **Product → Archive** → **Distribute App → App Store Connect**.

## App Store Connect: creare l'app

**App → + → Nuova app**

- Piattaforma: iOS
- Nome: **ILCUBO** (se risulta già usato: `ILCUBO – Cubo 3D`)
- Lingua principale: Italiano
- ID pacchetto: `com.alessandropezzali.ILCUBO` (compare dopo il primo upload da Xcode, oppure
  registralo in developer.apple.com → Identifiers)
- SKU: `com.alessandropezzali.ILCUBO`
- Accesso utente: Accesso completo

### Testi

**Sottotitolo (max 30):** Il cubo 3D da personalizzare

**Categoria:** Giochi → Rompicapo (secondaria: Giochi → Da tavolo)

**Parole chiave (max 100):** cubo,cubo magico,rompicapo,puzzle,3d,speedcube,logica,timer,sfida,personalizza

> Non usare mai la parola "Rubik" nel nome, nel sottotitolo, nelle parole chiave, nella descrizione
> o negli screenshot.

**Testo promozionale:**
Ruota, mischia e risolvi il cubo 3D. Metti numeri, lettere, emoji o le tue foto sulle facce.

**Descrizione:**

> ILCUBO è il classico rompicapo del cubo in 3D, fluido e senza pubblicità.
>
> GIOCA
> Tocca due volte per mischiare e parti: ruota gli strati con il dito, gira il cubo per guardarlo da ogni lato.
> Cubi 2×2, 3×3, 4×4 e 5×5, con timer e statistiche: miglior tempo, peggior tempo, medie su 5, 12 e 25 soluzioni.
>
> PERSONALIZZA
> Ogni faccia può avere colori, numeri, lettere, testi, emoji o una tua foto. Crea il cubo con i nomi della
> famiglia, con le emoji preferite o con le immagini della tua squadra. C'è anche una modalità per daltonici
> con simboli su ogni faccia.
>
> SFIDE E OPZIONI
> Modalità Memo: memorizza il cubo per qualche secondo, poi ricostruiscilo a memoria.
> Pattern famosi da ricreare passo passo, schemi di colore e rotazioni personalizzabili.
> Salva l'immagine del tuo cubo e condividila, oppure esporta la configurazione per riutilizzarla.
>
> IMPARA
> Una guida per principianti spiega la notazione e il metodo a strati, passo dopo passo.
>
> PRIVACY
> Nessun account, nessuna pubblicità, nessun tracciamento. Tutto resta sul tuo dispositivo.

**URL assistenza:** `https://www.pezzaliapp.com`
**URL privacy:** `https://www.alessandropezzali.it/ILCUBO/privacy.html` (in `docs/privacy.html`, online dopo il push)
**Copyright:** 2026 Alessandro Pezzali

### Screenshot (`store/screenshots/`)

| File | Sezione |
| --- | --- |
| `iphone-6.3-1-home.png`, `-2-partita.png`, `-3-personalizza.png` | iPhone (display medio, 1206 × 2622) |
| `ipad-13-1-home.png`, `-2-partita.png`, `-3-personalizza.png` | iPad 13" (2064 × 2752) |

Metti come primo lo screenshot `3-personalizza` (numeri, emoji e lettere sulle facce): è ciò che
distingue ILCUBO dagli altri cubi.

### Privacy dell'app
**"No, non raccogliamo dati da questa app".** Nella versione iOS analytics e Clarity sono rimossi.

### Classificazione per età
Tutto **NO / Nessuno** → **4+**. Categoria: **Non applicabile** (non "Per bambini").

### Note per la revisione

> Gioco del cubo 3D completamente offline (motore WebGL incluso nell'app). Nessun login, nessuna
> pubblicità, nessun dato raccolto. Fotocamera e Foto vengono usate solo se l'utente sceglie di
> applicare una propria immagine a una faccia del cubo (Personalizza → Modo: Immagine).

### Prezzo e vendita

Le licenze di terze parti (MIT e SIL OFL 1.1) consentono la vendita: vedi la sezione
"Verifica delle dipendenze" nel README e `THIRD-PARTY.txt`, che è incluso anche nell'app.

Per vendere a pagamento servono prima, in App Store Connect:

1. **Contratti** → accettare il contratto **App a pagamento** (Paid Apps Agreement);
2. **Dati bancari** e **dati fiscali** compilati;
3. **Stato di operatore commerciale (DSA)**: per vendere nell'Unione Europea bisogna dichiararsi
   operatore commerciale; indirizzo, telefono ed email diventano visibili sulla pagina dell'app
   nell'UE;
4. poi, in **Prezzi e disponibilità**, il prezzo scelto.

Gli incassi sono redditi: conviene chiedere al commercialista come dichiararli.

## Licenze di terze parti
Il motore deriva da "the-cube" di Boris Šehovac (MIT) e usa Three.js (MIT): le note di licenza
sono in `THIRD-PARTY.txt` e vengono incluse nell'app.
