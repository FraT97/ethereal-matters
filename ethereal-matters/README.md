# Ethereal Matters — sito MERN

Sito per Ethereal Matters, installazioni luminose per eventi (laghi, parchi, boschi).
Stack: **MongoDB + Express + React (Vite) + Node**.

```
ethereal-matters/
├─ server/            API Express + Mongoose
│  ├─ models/         Project (lavori), Message (richieste dal form)
│  ├─ routes/         /api/projects, /api/contact
│  ├─ seed.js         progetti di esempio → sostituirli con quelli veri
│  └─ index.js        avvia l'API e, in produzione, serve client/dist
└─ client/            React
   └─ src/
      ├─ components/  FeaturedSlider, WorksExplorer (tab, filtri, griglia/lista),
      │               Showreel, LightField (luci animate), Scene (immagine generata), Layout
      ├─ pages/       Home, Works, Project, Services, About, Contact
      ├─ lib/labels.js  nomi delle categorie/luoghi + URL dello showreel
      └─ styles.css   palette e tipografia (variabili in :root)
```

## Avvio in locale

Serve Node 18+ e un MongoDB (locale o un cluster gratuito su MongoDB Atlas).

```bash
npm install            # installa concurrently
npm run install:all    # dipendenze di server e client
cp server/.env.example server/.env   # inserisci MONGODB_URI
npm run seed           # carica i progetti di esempio
npm run dev            # API su :5000, sito su http://localhost:5173
```

## Produzione

```bash
npm run build   # crea client/dist
npm start       # Express serve API + sito sulla stessa porta
```

Funziona così com'è su Render, Railway o un VPS (imposta `MONGODB_URI`, `ADMIN_KEY`).
Se il frontend va su un host separato (es. Vercel), imposta `VITE_API_URL` con l'URL dell'API.

## API

| Metodo | Percorso | Note |
|---|---|---|
| GET | `/api/projects?category=festival&setting=lake,park&technique=Lasers&year=2025&region=Italy&page=1&limit=9` | lista paginata `{items,total,page,pages}` |
| GET | `/api/projects/meta` | valori disponibili per i filtri (tecniche, anni, regioni) |
| GET | `/api/projects/:slug` | dettaglio + `next` |
| POST | `/api/contact` | salva una richiesta (rate limit 5/15 min, honeypot anti-spam) |
| GET | `/api/contact` | legge le richieste, header `x-admin-key: <ADMIN_KEY>` |

## Contenuti da sostituire

- **Progetti**: in `server/seed.js` (titolo, luogo, anno, testo, tecniche). I testi attuali sono esempi.
- **Foto**: aggiungi URL nel campo `images` di un progetto. Senza foto il sito disegna una scena luminosa
  basata sul luogo (`lake`, `forest`, `park`, `urban`, `indoor`) e sulla tinta (`cyan`, `green`, `mixed`).
- **Email / social**: in `client/src/components/Layout.jsx` e `pages/Contact.jsx`.
- **Showreel**: metti l'URL del video (mp4 o embed Vimeo/YouTube) in `client/src/lib/labels.js`.
- **Categorie** (tab in home): `festival`, `party`, `private`, `public` — modificabili nel modello e in `labels.js`.
- `client/src/lib/fallback.js` è una copia dei progetti usata solo se l'API non risponde (anteprima statica).

## Design

- Palette: `--night #03191C`, `--deep #072A2E`, `--cyan #4FE3DA`, `--moss #7EE08A`, `--mist #D7EEE9`.
- Font: Archivo (versione larga per i titoli).
- Struttura ispirata a silasveta.com: slider a tutto schermo dei lavori in evidenza, home centrata sui
  lavori con tab per tipo di evento, pannello filtri, vista griglia/lista e "Show more".
- Le luci animate seguono il puntatore; con "riduci movimento" attivo lo slider non scorre da solo.

## Header

- Lampadina = tema chiaro/scuro (`ThemeToggle.jsx`, scelta salvata nel browser; `public/theme-init.js` la applica prima del caricamento).
- Burger a tre tubi LED e menu a tutto schermo sul telefono; l'header si nasconde scorrendo in giù.

## Lumo, il personaggio

`client/src/components/Wisp.jsx` — uno spirito di luce (fuoco fatuo) originale:
- **Desktop:** segue il cursore con un leggero ritardo, gli occhi guardano il puntatore, diventa verde e sorride
  sopra link e bottoni, fa scintille al click, si addormenta (zZ) dopo 9 secondi di inattività.
- **Telefono:** (`ScrollWisp.jsx`) scorre su una sottile linea di luce sul bordo destro e fa da barra di scorrimento:
  guarda dove scorri, si emoziona se vai veloce, si addormenta se ti fermi, saluta in fondo alla pagina;
  toccandolo torni in cima (frasi in `LINES`). Per toglierlo basta rimuovere `<Wisp />` da `Layout.jsx`.

## Showreel

`client/src/components/Showreel.jsx` — si apre da "Showreel" nel menu o da "Play showreel" nello slider
(da codice: `openShowreel(event)`).
- Si apre con un'iride di buio che parte dal bottone cliccato, poi conto alla rovescia 3-2-1.
- Lumo cavalca la barra di avanzamento, si stupisce a ogni taglio, aspetta se metti in pausa,
  e alla fine chiede "Again?". "Lights on" chiude con l'iride al contrario.
- **Senza video** (`SHOWREEL_URL` vuoto) suona un trailer generato dai lavori in evidenza.
- **Con un .mp4/.webm** usa gli stessi controlli personalizzati; con un embed Vimeo/YouTube Lumo resta a guardare.
- Tasti: spazio = play/pausa, ← → = taglio precedente/successivo, Esc = chiudi.
