# 🏎️ Sybit Kart

Willkommen bei **Sybit Kart**, schön, dass du da bist! In unserem kleinen Rennspiel geht’s darum, mit deinem Kart möglichst weit zu kommen, Münzen einzusammeln und den anderen Autos auszuweichen. Wie lange hältst du durch, und wie viele Punkte schaffst du?

Du kannst im **Standardmodus** durch Sybit-City düsen oder für etwas Weihnachtsstimmung in den **Weihnachtsmodus** wechseln. Wenn du erst einmal üben möchtest: Die Anleitung führt dich Schritt für Schritt durchs Menü und auf eine sichere Übungsstrecke. Keine Sorge, dort gibt es weder Kollisionen noch Game Over.

## Schnellstart

Du brauchst [Node.js 22](https://nodejs.org/) und npm. Öffne das Projekt im Terminal und starte es so:

```bash
npm install
npm run dev
```

Öffne danach die vom Terminal angezeigte Adresse, normalerweise `http://localhost:5173`. Viel Spaß auf der Strecke! 🏁

## So spielst du

- Mit **W/A/S/D** oder den **Pfeiltasten** steuerst du dein Kart: links, rechts, vor und zurück.
- Sammle Münzen – jede bringt **50 Punkte**.
- Weiche den anderen Autos aus. Ein Zusammenstoß beendet das Rennen.
- Oben im HUD siehst du deine Punkte und die gefahrene Strecke.

Im Zweispielermodus steuert Person 1 mit den Pfeiltasten und Person 2 mit **W/A/S/D**. Auch Gamepads werden unterstützt. Die Anleitung erreichst du über **Anleitung** unten links im Hauptmenü. Dort kannst du die Steuerung und das Einsammeln einer Münze in Ruhe ausprobieren. Mit **Escape** schließt du die Anleitung.

## Was steckt drin?

Das Spiel läuft direkt im Browser. **Phaser** kümmert sich um Spiel und Physik, **Vite** startet den Entwicklungsserver und erstellt den Build. Im Projekt findest du unter anderem:

```text
src/
├── main.js                 # Startpunkt des Spiels
├── objects/                # Kart, Strecke, Hindernisse, Münzen und HUD
├── scenes/                 # Menüs, Rennen, Lade- und Game-Over-Szenen
├── tutorial/               # Anleitung und sichere Übungsstrecke
└── accessibility/          # Funktionen rund um Barrierefreiheit
```

Die Tutorial Schritte stehen in `src/tutorial/steps.js`, die Styles in `src/tutorial/tutorial.css`. Die Anleitung ist als HTML-Dialog umgesetzt, per Tastatur bedienbar und gibt wichtige Rückmeldungen über eine Screenreader-Live-Region aus.

## Nützliche Befehle

```bash
npm run dev          # Spiel lokal starten
npm run build        # Produktionsversion in dist/ erstellen
npm run preview      # Produktionsversion lokal ansehen
npm run lint         # Code auf typische Probleme prüfen
npm run format:check # Formatierung prüfen
```

## Mitmachen

Du hast eine Idee für ein neues Kart, eine Strecke oder ein kleines Detail, das das Spiel noch besser macht? Klasse, probier sie aus! Schau dir die passende Szene oder Klasse in `src/` an, ändere den Code und starte das Spiel mit `npm run dev`, um deine Änderung direkt zu sehen. Kleine Schritte sind völlig okay: So findet man sich am besten ins Projekt ein.

Wenn etwas nicht klappt, wirf zuerst einen Blick in die Browser-Konsole (meist über **F12**) und ins Terminal, in dem Vite läuft. Oft steht dort schon ein hilfreicher Hinweis.

## Veröffentlichung

Das Projekt ist für GitHub Pages eingerichtet. Der Workflow in `.github/workflows/` erstellt den Build und veröffentlicht ihn. Die aktuelle Version findest du unter [sybit-education.github.io/azubi-game-challenge-2026](https://sybit-education.github.io/azubi-game-challenge-2026/).

Viel Spaß beim Spielen und Weiterbauen!  wir sehen uns auf der Strecke! 🚗💨
