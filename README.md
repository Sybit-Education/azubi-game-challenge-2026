# 🌊 Azubi Game Challenge 2026: "Deep Sea Echoes"

Willkommen zur **Azubi Game Challenge 2026**! 🎉

Eure Aufgabe ist es, ein interaktives Unterwasser-Spiel zu entwickeln, das Spaß macht und auf Schülermessen oder unserer Weihnachtsfeier präsentiert werden kann.

Das Spiel wird so konzipiert, dass jeder mit Tönen, Sprachausgabe (Screenreader) und haptischem Vibrations-Feedback das Spiel eigenständig und gleichberechtigt mitspielen kann – ganz ohne visuelle Barrieren.

> 💡 **Entwicklungs-Strategie:** Startet mit einer **Single-Player-Version (MVP)** direkt im Browser. Sobald das Spielprinzip und die Barrierefreiheit perfekt funktionieren, kann das Spiel optional um ein Socket.io-Multiplayer-System mit Smartphone-Steuerung erweitert werden.

# **📑 Inhaltsverzeichnis**

1. [Schnellstart](#schnellstart)
2. [Production Build](#production-build)
3. [Code-Qualität](#code-qualität)
4. [GitHub Pages Deployment](#github-pages-deployment)
5. [Projektstruktur](#projektstruktur)
6. [Das Spielkonzept: Deep Sea Echoes](#das-spielkonzept-deep-sea-echoes)
7. [Die Architektur: Vom Single-Player zum Multiplayer](#die-architektur-vom-single-player-zum-multiplayer)
8. [Schritt-für-Schritt Starter-Code (Single-Player)](#schritt-für-schritt-starter-code-single-player)
9. [Inklusions-Guide (Barrierefreiheit)](#inklusions-guide-barrierefreiheit)
10. [Flexibles Phasenmodell (Ohne Zeitdruck)](#flexibles-phasenmodell-ohne-zeitdruck)
11. [Tipps für Einsteiger & Fehlerbehebung](#tipps-für-einsteiger--fehlerbehebung)
12. [Lernressourcen, Dokumentationen & Tools](#lernressourcen-dokumentationen--tools)
13. [Corporate Design & SYBIT-Branding](#corporate-design--sybit-branding)
14. [Vorschläge für wichtige Plugins und Erweiterungen](#vorschläge-für-wichtige-plugins-und-erweiterungen)

<a id="schnellstart"></a>

## Schnellstart

```bash
npm install
npm run dev
```

<a id="production-build"></a>

## Production Build

```bash
npm run build
npm run preview
```

<a id="code-qualität"></a>

## Code-Qualität

ESLint erkennt typische Fehler und problematische Muster frühzeitig. Prettier sorgt dafür, dass der gesamte Code einheitlich formatiert bleibt. Beides reduziert unnötige Review-Diskussionen und hält die Änderungen im Team gut lesbar. Die CI prüft diese Regeln bei jedem Push und Pull Request.

```bash
# ESLint-Prüfung
npm run lint

# Automatisch behebbare ESLint-Probleme korrigieren
npm run lint:fix

# Quellcode mit Prettier formatieren
npm run format

# Formatierung prüfen (wie in der CI)
npm run format:check
```

<a id="github-pages-deployment"></a>

## GitHub Pages Deployment

Dieses Projekt ist für GitHub Pages vorbereitet. Die Workflow-Dateien in `.github/workflows/` bauen das Projekt automatisch und veröffentlichen die Inhalte aus dem `dist`-Ordner.

Die aktuelle Version (vom `main`-Branch) ist live erreichbar: [https://sybit-education.github.io/azubi-game-challenge-2026/](https://sybit-education.github.io/azubi-game-challenge-2026/)

<a id="projektstruktur"></a>

## Projektstruktur

```text
azubi-game-challenge-2026/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy-pages.yml
├── src/
│   ├── main.js
│   └── style.css
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

<a id="das-spielkonzept-deep-sea-echoes"></a>

## Das Spielkonzept: Deep Sea Echoes

Ihr steuert ein **Forschungs-U-Boot in der tiefen Ozean-Dunkelheit**. Der Bildschirm zeigt das Phaser.js-Spielfeld, das mit Hindernissen, Riffen und verlassenen Unterwasser-Stationen gefüllt ist.

### Steuerung & Rollen im Single-Player / Coop:

- **🧭 Der Pilot (Tastatur / Touch):** Navigiert das U-Boot nach oben, unten, links und rechts.
- **📡 Der Sonar-Offizier (Barrierefrei):** Nutzt Sonar-Impulse, um unsichtbare Hindernisse/Feinde über Töne, Vibrationen und Screenreader-Ausgaben aufzuspüren und zu melden.
- **🔧 Maschinist & Schild-Operator:** Aktivieren Zusatzfunktionen wie Schutzschilde oder Reparaturen per Druck auf Tastatur-Kürzel oder Screen-Buttons.

> 💡Kreativität: Das ist nur eine Idee: Seid creativ! Überrascht uns mit einer coolen Spielelogik

## Die Architektur: Vom Single-Player zum Multiplayer

Das Spiel wächst schrittweise mit euren Fortschritten:

PHASE 1: SINGLE-PLAYER (Direkt im Browser)

```ascii
┌───────────────────────────────────────────────────────────────────┐
|                      SINGLE-PLAYER APP                            |
|                                                                   |
|  • Browser-Fenster (Phaser.js)                                    |
|  • Steuerung: Tastatur (Pfeiltasten/WASD) oder Touch-Buttons      |
|  • Sound & Vibration: Web Audio API & Web Vibration API           |
└───────────────────────────────────────────────────────────────────┘
```

PHASE 2 (Optional): MULTIPLAYER UPGRADE

```ascii
┌──────────────────────────────────┐         ┌────────────────────────────────┐
|         MAIN SCREEN              |         |     BACKEND SERVER             |
|                                  | <-----> |                                |
| (Phaser.js auf Beamer / Monitor) |   Web   | (Node.js + Socket.io)          |
└──────────────────────────────────┘ Socket  └────────────────────────────────┘
                                                        ^ Web Socket
                                                        v
                                             ┌────────────────────────────────┐
                                             |  SMARTPHONE CONTROLLER         |
                                             |                                |
                                             |  (Mobile Web-App)              |
                                             └────────────────────────────────┘
```

<a id="schritt-für-schritt-starter-code-single-player"></a>

## Schritt-für-Schritt Starter-Code (Single-Player)

Die wichtigsten Dateien und Verzeichnisse sind:

```sh
azubi-game-challenge-2026/
├── .github/
│   └── workflows/                # CI-Checks und GitHub-Pages-Deployment
│       ├── ci.yml                 # prüft den Build bei Push/PR
│       └── deploy-pages.yml       # veröffentlicht die App auf GitHub Pages
├── src/                          # Spiel-Quellcode und Styles
│   ├── main.js                   # Phaser-Spieldaten, Steuerung und Logik
│   └── style.css                 # allgemeines Aussehen der Spieloberfläche
├── index.html                    # Einstiegspunkt der Browser-App
├── package.json                  # Projekt-Config, Abhängigkeiten und Scripts
├── vite.config.js                # Vite-Konfiguration, z. B. für GitHub Pages
├── README.md                     # Projektbeschreibung und Anleitung
├── .gitignore                    # ignorierte Dateien und Ordner
├── dist/                         # gebuildete, deploybare Ausgabe
└── node_modules/                 # installierte Abhängigkeiten (lokal)
```

> `dist/` und `node_modules/` werden je nach Projektstatus automatisch erzeugt. Sie sind für die lokale Entwicklung bzw. den Build wichtig, aber nicht die Hauptentwicklungsquelle.

<a id="inklusions-guide-barrierefreiheit"></a>

## Inklusions-Guide (Barrierefreiheit)

Damit jeder vollwertig mitspielen kann, achten wir von Anfang an auf folgende Barrierefreiheits-Standards:

1. **Klare HTML-Semantik & ARIA-Attribute:**
   - Verwendet echte `<button\>`-Elemente mit verständlichem Text.
   - Ergänzt `aria-label="Beschreibung der Aktion"` bei interaktiven Elementen.
   - Nutzt `aria-live="polite"` für wichtige Spielstatus-Meldungen, damit der Screenreader (VoiceOver / TalkBack) diese vorliest.
2. **Haptisches Feedback (Web Vibration API):**
   - Benutzt `navigator.vibrate(ms)` bei Ereignissen wie Hindernis-Warnungen oder Sonar-Pings.
   - Beispiel für Hindernis-Warnung: `navigator.vibrate([100, 50, 100, 50, 300]);` (Kurz-Kurz-Lang).
3. **Audio Cues (Web Audio API):**
   - Erzeugt klare Töne mit unterschiedlichen Tonhöhen (Hoher Ton = Freie Fahrt / Erfolg, Tiefer Ton = Gefahr / Hindernis).
4. **Gemeinsames Testen:**
   - Testet das Spiel regelmäßig zusammen, um Töne und Feedback-Muster direkt anzupassen!

<a id="flexibles-phasenmodell-ohne-zeitdruck"></a>

## Flexibles Phasenmodell

Arbeitet die Meilensteine ohne Fristen und in eurem eigenen Tempo ab:

```ascii
┌──────────────────────────────────────────────────────────┐
│ PHASE 1: Single-Player Prototyp                          │
│ • Spielfeld in Phaser.js aufbauen                        │
│ • U-Boot Steuerung per Tastatur & Screen-Buttons         │
│ • Hindernisse & Punkte einbauen                          │
└───────────────────────────┬──────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────┐
│ PHASE 2: Barrierefreiheit & Sound                        │
│ • Audio-Signale für Abstände zu Hindernissen integrieren │
│ • Haptische Vibrationen einbauen                         │
│ • Screenreader-Test mit dem blinden Teamkollegen         │
└───────────────────────────┬──────────────────────────────┘
                            │
                            v
┌──────────────────────────────────────────────────────────┐
│ PHASE 3 (Optional): Multiplayer Upgrade                  │
│ • Node.js + Socket.io Backend aufsetzen                  │
│ • Smartphone-Controller als mobile Web-App gestalten  ─  │
│ • Rollenverteilung (Pilot, Sonar-Offizier, Maschinist)   │
└──────────────────────────────────────────────────────────┘
```

<a id="tipps-für-einsteiger--fehlerbehebung"></a>

## 6. Tipps für Einsteiger & Fehlerbehebung

- **Audio-Sperre im Browser:** Moderne Browser blockieren Töne, bis der Nutzer einmal auf der Seite geklickt oder getippt hat. Der erste Klick auf einen Button schaltet den Sound frei.
- **Entwickler-Tools (F12):** Nutzt in Chrome/Firefox die F12-Taste, um unter _Console_ Fehlermeldungen zu prüfen.
- **Barrierefreiheit im Browser testen:** Unter Chrome/Edge könnt ihr in den DevTools unter _Lighthouse_ einen Barrierefreiheits-Audit durchführen.

<a id="lernressourcen-dokumentationen--tools"></a>

## 7. Lernressourcen, Dokumentationen & Tools

### Phaser.js & Spieleentwicklung

- [Phaser 3 offizielle Dokumentation](https://phaser.io/documentation)
- [Phaser 3 Beispiele & Code-Snippets](https://labs.phaser.io/)
- [Phaser 3 API-Dokumentation](https://docs.phaser.io/api-documentation) – genaue Referenz für Szenen, Input, Physik und Game Objects
- [Phaser 3 Beispiele auf GitHub](https://github.com/phaserjs/examples) – kleine, kopierbare Beispiele nach Themen sortiert

### Socket.io & Echtzeit-Kommunikation

- [Socket.io: offizielles Tutorial](https://socket.io/docs/v4/tutorial/introduction/) – Schritt für Schritt vom ersten Server bis zur Echtzeit-App
- [Socket.io: Events senden und empfangen](https://socket.io/docs/v4/emitting-events/) – `emit`, mehrere Argumente, Acknowledgements und Timeouts
- [Socket.io: Rooms](https://socket.io/docs/v4/rooms/) – sinnvoll für Spielrunden, Teams oder einzelne Smartphone-Controller
- [Socket.io: Client-Socket und Reconnects](https://socket.io/docs/v4/client-socket-instance/) – Verbindungsstatus und Wiederverbindung richtig behandeln
- [Socket.io: Middleware und Authentifizierung](https://socket.io/docs/v4/middlewares/) – Controller vor dem Beitritt zu einer Spielrunde prüfen
- [Socket.io: Connection State Recovery](https://socket.io/docs/v4/connection-state-recovery) – kurzzeitige Unterbrechungen auffangen, ohne den Spielstand sofort zu verlieren
- [Socket.io: Mehrere Server skalieren](https://socket.io/docs/v4/using-multiple-nodes/) – relevant, sobald das Spiel auf mehr als einem Backend läuft

#### Gute Socket.io-Tipps für das Spiel

- **Ereignisse klar benennen:** Verwendet Namen wie `player:move`, `sonar:ping` und `game:state` statt unklarer Sammel-Events wie `message`.
- **Nur Eingaben übertragen:** Der Controller sendet eine Aktion oder Richtung. Der Server prüft sie und verteilt den gültigen Spielzustand; Punkte und Positionen sollten nicht blind vom Smartphone übernommen werden.
- **Spielrunden in Rooms trennen:** Beitretende Geräte kommen in einen Room wie `game-abc123`. Mit `io.to(roomId).emit(...)` erreicht ein Ereignis nur die passende Runde.
- **Disconnects einplanen:** Bei `disconnect` den Controller als offline markieren. Nach einem Reconnect sollte der Client den aktuellen Zustand vom Server anfordern, statt lokal einfach weiterzulaufen.
- **Feedback quittieren:** Für wichtige Aktionen wie „Schild aktivieren“ kann ein Acknowledgement bestätigen, ob der Server die Aktion angenommen hat.
- **CORS und Auth nicht vergessen:** In Entwicklung dürfen die Ursprünge großzügiger sein; im Deployment sollte `origin` auf die echte Spiel-URL begrenzt werden. Tokens gehören in die Authentifizierung und nicht in frei sichtbare Event-Daten.

#### Phaser mit Socket.io verbinden

Phaser bleibt für Darstellung, Eingabe und Spielszene zuständig. Socket.io liefert nur Echtzeit-Ereignisse. Dadurch können die Smartphone-App und das große Spielfeld dieselben Events verwenden:

```js
// Im Phaser-Client (z. B. in create())
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { gameId: 'demo-room' },
});

socket.on('connect', () => {
  console.log('Verbunden:', socket.id);
});

socket.on('player:move', ({ playerId, x, y }) => {
  // Die passende Spielfigur anhand von playerId aktualisieren.
  updatePlayerPosition(playerId, x, y);
});

socket.on('game:state', (state) => {
  // Beim Start oder nach einem Reconnect den Serverzustand übernehmen.
  restoreGameState(state);
});
```

Auf dem Node.js-Server werden die eingehenden Daten validiert und anschließend an die richtige Spielrunde weitergeleitet:

```js
io.on('connection', (socket) => {
  const roomId = socket.handshake.auth.gameId;
  socket.join(roomId);

  socket.on('player:move', (input) => {
    const move = validateMove(input);
    if (!move) return;

    io.to(roomId).emit('player:move', move);
  });
});
```

Für den ersten Prototypen reicht eine Richtung oder Aktion pro Event. Sendet nicht bei jedem Render-Frame komplette Spielstände, sondern lasst den Server Spielregeln und Zustand kontrollieren. Testet außerdem immer: neuer Controller, geschlossener Tab, kurz getrenntes WLAN und erneuter Beitritt zur Spielrunde.

### Web APIs für Barrierefreiheit

- [MDN Web Docs: Web Audio API](https://developer.mozilla.org/de/docs/Web/API/Web_Audio_API)
- [MDN Web Docs: Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [MDN Web Docs: WAI-ARIA Basics](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/WAI-ARIA_basics)

<a id="corporate-design--sybit-branding"></a>

## Corporate Design & SYBIT-Branding

Auf Basis des öffentlich sichtbaren SYBIT-Brand-Ansatzes auf sybit.com ist der zentrale Leitgedanke klar: SYBIT wirkt digital, modern, professionell und zugleich menschlich. Die Marke steht für Customer Experience, Resonanz und lösungsorientierte digitale Transformation – nicht für „technisch überladenes Design“. Für die Schülermesse bedeutet das: Das Spiel muss sofort als SYBIT-Projekt erkennbar sein, ohne dass ein Logo groß sichtbar sein muss.

> 💡Vor der Umsetzung solltet ihr euch den aktuellen **SYBIT-Style Guide** bzw. **Corporate Design-Guide** geben lassen und die Gestaltung aktiv und bewusst daran orientieren. Ihr orientiert euch dabei ausdrücklich an den offiziellen CD-Richtlinien und nicht nur an allgemeinen Eindrucks- oder Trendannahmen. Die Hinweise in diesem README dienen als fachliche Orientierung, aber sie ersetzen nicht den offiziellen Style Guide. Die konkrete Umsetzung muss sich an den gültigen CD-Richtlinien ausrichten.

### Relevante Brand-Erkenntnisse aus dem SYBIT-Style-Ansatz

- **Brand-Messaging:** "We create CX Champions" und "Resonanz" sind zentrale Aussagen. Das deutet auf Nutzerorientierung, Menschlichkeit und wirkungsorientierte Lösungen hin.
- **Design-Sprache:** SYBIT wirkt klar, hochwertig und digital, mit viel Raum für Inhalte und ohne unnötige visuelle Überladung.
- **Stilrichtung:** Die visuelle Sprache ist sachlich-mehrwertig, modern und professionell – auch in Präsentations- und Messesituationen.
- **Kommunikation:** Inhalte sind klar, verständlich und auf Wirkung ausgelegt – ideal für schnelle Erkennbarkeit auf einem Beamer oder Stand.

### Wie das im Spiel umgesetzt werden sollte

- **Konsistenz:** Die gesamte Spieloberfläche sollte eine einheitliche visuelle Sprache verfolgen – von HUD über Buttons bis zu Statusanzeigen.
- **Menschliche Sprache:** UI-Texte sollten verständlich, klar und nicht zu technisch wirken.
- **Erkennbarkeit auf der Schulmesse:** Ein kurzer Satz im Startbereich, etwa im Sinne von "We create CX Champions" oder "Resonanz im Spiel", hilft dem SYBIT-Bezug sofort erkennbar zu machen.
- **Kontrast und Abstand:** Große, gut lesbare Elemente und ausreichend Platz zwischen Informationen sind wichtiger als überladene Effekte.
- **Erlebnisorientierung:** Das Spiel soll professionell, innovativ und bewusst gestaltet wirken – aber nie billig, überladen oder rein technisch.

### Designprinzipien für die Umsetzung

- Die Markenidentität sollte sich in der Grundhaltung widerspiegeln: modern, klar, verlässlich, lösungsorientiert.
- Die Oberfläche sollte auf Sichtbarkeit und Lesbarkeit aus der Entfernung ausgelegt sein.
- Barrierefreie Interaktionsmuster sollten zur Markenbotschaft passen: verständlich, konsistent und ohne Verwirrung.
- Die visuelle Leistung sollte auf ein stimmiges Gesamtbild abzielen – nicht auf einzelne, isolierte Effekte.

### Design-Checks für Schulmesse & Beamer

- Buttons und HUD-Elemente sollten immer zur gleichen visuellen Sprache gehören.
- Der Spielstatus sollte auch aus der Entfernung sofort lesbar sein.
- Audio- und haptische Signale sollten die gleiche Bedeutung wie die visuelle Ausgabe haben.
- Ein klarer SYBIT-Brand-Gedanke im Spielstart oder in der Spieloberfläche sorgt für sofortige Wiedererkennbarkeit.
- Das Spiel soll auf einem Beamer extrem gut lesbar und schnell verständlich sein.

Damit bleibt das Spiel nicht nur funktional, sondern auch optisch deutlich als SYBIT-Projekt erkennbar – besonders auf Schulmessen, wo der Bezug auf den ersten Blick klar sein muss.

<a id="vorschläge-für-wichtige-plugins-und-erweiterungen"></a>

## Vorschläge für wichtige Plugins und Erweiterungen

Für das aktuelle Phaser-Projekt sind diese Tools besonders sinnvoll:

- `phaser` – Kern-Engine für 2D-Spiele, Physik und Animationen
- `vite` – schneller Dev-Server und Build-Prozess
- `eslint` + `eslint-config-standard` – Code-Qualität und einheitliches Stil-Setup
- `prettier` – Formatierung für sauberen, lesbaren Code
- `socket.io-client` – für spätere Multiplayer-/Smartphone-Steuerungs-Integration

- `vite-plugin-checker` – optional für Type-/Lint-Checks im Dev-Server

**Viel Spaß beim Bauen von "Deep Sea Echoes"! 🚀**
