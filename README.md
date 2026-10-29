# 🏎️ Sybit Kart

> 🚧 **Preview-README:** Dieses README ist noch nicht final. Einzelne Angaben können sich ändern.

Sybit Kart ist ein Endlos-Rennspiel für den Browser, entwickelt von den Azubis der Sybit im Rahmen der **Azubi Game Challenge 2026**. Es läuft auf Schülermessen und auf der Weihnachtsfeier, allein oder zu zweit an einem Rechner.

Die aktuelle Version (vom `main`-Branch) ist live spielbar: [https://sybit-education.github.io/azubi-game-challenge-2026/](https://sybit-education.github.io/azubi-game-challenge-2026/)

# **📑 Inhaltsverzeichnis**

1. [Spielprinzip](#spielprinzip)
2. [Steuerung](#steuerung)
3. [Items, Hindernisse & Shop](#items-hindernisse--shop)
4. [Spielmodi](#spielmodi)
5. [Leaderboard](#leaderboard)
6. [Barrierefreiheit](#barrierefreiheit)
7. [Betrieb am Stand (Laptop + TV)](#betrieb-am-stand)
8. [Entwicklung](#entwicklung)
9. [Projektstruktur](#projektstruktur)
10. [Team](#team)
11. [Challenge-Vorlage](#challenge-vorlage)

<a id="spielprinzip"></a>

## Spielprinzip

Ihr fahrt von oben gesehen über eine Straße, die immer schneller wird. Ziel ist es, möglichst weit zu kommen (Distanz in km) und dabei Münzen einzusammeln (Punkte). Wer ein Gegnerauto oder ein Hindernis berührt, ist raus.

Der Ablauf:

1. **Menü:** Spiel starten (1 oder 2 Spieler), Einstellungen, Credits oder Leaderboard öffnen
2. **Name eingeben:** Mit Enter bestätigen, im 2-Spieler-Modus gibt jeder seinen Namen ein
3. **Countdown:** 3, 2, 1, GO. Der Countdown lässt sich überspringen
4. **Rennen:** Ausweichen, Münzen und Items einsammeln
5. **Game Over:** Punkte und Distanz werden angezeigt. Von hier geht es direkt in die nächste Runde oder zurück ins Menü

<a id="steuerung"></a>

## Steuerung

| Aktion                       | Spieler 1 | Spieler 2 |
| ---------------------------- | --------- | --------- |
| Lenken                       | A / D     | ← / →     |
| Gas / Bremse                 | W / S     | ↑ / ↓     |
| Shop: Schild (20 Münzen)     | 1         | Numpad 1  |
| Shop: Schrumpfen (15 Münzen) | 2         | Numpad 2  |

**Gamepad:** Es werden bis zu zwei Gamepads unterstützt (Spieler 1 und Spieler 2). Mit dem Stick wird gefahren, im Menü navigieren die Knöpfe.

**Weitere Tasten:** Die Einstellungen schließt ihr mit `Esc` oder `M`, die Credits überspringt ihr mit der Leertaste.

<a id="items-hindernisse--shop"></a>

## Items, Hindernisse & Shop

**Einsammeln**

- **Münzen:** Jede Münze gibt 50 Punkte und füllt außerdem euer Guthaben für den Shop.
- **Item-Box:** Gibt einen zufälligen Effekt:
  - **Schrumpfen:** Das Auto wird 10 Sekunden lang kleiner.
  - **Wachsen:** Das Auto wird 10 Sekunden lang größer.
  - **Schild:** 8 Sekunden lang überlebt ihr Zusammenstöße. Kurz vor Ende blinkt das Auto.
  - **Übelkeit:** Die Kamera wackelt und zoomt für einen Moment.

**Ausweichen**

- **Gegnerautos** und **zufällige Hindernisse** auf der Straße beenden das Rennen sofort, wenn ihr sie berührt (außer ihr habt ein Schild).
- **Eis:** Wer darüberfährt, rutscht zufällig nach links oder rechts.

**Shop**

Mit gesammelten Münzen könnt ihr im Rennen Items kaufen: ein Schild für 20 Münzen oder Schrumpfen für 15 Münzen. Das Guthaben wird aktuell noch nicht im HUD angezeigt.

<a id="spielmodi"></a>

## Spielmodi

- **1 Spieler:** Klassischer Modus. Das Rennen endet, sobald ihr ausscheidet.
- **2 Spieler:** Beide fahren gleichzeitig auf derselben Straße, jeder mit eigener Tastenbelegung oder eigenem Gamepad. Das Rennen endet erst, wenn beide ausgeschieden sind. Danach zeigt ein Logo, wer gewonnen hat.
- **Weihnachtsmodus:** In den Einstellungen umschaltbar. Verändert das Aussehen des Startbildschirms (Lichterkette, Tannenbäume).

<a id="leaderboard"></a>

## Leaderboard

Das Leaderboard zeigt die zehn besten Distanzen. Pro Name zählt nur das beste Ergebnis.

> ⚠️ Die Einträge werden im `localStorage` des Browsers gespeichert. Sie gelten also nur für den Rechner und den Browser, auf dem gespielt wurde. Wer die Browserdaten löscht, löscht auch das Leaderboard.

<a id="barrierefreiheit"></a>

## Barrierefreiheit

Das Spiel soll von allen gespielt werden können:

- **Tastatur und Screenreader:** Über dem Spiel liegen unsichtbare HTML-Buttons (z. B. für „play“, „Settings“, „retry“). Dadurch lassen sich die Menüs per `Tab` bedienen und von Screenreadern vorlesen. Die Logik dazu steht in `src/accessibility/positionControls.js`.
- **Gamepad:** Hauptmenü, Einstellungen, Countdown und Game Over lassen sich mit dem Gamepad bedienen. Die Namenseingabe und das Leaderboard brauchen bisher Tastatur oder Maus.
- **Noch offen:** Der Schalter „Accessibility Mode“ in den Einstellungen ist bisher nur vorbereitet und ändert noch nichts am Spiel.

<a id="betrieb-am-stand"></a>

## Betrieb am Stand (Laptop + TV)

**Empfehlung:** Das Spiel auf dem Laptop lokal aus einem fertigen Build starten, den TV per HDMI anschließen und einen aktuellen Chrome- oder Edge-Browser verwenden. Am Stand nicht den Entwicklungsserver (`npm run dev`) verwenden. Der TV ist nur der Bildschirm; ein eigener Rechner oder Browser auf dem TV ist nicht nötig.

### Einmalig vorbereiten

1. Das Projekt wie unter [Entwicklung](#entwicklung) herunterladen und Node.js installieren. Die für den Stand vorgesehene Version auschecken.
2. Im Projektordner die Abhängigkeiten installieren und das Spiel bauen:

```bash
npm install
npm run build
```

Den Build vor der Veranstaltung mit Internetzugang vorbereiten; bei fehlenden Bildern oder Sounds auch `git lfs pull` ausführen und erneut bauen. Nach Code- oder Asset-Änderungen ist immer ein neuer Build nötig.

### Bei jedem Start

Im Projektordner ausführen und das Terminal während der Veranstaltung geöffnet lassen:

```bash
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Anschließend auf dem Laptop diese Adresse öffnen:

**http://127.0.0.1:4173/azubi-game-challenge-2026/**

`--host 127.0.0.1` beschränkt den Zugriff auf den Laptop. `--strictPort` verhindert einen unbemerkten Portwechsel: Ist Port `4173` belegt, zuerst den bisherigen Server prüfen und gegebenenfalls beenden, statt einen anderen Port zu verwenden. Mit `Strg+C` im Terminal wird der Server beendet.

> `vite preview` dient hier nur zur lokalen Wiedergabe des Builds auf dem Stand-Laptop. Es ist kein für öffentlichen Produktionsbetrieb vorgesehener Webserver. Für eine öffentliche Bereitstellung einen statischen Webserver oder das bestehende GitHub-Pages-Deployment verwenden. Die HTML-Datei im Build nicht direkt per Doppelklick öffnen.

### Laptop und TV einrichten

- Laptop ans Netzteil anschließen. Für die Veranstaltungsdauer automatischen Ruhezustand, Bildschirmschoner und Bildschirmabschaltung deaktivieren; den Laptop geöffnet lassen.
- TV per HDMI verbinden und den passenden HDMI-Eingang wählen. Wenn verfügbar, den **Spielemodus** des TVs aktivieren, um Eingabeverzögerungen zu reduzieren.
- Zunächst **Bildschirme duplizieren** wählen, damit die Betreuung dasselbe Bild sieht. Bei falschem Seitenverhältnis alternativ nur den TV verwenden. Eine gemeinsam unterstützte Auflösung, zum Beispiel `1920 × 1080` bei `60 Hz`, einstellen.
- Am TV eine Darstellung ohne Overscan wählen (je nach Hersteller „Original“, „Just Scan“ oder „Bildschirmanpassung“), damit Menüs und Spielränder nicht abgeschnitten werden.
- Browser-Zoom mit `Strg+0` auf `100 %` setzen und mit `F11` Vollbild einschalten. Einmal ins Spiel klicken, damit Eingaben und Audio funktionieren.
- HDMI/TV als Audioausgabe wählen, Lautstärke testen und Benachrichtigungen ausschalten. Gamepads vor dem Start verbinden; Namenseingabe und Leaderboard auch mit Tastatur/Maus testen.

### Leaderboard und Schutz vor Manipulation

Immer dasselbe **Browserprofil und dieselbe Adresse einschließlich Port** verwenden. `localhost`, `127.0.0.1`, andere Ports und die GitHub-Pages-Adresse haben getrennte Browser-Speicher. Ein dort scheinbar leeres Leaderboard bedeutet nicht, dass die bisherigen Ergebnisse gelöscht wurden.

Kein privates/InPrivate-Fenster, Gastprofil oder automatisch gelöschtes Kiosk-Profil verwenden, wenn Ergebnisse über einen Browser-Neustart erhalten bleiben sollen. Browserdaten nicht löschen; der lokale Build sichert das Leaderboard nicht mit. Vor der Veranstaltung mit einem Testeintrag prüfen, dass er nach Schließen und erneutem Öffnen des Browsers erhalten bleibt.

**Vollbild ist keine Zugriffssperre.** Für einen unbeaufsichtigten Stand einen administrativ eingerichteten Kiosk-Browser verwenden, DevTools über Browserrichtlinien sperren und den Zugriff auf Betriebssystem und freie Tastenkombinationen einschränken. In verwaltetem Chrome/Edge lässt sich dafür unter anderem `DeveloperToolsAvailability = 2` setzen; die tatsächlich angewendeten Richtlinien vor Ort prüfen. Kiosk-Modus allein sperrt DevTools nicht zuverlässig und kann je nach Konfiguration Browserdaten beim Beenden löschen.

Die clientseitigen Signaturen machen bestimmte Manipulationen sichtbar, verhindern aber weder das Löschen des Speichers noch alle Cheats. Bei frei zugänglicher Tastatur den Stand betreuen; für verbindliche Wettbewerbsergebnisse ist eine serverseitige Prüfung und Speicherung nötig.

### Kurzer Check vor Einlass

Eine Runde allein und zu zweit spielen: Bild vollständig sichtbar, Lenkung und Gamepads funktionieren, Ton kommt vom TV, Namen lassen sich eingeben und Ergebnisse erscheinen im Leaderboard. Auch Browser-Neustart und den Betrieb ohne Internet einmal vorab testen. Während der Veranstaltung keine ungeprüften Updates einspielen.

<a id="entwicklung"></a>

## Entwicklung

Technik: [Phaser](https://phaser.io/) 4 (Arcade Physics), [Vite](https://vite.dev/), JavaScript (ES-Module)

### Schnellstart

```bash
npm install
npm run dev
```

Der Entwicklungsserver läuft standardmäßig auf `http://localhost:3000/azubi-game-challenge-2026/`. Ist der Port belegt, zeigt Vite im Terminal den tatsächlich verwendeten Port an.

### Entwicklungsumgebung einrichten

Es gibt zwei Möglichkeiten. GitHub Codespaces läuft vollständig im Browser und braucht keine Installation. Für die lokale Entwicklung unter Windows werden einige Programme einmalig installiert.

#### Mit GitHub Codespaces im Browser

1. Öffnet die Repository-Seite auf GitHub und klickt auf **Code**.
2. Wählt den Tab **Codespaces** und klickt auf **Create codespace on main**.
3. Wartet, bis der Browser-Editor geöffnet ist. Die Abhängigkeiten werden automatisch mit `npm ci` installiert (Node.js 22).
4. Startet im Terminal das Spiel mit `npm run dev` und klickt bei der Meldung zum Port `3000` auf **Open in Browser**.

#### Lokal unter Windows

Installiert diese Programme einmalig:

1. [Git for Windows](https://git-scm.com/download/win), um das Projekt herunterzuladen
2. [Node.js 22 LTS](https://nodejs.org/), damit `npm` und der Entwicklungsserver verfügbar sind
3. [Visual Studio Code](https://code.visualstudio.com/), um den Code zu bearbeiten

Öffnet anschließend **PowerShell** oder **Git Bash** und führt diese Befehle aus:

```bash
git clone https://github.com/Sybit-Education/azubi-game-challenge-2026.git
cd azubi-game-challenge-2026
npm install
npm run dev
```

> 💡 Bilder und Audiodateien (`.png`, `.jpg`, `.mp3`) liegen in [Git LFS](https://git-lfs.com/). Git for Windows bringt Git LFS bereits mit. Sollten im Spiel Bilder fehlen, führt einmal `git lfs install` und danach `git lfs pull` aus.

### Production Build

```bash
npm run build
npm run preview
```

### Code-Qualität

ESLint erkennt typische Fehler frühzeitig, Prettier sorgt für einheitlich formatierten Code. Die CI prüft beides bei jedem Push und Pull Request.

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

### GitHub Pages Deployment

Die Workflow-Dateien in `.github/workflows/` bauen das Projekt bei jedem Push auf `main` automatisch und veröffentlichen den Inhalt aus dem `dist`-Ordner auf GitHub Pages.

<a id="projektstruktur"></a>

## Projektstruktur

```text
azubi-game-challenge-2026/
├── .github/
│   └── workflows/
│       ├── ci.yml                # prüft Format, Lint und Build bei Push/PR
│       └── deploy-pages.yml      # veröffentlicht die App auf GitHub Pages
├── .devcontainer/                # Konfiguration für GitHub Codespaces
├── docs/                         # zusätzliche Dokumentation
├── public/
│   └── assets/                   # Bilder, Audio und Schriftarten
├── src/
│   ├── main.js                   # Phaser-Konfiguration und Liste aller Szenen
│   ├── accessibility/            # unsichtbare HTML-Buttons für Tastatur und Screenreader
│   ├── objects/                  # Spielobjekte (Auto, Straße, Münzen, Hindernisse, HUD, Eingabe)
│   └── scenes/                   # Szenen (Spiel, Game Over, Leaderboard, Credits, ...)
│       └── Menus/                # Menü-Szenen (Hauptmenü, Einstellungen, Namenseingabe, ...)
├── index.html                    # Einstiegspunkt der Browser-App
├── package.json                  # Abhängigkeiten und Scripts
├── vite.config.js                # Vite-Konfiguration (inkl. Pfad für GitHub Pages)
└── README.md
```

Wichtige Dateien:

- `src/scenes/GameScene.js`: Das eigentliche Rennen (Spawnen von Hindernissen, Kollisionen, Geschwindigkeit)
- `src/objects/ItemManager.js`: Effekte der Items und der Shop
- `src/objects/InputManager.js`: Einheitliche Eingabe für Tastatur und Gamepads

<a id="team"></a>

## Team

| Bereich          | Wer                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------- |
| Entwicklung      | Hans Solon, Davyd Mozghov, Berat Dalgic, Agwad Alsayed, Saied Tablis, Jamin Ibrahimovic |
| Grafik           | Luisa Krasniqi, Sofya Skripova                                                          |
| UI/UX Design     | Sofya Skripova, Saied Tablis, Luisa Krasniqi                                            |
| Audio            | Sofya Skripova, Jamin Ibrahimovic                                                       |
| Barrierefreiheit | Agwad Alsayed                                                                           |

<a id="challenge-vorlage"></a>

## Challenge-Vorlage

Die ursprüngliche Aufgabenstellung der Challenge („Deep Sea Echoes“, inklusive Lernressourcen und Branding-Hinweisen) liegt in [docs/challenge-vorlage.md](docs/challenge-vorlage.md).
