# 🌊 Azubi Game Challenge 2026: "Deep Sea Echoes"

Willkommen zur **Azubi Game Challenge 2026**! 🎉

Eure Aufgabe ist es, ein interaktives Unterwasser-Spiel zu entwickeln, das Spaß macht und auf Schülermessen oder unserer Weihnachtsfeier präsentiert werden kann.


Das Spiel wird so konzipiert, dass jeder mit auditiven Tönen, Sprachausgabe (Screenreader) und haptischem Vibrations-Feedback das Spiel eigenständig und gleichberechtigt mitspielen kann – ganz ohne visuelle Barrieren.

> 💡 **Entwicklungs-Strategie:** Wir starten mit einer **Single-Player-Version (MVP)** direkt im Browser. Sobald das Spielprinzip und die Barrierefreiheit perfekt funktionieren, kann das Spiel optional um ein Socket.io-Multiplayer-System mit Smartphone-Steuerung erweitert werden.

## **📑 Inhaltsverzeichnis**

1. [Schnellstart](#schnellstart)
2. [Production Build](#production-build)
3. [GitHub Pages Deployment](#github-pages-deployment)
4. [Projektstruktur](#projektstruktur)
5. [Das Spielkonzept: Deep Sea Echoes](#das-spielkonzept-deep-sea-echoes)
6. [Die Architektur: Vom Single-Player zum Multiplayer](#die-architektur-vom-single-player-zum-multiplayer)
7. [Schritt-für-Schritt Starter-Code (Single-Player)](#schritt-für-schritt-starter-code-single-player)
8. [Inklusions-Guide (Barrierefreiheit)](#inklusions-guide-barrierefreiheit)
9. [Flexibles Phasenmodell (Ohne Zeitdruck)](#flexibles-phasenmodell-ohne-zeitdruck)
10. [Tipps für Einsteiger & Fehlerbehebung](#tipps-für-einsteiger--fehlerbehebung)
11. [Lernressourcen, Dokumentationen & Tools](#lernressourcen-dokumentationen--tools)
12. [Vorschläge für wichtige Plugins und Erweiterungen](#vorschläge-für-wichtige-plugins-und-erweiterungen)

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

<a id="github-pages-deployment"></a>
## GitHub Pages Deployment

Dieses Projekt ist für GitHub Pages vorbereitet. Die Workflow-Dateien in `.github/workflows/` bauen das Projekt automatisch und veröffentlichen die Inhalte aus dem `dist`-Ordner.

Die aktuelle Version (vom `main`-Branch) ist live erreichbar: <https://sybit-education.github.io/azubi-game-challenge-2026/>

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

* **🧭 Der Pilot (Tastatur / Touch):** Navigiert das U-Boot nach oben, unten, links und rechts.  
* **📡 Der Sonar-Offizier (Barrierefrei):** Nutzt Sonar-Impulse, um unsichtbare Hindernisse/Feinde über Töne, Vibrationen und Screenreader-Ausgaben aufzuspüren und zu melden.  
* **🔧 Maschinist & Schild-Operator:** Aktivieren Zusatzfunktionen wie Schutzschilde oder Reparaturen per Druck auf Tastatur-Kürzel oder Screen-Buttons.

<a id="die-architektur-vom-single-player-zum-multiplayer"></a>
## Die Architektur: Vom Single-Player zum Multiplayer

Das Spiel wächst schrittweise mit euren Fortschritten:

 PHASE 1: SINGLE-PLAYER (Direkt im Browser)  

 ```ascii
 ┌───────────────────────────────────────────────────────────────────┐  
 |                      SINGLE-PLAYER APP                            |  
 |  • Browser-Fenster (Phaser.js)                                    |  
 |  • Steuerung: Tastatur (Pfeiltasten/WASD) oder Touch-Buttons      |  
 |  • Sound & Vibration: Web Audio API & Web Vibration API           |  
 └───────────────────────────────────────────────────────────────────┘
 ```

 PHASE 2 (Optional): MULTIPLAYER UPGRADE  

 ```ascii
 ┌──────────────────────────────────┐         ┌────────────────────────────────┐
 |         MAIN SCREEN              | <-----> |     BACKEND SERVER             |  
 | (Phaser.js auf Beamer / Monitor) |   Web   | (Node.js \+ Socket.io)         |  
 └──────────────────────────────────┘ Socket  └────────────────────────────────┘
                                                         ^ Web Socket  
                                                         v  
                                              ┌────────────────────────────────┐
                                              |  SMARTPHONE CONTROLLER         |  
                                              |  (Mobile Web-App)              |  
                                              └────────────────────────────────┘
```

<a id="schritt-für-schritt-starter-code-single-player"></a>
## Schritt-für-Schritt Starter-Code (Single-Player)

Erstellt für den Start einen Ordner mit folgenden zwei Dateien:

```sh
azubi-game-challenge-2026/  
├── index.html        (Main Screen mit Phaser & HTML-Interface)  
└── game.js           (Spiellogik, Barrierefreiheit & Steuerung)
```

### 1. index.html

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deep Sea Echoes - Single-Player MVP</title>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.0/dist/phaser.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #020617;
      color: #ffffff;
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    #game-container {
      border: 2px solid #0369a1;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .accessibility-controls {
      margin-top: 15px;
      display: flex;
      gap: 12px;
    }
    .accessible-btn {
      background-color: #0284c7;
      color: white;
      border: none;
      padding: 14px 20px;
      font-size: 1rem;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
    }
    .accessible-btn:focus, .accessible-btn:hover {
      background-color: #0369a1;
      outline: 3px solid #38bdf8;
    }
  </style>
</head>
<body>

  <h1>🌊 Deep Sea Echoes</h1>
  <div id="game-container"></div>

  <!-- Barrierefreie Steuerungsschaltflächen für Screenreader & Touch -->
  <div class="accessibility-controls" role="region" aria-label="Barrierefreie Steuerung">
    <button id="btn-sonar" class="accessible-btn" aria-label="Sonar Impuls senden (S-Taste)">🔊 Sonar Ping (Taste S)</button>
    <button id="btn-shield" class="accessible-btn" aria-label="Schutzschild aktivieren (Leertaste)">🛡️ Schild (Leertaste)</button>
  </div>

  <script src="game.js"></script>
</body>
</html>
```

### 2. game.js

```javascript
// Konfiguration für das Phaser.js Spiel  
const config \= {  
  type: Phaser.AUTO,  
  width: 960,  
  height: 540,  
  parent: 'game-container',  
  backgroundColor: '\#0f172a',  
  physics: {  
    default: 'arcade',  
    arcade: { debug: false }  
  },  
  scene: { preload: preload, create: create, update: update }  
};

let submarine;  
let cursors;  
let keySonar, keyShield;  
const game \= new Phaser.Game(config);

function preload() {  
  // Bild- oder Sound-Assets können hier geladen werden  
}

function create() {  
  const scene \= this;

  // U-Boot (Platzhalter-Rechteck)  
  submarine \= scene.add.rectangle(150, 270, 80, 30, 0x0284c7);  
  scene.physics.add.existing(submarine);  
  submarine.body.setCollideWorldBounds(true);

  scene.add.text(20, 20, 'Steuerung: Pfeiltasten (Bewegen) | S (Sonar) | Leertaste (Schild)', {  
    font: '16px Arial',  
    fill: '\#38bdf8'  
  });

  // Tastatur-Eingaben initialisieren  
  cursors \= scene.input.keyboard.createCursorKeys();  
  keySonar \= scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);  
  keyShield \= scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Event Listener für Tastatur-Aktionen  
  keySonar.on('down', triggerSonar);  
  keyShield.on('down', triggerShield);

  // Event Listener für barrierefreie UI-Buttons  
  document.getElementById('btn-sonar').addEventListener('click', triggerSonar);  
  document.getElementById('btn-shield').addEventListener('click', triggerShield);

  function triggerSonar() {  
    // Visueller Effekt (Sichtbare Welle)  
    let circle \= scene.add.circle(submarine.x, submarine.y, 10, 0x38bdf8, 0.6);  
    scene.tweens.add({  
      targets: circle,  
      radius: 180,  
      alpha: 0,  
      duration: 800,  
      onComplete: () \=\> circle.destroy()  
    });

    // Auditives Feedback (Web Audio API)  
    playTone(587.33, 0.15); // D5 Ton  
      
    // Haptisches Feedback (Web Vibration API)  
    if ('vibrate' in navigator) {  
      navigator.vibrate(120);  
    }  
  }

  function triggerShield() {  
    // Schild-Animation  
    let shieldEffect \= scene.add.circle(submarine.x, submarine.y, 50, 0x0d9488, 0.4);  
    scene.tweens.add({  
      targets: shieldEffect,  
      alpha: 0,  
      duration: 500,  
      onComplete: () \=\> shieldEffect.destroy()  
    });

    playTone(293.66, 0.3); // Tieferer Ton (D4)  
    if ('vibrate' in navigator) {  
      navigator.vibrate(\[80, 40, 80\]);  
    }  
  }  
}

function update() {  
  if (\!submarine || \!submarine.body) return;

  // Bewegung zurücksetzen  
  submarine.body.setVelocity(0);

  // Pfeiltasten-Steuerung  
  if (cursors.up.isDown) {  
    submarine.body.setVelocityY(-200);  
  } else if (cursors.down.isDown) {  
    submarine.body.setVelocityY(200);  
  }

  if (cursors.left.isDown) {  
    submarine.body.setVelocityX(-200);  
  } else if (cursors.right.isDown) {  
    submarine.body.setVelocityX(200);  
  }  
}

// Hilfsfunktion: Barrierefreie Tonerzeugung  
function playTone(frequency, duration) {  
  try {  
    const audioCtx \= new (window.AudioContext || window.webkitAudioContext)();  
    const osc \= audioCtx.createOscillator();  
    const gain \= audioCtx.createGain();  
      
    osc.type \= 'sine';  
    osc.frequency.value \= frequency;  
      
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);  
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime \+ duration);

    osc.connect(gain);  
    gain.connect(audioCtx.destination);  
      
    osc.start();  
    osc.stop(audioCtx.currentTime \+ duration);  
  } catch (e) {  
    console.log('AudioContext wird vom Browser blockiert:', e);  
  }  
}
```

<a id="inklusions-guide-barrierefreiheit"></a>
## Inklusions-Guide (Barrierefreiheit)

Damit jeder vollwertig mitspielen kann, achten wir von Anfang an auf folgende Barrierefreiheits-Standards:

1. **Klare HTML-Semantik & ARIA-Attribute:**  
   * Verwendet echte `<button\>`-Elemente mit verständlichem Text.  
   * Ergänzt `aria-label="Beschreibung der Aktion"` bei interaktiven Elementen.  
   * Nutzt `aria-live="polite"` für wichtige Spielstatus-Meldungen, damit der Screenreader (VoiceOver / TalkBack) diese vorliest.  
2. **Haptisches Feedback (Web Vibration API):**  
   * Benutzt `navigator.vibrate(ms)` bei Ereignissen wie Hindernis-Warnungen oder Sonar-Pings.  
   * Beispiel für Hindernis-Warnung: `navigator.vibrate([100, 50, 100, 50, 300]);` (Kurz-Kurz-Lang).  
3. **Audio Cues (Web Audio API):**  
   * Erzeugt klare Töne mit unterschiedlichen Tonhöhen (Hoher Ton \= Freie Fahrt / Erfolg, Tiefer Ton \= Gefahr / Hindernis).  
4. **Gemeinsames Testen:**  
   * Testet das Spiel regelmäßig zusammen, um Töne und Feedback-Muster direkt anzupassen!

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
│ • Node.js \+ Socket.io Backend aufsetzen                 │  
│ • Smartphone-Controller als mobile Web-App gestalten  ─  │  
│ • Rollenverteilung (Pilot, Sonar-Offizier, Maschinist)   │  
└──────────────────────────────────────────────────────────┘
```

<a id="tipps-für-einsteiger--fehlerbehebung"></a>
## 6. Tipps für Einsteiger & Fehlerbehebung

* **Audio-Sperre im Browser:** Moderne Browser blockieren Töne, bis der Nutzer einmal auf der Seite geklickt oder getippt hat. Der erste Klick auf einen Button schaltet den Sound frei.  
* **Entwickler-Tools (F12):** Nutzt in Chrome/Firefox die F12\-Taste, um unter *Console* Fehlermeldungen zu prüfen.  
* **Barrierefreiheit im Browser testen:** Unter Chrome/Edge könnt ihr in den DevTools unter *Lighthouse* einen Barrierefreiheits-Audit durchführen.

<a id="lernressourcen-dokumentationen--tools"></a>
## 7. Lernressourcen, Dokumentationen & Tools

### Phaser.js & Spieleentwicklung

* [Phaser 3 offizielle Dokumentation](https://phaser.io/documentation)  
* [Phaser 3 Beispiele & Code-Snippets](https://labs.phaser.io/)

### Web APIs für Barrierefreiheit

* [MDN Web Docs: Web Audio API](https://developer.mozilla.org/de/docs/Web/API/Web_Audio_API)  
* [MDN Web Docs: Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)  
* [MDN Web Docs: WAI-ARIA Basics](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/WAI-ARIA_basics)

<a id="vorschläge-für-wichtige-plugins-und-erweiterungen"></a>
## Vorschläge für wichtige Plugins und Erweiterungen

Für das aktuelle Phaser-Projekt sind diese Tools besonders sinnvoll:

- `phaser` – Kern-Engine für 2D-Spiele, Physik und Animationen
- `vite` – schneller Dev-Server und Build-Prozess
- `eslint` + `eslint-config-standard` – Code-Qualität und einheitliches Stil-Setup
- `prettier` – Formatierung für sauberen, lesbaren Code
- `socket.io-client` – für spätere Multiplayer-/Smartphone-Steuerungs-Integration
- `@vitejs/plugin-legacy` – optional für ältere Browser oder Schul-Umgebungen
- `vite-plugin-checker` – optional für Type-/Lint-Checks im Dev-Server
- `gh-pages` – alternativ für manuelles Deployment außerhalb der GitHub-Actions

**Viel Spaß beim Bauen von "Deep Sea Echoes"\! 🚀**
