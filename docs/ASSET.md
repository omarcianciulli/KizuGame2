# Foto e colonna sonora

Tutti i file derivano dagli allegati forniti per questo progetto. Non ci sono asset audio caricati da servizi esterni.

## Audio

Le cinque tracce sono incluse per intero, convertite da WAV a MP3 stereo 44,1 kHz con LAME VBR q4. Non sono stati applicati tagli, loop artificiali, variazioni di velocità o normalizzazioni. Il player ripete la traccia completa quando arriva alla fine.

| File | Scena | Durata originale | Dimensione MP3 |
| --- | --- | --- | --- |
| `assets/audio/bam-bam.mp3` | Giardino notturno | 1:27.24 | 1.73 MB |
| `assets/audio/glass-jaw.mp3` | Kyoto / Vice city | 1:56.94 | 2.10 MB |
| `assets/audio/escape-matrix.mp3` | Deserto | 2:00.05 | 2.41 MB |
| `assets/audio/no-peace.mp3` | Orbita viola | 3:40.78 | 4.30 MB |
| `assets/audio/young-money.mp3` | Menu ed epilogo | 2:35.06 | 2.91 MB |

**No peace** conserva tutti i 220,775 secondi originali, incluso il beat switch. Il player non ricarica né ricomincia la traccia se viene selezionata di nuovo senza `restart: true`; i quiz nella stessa scena possono quindi continuare con lo stesso ascolto.

Le differenze di durata riportate da ffprobe fra WAV e MP3 sono inferiori a 42 ms e dipendono dall’incapsulamento e dal padding MP3. Il contenuto non è stato accorciato. Le cinque tracce passano complessivamente da 123,49 MB a 13,45 MB.

### Nomi originali

- **Bam bam**: `_FREE_ goofy type beat + паранойя + dadbackwood + eelijahh + soundcloud type beat - bam bam.wav` → `assets/audio/bam-bam.mp3`.
- **Glass jaw**: `[free] slayr + waera type beat glass jaw.wav` → `assets/audio/glass-jaw.mp3`.
- **Escape matrix**: `free twentythree type beat - escape matrix.wav` → `assets/audio/escape-matrix.mp3`.
- **No peace**: `_free_ (beat switch) slayr + waera type beat - no peace.wav` → `assets/audio/no-peace.mp3`.
- **2010 / R&B / Young Money**: `(free) 2010 + rnb + young money type beat.wav` → `assets/audio/young-money.mp3`.

## Foto

Le sette immagini JPEG sono state copiate senza ricodifica o modifica dei pixel. L’identità dei file è stata controllata con SHA-256.

| Nome incluso | Allegato originale |
| --- | --- |
| `assets/photos/pink-rat.jpg` | WhatsApp Image 2026-10-21 at 14.40.19.jpeg |
| `assets/photos/double-portrait.jpg` | WhatsApp Image 2026-10-21 at 14.40.19 (1).jpeg |
| `assets/photos/sonic-break.jpg` | WhatsApp Image 2026-10-21 at 14.40.19 (2).jpeg |
| `assets/photos/gold-icon.jpg` | WhatsApp Image 2026-10-21 at 14.44.43.jpeg |
| `assets/photos/strange-visitor.jpg` | WhatsApp Image 2026-10-21 at 14.44.44.jpeg |
| `assets/photos/cucumber-duo.jpg` | WhatsApp Image 2026-10-21 at 14.44.44 (1).jpeg |
| `assets/photos/purple-globe.jpg` | WhatsApp Image 2026-10-21 at 14.44.44 (2).jpeg |

Il file `assets/assets-manifest.json` contiene mappatura, dimensioni, hash delle immagini e durate delle tracce.

## API audio

`js/audio.js` espone `window.NastyAudio`, senza dipendenze. Utilizza un unico elemento HTMLAudioElement, ricaricato soltanto al cambio di traccia. Nessun audio parte prima di un gesto esplicito.

```javascript
const music = new NastyAudio({ onChange: state => updateMusicUI(state) });

// Nel gestore del pulsante Inizia:
music.select('bam-bam');
music.unlock();

// All’ingresso nella scena spaziale:
music.select('no-peace', { restart: true });

// Durante un quiz, non occorre cambiare traccia.
// Quando si lascia la scheda:
music.pause();
// Quando si riprende il gioco:
music.resume();
```

Metodi disponibili: `select(id, { restart })`, `unlock()`, `setMuted(bool)`, `setVolume(0..1)`, `pause()`, `resume()`, `getState()`, `getTracks()`, `destroy()`. `select` accetta anche gli indici da 0 a 4 nell’ordine della tabella.

`getState()` restituisce traccia, titolo, stato di riproduzione, mute, volume, posizione, durata ed eventuale errore. In caso di blocco del browser o errore di rete, l’interfaccia può usare `error` e offrire il pulsante musicale per eseguire nuovamente `unlock()` direttamente da un tocco. Non vengono creati elementi audio paralleli.

## Verifiche eseguite

- Tutte le cinque conversioni decodificabili, stereo a 44,1 kHz; durata completa controllata con ffprobe.
- Identità binaria delle sette foto con gli originali.
- Sintassi JavaScript verificata con Node.
- Controllo funzionale del player con media element simulato: assenza di autoplay, avvio su consenso, continuità della stessa traccia, recupero posizione dopo cambio traccia, riavvio esplicito, pausa/ripresa, mute e distruzione.
- La compatibilità effettiva con browser e dispositivi va verificata nel collaudo del gioco; il controllo simulato non equivale a una prova fisica su iPhone.


## Grafica e scene della versione 2

`js/art.js` contiene disegni originali in Canvas: Ratto Rosa, Sir Rattingham, gigli a sei petali, zombie giardiniere, lanterna, scarabeo, meteorite, pianta, tè, mummia e portiere. Sono vettoriali disegnati dal codice, senza font o immagini caricati da servizi esterni.

`js/scenes.js` usa gli stessi disegni per quattro vignette animate: consegna del giglio in giardino, vinile a Kyoto, pausa al tè nel deserto e bouquet orbitale. Le scene possono essere riviste; con le animazioni ridotte mostrano direttamente la composizione finale.

Le cinque tracce MP3 e le sette fotografie della versione precedente sono conservate senza modifiche. No peace resta associata al livello spaziale e alla sua scena di fine capitolo, nella durata completa originale convertita a MP3.
