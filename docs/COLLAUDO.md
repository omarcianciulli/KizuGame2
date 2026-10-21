# Verifica della versione 2

Data: 21 ottobre 2026.

## Controlli completati

- Sintassi dei moduli JavaScript e presenza di tutti i file referenziati dall’HTML.
- Tutti e quattro i capitoli attraversati fino alla fine, con simulazione degli input sul motore fisico effettivo; entrambi i varchi aperti in ogni mondo, anche nella modalità Passeggiata.
- Verifica mirata delle quattro meccaniche: crescita dei ponti, rimbalzo sui vinili, trasporto del personaggio sui blocchi mobili, spinta spaziale al doppio salto.
- Salvataggio e ripristino dei ponti cresciuti; tutti e quattro i segreti raggiungibili con il doppio salto normale.
- Percorso completo nel browser con i 16 nuovi quiz: risposta errata, indizio, risposta corretta, spiegazione, aperture dei varchi, quattro cutscene e bouquet finale con “Ti Globo”.
- Salvataggio durante un quiz e ricaricamento della pagina: la domanda già risolta viene saltata correttamente.
- Memoria: sette fotografie sbloccate, apertura della foto e ritorno all’album e alla mappa.
- Verifica visiva dell’interfaccia in viewport 360×740, 390×844, 844×390 e 1200×850; in gioco la pagina non supera l’altezza dello schermo nei formati mobile provati.
- Controllo separato delle scene del mondo in verticale e orizzontale: parete dei dischi Nasty, balconata di Sir Rattingham, chiosco, nicchia della mummia, ponti, traghetti e percorso orbitale. Gli oggetti decorativi non occupano il piano di movimento del personaggio.
- Proporzioni dei nuovi disegni preservate nelle cutscene e nel bouquet; cutscene in due colonne nel formato orizzontale basso.
- Confermato nel browser l’avvio di No peace nel capitolo spaziale e di Young Money nel finale. Audio e fotografie rimangono identici al pacchetto precedente.
- Fonti e struttura dei quiz controllate: 16 ID nuovi, quattro risposte per domanda, un’unica risposta corretta e spiegazioni brevi.

## Metodo e limiti

Le prove nel browser usano i veri file dell’applicazione dentro un riquadro di dimensioni responsive. Un controllo interno simula i pulsanti di movimento, usando la normale fisica e le collisioni, per attraversare i percorsi; le risposte ai quiz e i passaggi tra schermate sono eseguiti tramite l’interfaccia. Il controllo interno non è incluso nel pacchetto distribuito.

Il rendering delle scene è stato controllato anche tramite Canvas nativo. Sono stati verificati i comandi e il codice per la gestione di più puntatori, ma non è stata eseguita una prova fisica multitouch su un iPhone o telefono Android. Prima di inviare il link, rimane utile una prova sul telefono destinatario come indicato in TEST-CHECKLIST.md.
