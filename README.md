# Nasty Little Universe — versione 2

Un piccolo universo viola da attraversare, con un ratto rosa e quattro gigli da recuperare. Il gioco unisce platform, quiz e un finale interattivo con bouquet e **«Ti Globo»**.

## Che cosa contiene

- **Quattro capitoli:** giardino notturno, Kyoto/Vice city, deserto e spazio.
- **16 nuovi quiz di cultura generale**, più brevi e accessibili, basati su curiosità concrete; con indizi, spiegazioni di una frase, fonti e possibilità di riprovare. Non occorre conoscere i riferimenti estetici per rispondere.
- Personaggi, nemici e gigli ridisegnati; interfaccia più leggibile e decorazioni separate dal percorso.
- Quattro meccaniche: **ponti di foglie** nel giardino, **vinili a molla** a Kyoto, **traghetti di pietra** nel deserto, **spinta del doppio salto e piattaforme orbitali** nello spazio. I comandi restano sinistra, destra e salto.
- Una **breve scena animata alla fine di ogni capitolo**, rivedibile e senza attese obbligatorie.
- Checkpoint, oggetti da raccogliere e **sette immagini** nella collezione.
- Cinque tracce complete, convertite dagli audio originali a MP3. **No peace** accompagna il percorso spaziale: dura circa **3 minuti e 41 secondi** e conserva il beat switch.
- Modalità più facile selezionabile nelle impostazioni. Nessun conto alla rovescia obbliga a rispondere in fretta.

È un sito statico: **nessun backend, compilazione, npm o servizio esterno necessario per giocare**. Foto, musica e codice sono inclusi.

## Pubblicarlo su GitHub Pages

1. Estrai lo ZIP. Nella cartella del progetto trovi `index.html`, `config.js`, `style.css`, le cartelle `js/`, `assets/`, `docs/` e il file `.nojekyll`.
2. Carica **il contenuto della cartella**, non lo ZIP, nel repository scelto. `index.html` deve essere alla radice della sorgente pubblicata. Mantieni nomi e struttura delle cartelle, incluso `.nojekyll`.
3. Nel repository apri **Settings → Pages**.
4. In **Build and deployment → Source**, scegli **Deploy from a branch**.
5. Seleziona il ramo **main**, la cartella **/(root)** e premi **Save**.
6. Attendi il completamento della pubblicazione e apri il link indicato da GitHub. Condividi quel link con lei.

I percorsi degli asset sono relativi: il gioco funziona sia alla radice di un sito `github.io`, sia nel percorso di un normale repository. Se esiste già un sito alla radice, evita di sovrascriverlo: usa un repository separato o una sottocartella dedicata.

Procedura verificata sulla [documentazione ufficiale di GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), consultata il 21 ottobre 2026. GitHub Pages rende pubblicamente raggiungibili anche i file inclusi nel sito.

## Aggiornare la prima versione

Sostituisci i file del sito con quelli di questo pacchetto, incluse le cartelle `js/` e `assets/`. Se avevi inserito nomi o una dedica in `config.js`, conserva le tue personalizzazioni. Sono stati aggiunti `js/art.js` e `js/scenes.js`: devono essere caricati insieme agli altri file. Non è richiesto alcun comando di compilazione.

Al primo accesso, il gioco conserva i **capitoli completati, le figurine, i gigli e le preferenze** della prima versione sullo stesso browser e sullo stesso indirizzo. I vecchi checkpoint intermedi vengono rimossi perché i percorsi sono cambiati; le vecchie risposte non valgono per le nuove domande. Ogni capitolo già completato può essere rigiocato dalla mappa. Il pulsante principale, quando hai finito tutto, riparte dal giardino.

## Provarlo prima di pubblicare

Apri un terminale **nella cartella che contiene `index.html`** ed esegui:

```bash
python -m http.server 8000
```

Su Windows puoi usare:

```powershell
py -m http.server 8000
```

Visita [http://localhost:8000](http://localhost:8000). Per fermare il server premi **Ctrl+C**. Il doppio clic su `index.html` permette una prova di base; HTTP è preferibile perché riproduce meglio il comportamento del sito pubblicato e del salvataggio locale.

## Comandi, musica e salvataggi

**Telefono:** usa i pulsanti sinistra/destra e salto. Tocca salto di nuovo mentre sei in aria per il doppio salto.

**Computer:** frecce oppure **A/D** per muoverti; **Spazio**, **W** o **freccia su** per saltare; **Esc** per la pausa.

La musica parte dopo un tocco esplicito. Se non si sente, usa il pulsante audio per riattivarla e controlla volume e modalità silenziosa del telefono. Quando il gioco passa in secondo piano, partita e musica vengono messe in pausa.

I progressi sono salvati nel `localStorage` del browser. Restano sullo stesso dispositivo e browser: non si sincronizzano tra telefoni, browser o indirizzi diversi. Cancellare i dati del sito può eliminarli. Il ripristino nelle impostazioni richiede conferma.

## Personalizzazioni

Apri `config.js` con un editor di testo. Puoi modificare `recipientName`, `authorName`, `finalMessage` e `finalSignature`; il gioco è già utilizzabile con i valori presenti. Conserva virgolette, virgole e sintassi JavaScript.

Le fonti dei quiz sono in [docs/QUIZ-FONTI.md](docs/QUIZ-FONTI.md); mappatura e dettagli degli allegati in [docs/ASSET.md](docs/ASSET.md).

Prima di inviare il link, esegui il breve [controllo sul telefono destinatario](docs/TEST-CHECKLIST.md).
