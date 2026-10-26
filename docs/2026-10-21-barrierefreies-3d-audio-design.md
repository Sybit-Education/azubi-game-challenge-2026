# Design: Barrierefreies räumliches Audio für ein Phaser-Rennspiel

- **Datum:** 21. Oktober 2026
- **Status:** Zur fachlichen Prüfung
- **Zielplattform:** Desktop-Browser, Tastatur und Controller, Kopfhörer
- **Technische Basis:** Phaser 4.2.1, JavaScript mit ES-Modulen, Vite und Web Audio

## 1. Ausgangslage

Zwei Personen spielen gleichzeitig an einem Computer auf derselben vierspurigen Straße. Eine Person spielt visuell, die andere vollständig ohne visuelle Hilfe und trägt Kopfhörer. Beide steuern je ein Auto, weichen Fahrzeugen und anderen Hindernissen aus und sammeln Items. Gewertet werden Überlebensdauer und Punkte.

Das Audio ist für die blinde Person keine Ergänzung zur Grafik, sondern die primäre Spieloberfläche. Der vollständige Ablauf muss deshalb ohne Bildschirm bedienbar sein: Einrichtung, Kalibrierung, Spiel, Statusabfrage, Pause und Ergebnis.

## 2. Ziele und Grenzen

### Ziele

- Vier Spuren, Entfernung, Annäherung und Objektart zuverlässig hörbar machen.
- Mehrere gleichzeitige Klangquellen verständlich priorisieren.
- Hindernisse, Items und das gegnerische Spielerauto eindeutig unterscheiden.
- Tastatur und Controller ohne visuelle Hilfe bedienbar machen.
- Dem blinden und dem sehenden Spieler vergleichbare Reaktionsfenster geben.
- Audioparameter unabhängig von der Spiellogik abstimmbar und testbar halten.

### Nicht Bestandteil dieses Designs

- Netzwerk-Mehrspielerbetrieb
- getrennte Audioausgaben für zwei Kopfhörer oder Soundkarten
- Smartphone- und Touch-Bedienung
- Unterstützung anderer Phaser-Versionen als der im Projekt festgeschriebenen Version 4.2.1
- eine rein monaurale Variante des vollständig barrierefreien Spielmodus

## 3. Leitprinzipien

1. **Redundanz:** Kritische Informationen werden nie nur durch Lautstärke oder nur durch Stereoposition vermittelt. Position, Klangfarbe, Rhythmus und Dringlichkeit ergänzen sich.
2. **Priorisierung:** Höchstens zwei bis drei Quellen stehen gleichzeitig im akustischen Vordergrund.
3. **Stabile Bedeutung:** Ein Klangmotiv behält während des gesamten Spiels dieselbe Bedeutung.
4. **Kurze Reaktionssignale:** Im schnellen Spiel werden Earcons und Pulse statt Sprache verwendet. Sprache dient Menüs und Statusinformationen.
5. **Faire Informationsgrenze:** Eine akustische Quelle wird nicht früher relevant als die entsprechende visuelle Information.
6. **Eine gemeinsame Wahrheit:** Physik, Spawnlogik, Kollisionen und Punkteberechnung sind für beide Spieler identisch. Audio beobachtet den Zustand, verändert ihn aber nicht.

## 4. Architektur

### 4.1 `AccessibleAudioController`

Der Controller ist die einzige Schnittstelle zwischen Spielwelt und barrierefreiem Audio. Pro Aktualisierung erhält er eine Momentaufnahme mit:

- ID und Art jedes relevanten Objekts,
- Spur und relativer Längsentfernung,
- relativer Geschwindigkeit,
- möglicher Zeit bis zur Kollision,
- Einsammelbarkeit und Gefahrenstatus,
- Zustand des gegnerischen Spielerautos.

Der Controller besitzt keine Schreibrechte auf Physik oder Punkte. Dadurch kann die Audiovariante weder Spawnregeln noch Kollisionen oder Bewegung beeinflussen.

### 4.2 `AudioCoordinateMapper`

Die Audiopositionen werden aus logischen Fahrdaten und nicht direkt aus Bildschirmkoordinaten erzeugt.

- Die vier Fahrspuren besitzen feste X-Mittelpunkte, die aus `track1.displayWidth` und der Canvas-Mitte berechnet werden.
- Die Straße verläuft entlang der Z-Achse.
- Der Hörer bleibt am Ursprung und blickt in Fahrtrichtung entlang der negativen Z-Achse.
- Da `Car.move()` frei horizontal lenkt, ist die hörbare X-Position die skalierte Differenz zwischen der tatsächlichen X-Position der Quelle und der X-Position des blinden Spielerautos. Die logische Spur des Spielerautos wird nur für Priorisierung, Status und Spurgrenzen aus seiner X-Position abgeleitet.
- Objekte vor dem Auto erhalten negative Z-Werte, vorbeigefahrene Objekte positive Z-Werte.
- Kamera, Auflösung und Canvas-Skalierung beeinflussen die Audioposition nicht.

Die Abstände zwischen den vier X-Positionen sind konfigurierbar und werden in Nutzertests abgestimmt. Die Positionen bleiben innerhalb einer Runde unverändert.

### 4.3 `SpatialAudioSource`

Jede hörbare Weltquelle wird durch einen Adapter gekapselt. Dieser verwaltet Phaser-Sound, räumliche Position, Lautstärke, Ein- und Ausblendung sowie Wiederverwendung. Für die Ortung werden mono aufgenommene Audiodateien ohne bereits eingebautes Stereo-Panning verwendet.

Die Quellen verwenden Phasers `SpatialSoundConfig` mit HRTF-Panning. Entfernung und Absenkung werden zunächst mit einem linearen Distanzmodell konfiguriert, weil sich damit eine feste hörbare Reichweite gezielt abstimmen lässt. Die endgültigen Werte für Referenzdistanz, Maximaldistanz und Abfallfaktor liegen in einer zentralen Audiokonfiguration.

### 4.4 `ThreatPrioritizer`

Der Priorisierer ordnet Quellen in dieser Reihenfolge:

1. unmittelbare Kollisionsgefahr in der aktuellen Spur,
2. kürzeste Zeit bis zu einer möglichen Kollision,
3. erreichbares Item,
4. gegnerisches Spielerauto,
5. sonstige Fahrzeuge und Umgebung.

Maximal drei Quellen erhalten gleichzeitig Vordergrundlautstärke. Weitere Quellen bleiben leise hörbar und werden weich ein- oder ausgeblendet. Prioritätswechsel dürfen keine Sprünge, Klicks oder abrupten Richtungswechsel erzeugen.

### 4.5 `FeedbackBus` und `SpeechOutput`

Der `FeedbackBus` spielt kurze, mittige Rückmeldungen für Spurwechsel, Straßenrand, Einsammeln, Treffer, Start und Pause. `SpeechOutput` kapselt gesprochene Menüs, Statusabfragen und Ergebnisse. Feste Ansagen werden als geprüfte Audiodateien ausgeliefert. Dynamische Zahlen werden aus aufgenommenen Zahl- und Ziffernfragmenten zusammengesetzt; lokale Sprachsynthese ist nur eine optionale Alternative und keine Voraussetzung. Dieselben Informationen liegen zusätzlich in zugänglichen HTML-Elementen für den Screenreader vor.

## 5. Klangsprache

| Information                 | Primäres Merkmal                                    | Redundantes Merkmal                            |
| --------------------------- | --------------------------------------------------- | ---------------------------------------------- |
| Spur eines Objekts          | feste horizontale Position                          | Spurwechsel- und Kalibrierungstöne             |
| Entfernung                  | Lautstärke und räumliche Tiefe                      | Annäherungsrhythmus                            |
| Kollisionsgefahr            | schneller werdender Warnpuls an der Quellenposition | Absenkung unwichtiger Quellen                  |
| neutrales Fahrzeug          | Motor- oder Reifengeräusch                          | objekttypische Klangfarbe                      |
| gegnerisches Spielerauto    | eigener kontinuierlicher Motorsound                 | unverwechselbares kurzes Motiv bei Annäherung  |
| sammelbares Item            | heller räumlicher Signalton                         | objekttypischer Rhythmus                       |
| Überqueren einer Spurgrenze | kurzer mittiger Bestätigungston                     | Weltquellen verschieben sich relativ zum Hörer |
| Straßenrand                 | deutliches Fehlersignal                             | keine Bewegung in eine weitere Spur            |
| Treffer oder Einsammeln     | kurzer mittiger Ereigniston                         | gesonderte Klangfarbe für positiv und negativ  |

Motor, Musik und Atmosphäre bleiben unterhalb der Informationssignale. Kritische Warnungen senken unwichtige Quellen vorübergehend ab. Sprache senkt alle nicht kritischen Quellen für die Dauer der Ansage ab. Musik kann separat deaktiviert werden; Warnungen, Sprache und Umgebung erhalten getrennte Lautstärkeregler.

## 6. Vollständig nichtvisueller Ablauf

Vor dem Rennen führt ein kurzer Assistent durch:

1. Rolle und Eingabegerät,
2. linken und rechten Kopfhörertest,
3. Lautstärkeeinstellung,
4. Demonstration aller vier Spurpositionen,
5. Erklärung der Tasten oder Controllerbelegung,
6. bewusste Startbestätigung.

Die bestehende freie Lenkung über A/D, Pfeiltasten oder Gamepad-Stick bleibt erhalten. Beim Überqueren einer der vier Spurgrenzen bestätigt ein kurzer Ton die neue Spur; am Straßenrand ertönt ein anderes Signal. Ein Statuseingang nennt knapp aktuelle Spur, Punkte und verbleibende Leben. Bei Fokusverlust, getrenntem Controller oder unterbrochener Audioausgabe pausiert das Spiel automatisch. Vor dem Fortsetzen läuft erneut ein kurzer Countdown.

Menüs werden als echte fokussierbare HTML-Bedienelemente außerhalb des Canvas umgesetzt. Tastatur, Controlleransagen und Screenreader dürfen denselben Spielzustand bedienen, ohne voneinander getrennte Menülogik zu erzeugen. Der erste bestätigende Nutzereingang entsperrt den browserseitigen Audiokontext.

## 7. Laufzeit und Datenfluss

Pro Spielaktualisierung geschieht Folgendes:

1. Die Spielszene veröffentlicht eine schreibgeschützte Momentaufnahme relativ zum blinden Spielerauto.
2. Der Audiocontroller verwirft Objekte außerhalb des gemeinsamen visuellen und akustischen Relevanzhorizonts.
3. Der Koordinatenmapper berechnet X- und Z-Positionen.
4. Der Priorisierer bestimmt Vordergrundquellen und Mischpegel.
5. Bestehende Klangquellen werden weich an ihre neuen Positionen geführt; neue Quellen werden aus einem Pool bezogen.
6. Entfernte oder zerstörte Objekte blenden aus und geben ihre Quelle an den Pool zurück.

Die räumlichen Zielpositionen werden zunächst mit 30 Aktualisierungen pro Sekunde berechnet und zwischen den Werten weich interpoliert, während die Spiellogik mit ihrer eigenen Aktualisierungsrate weiterläuft. Die Rate ist zentral konfigurierbar, darf aber nur reduziert werden, wenn die Browser- und Nutzertests weiterhin flüssige Richtungsbewegungen bestätigen.

## 8. Fairness

- Akustischer und visueller Relevanzhorizont basieren auf derselben logischen Entfernung.
- Eine Gefahr wird akustisch in demselben Spieltick aktiv, in dem sie visuell relevant wird.
- Offscreen-Informationen werden nicht exklusiv über Audio verraten.
- Das gegnerische Auto ist nur entsprechend seiner für den sehenden Spieler verfügbaren Position hörbar.
- Spawnfolge, Geschwindigkeit, Kollisionstoleranz und Punkte sind identisch.
- Der sehende Spieler erhält keinen zusätzlichen Spielton; die Systemausgabe liegt auf dem Kopfhörer des blinden Spielers.
- Telemetrie erfasst Reaktionszeit, Kollisionen, Überlebensdauer und Items getrennt nach Rolle, ohne die Spielentscheidung zu beeinflussen.

Als erster Balance-Richtwert sollen nach gleicher Übungszeit die Medianwerte für Überlebensdauer und gesammelte Items beider Rollen höchstens 20 Prozent auseinanderliegen. Größere Abweichungen führen zu einer Anpassung der Audiohinweise, nicht zu verdeckt unterschiedlichen Physikregeln.

## 9. Fehlerverhalten

- Fehlen Web Audio oder räumliche Wiedergabe, startet der vollständig barrierefreie Modus nicht mit einem stillen Mono-Fallback. Eine hörbare und als HTML verfügbare Meldung erklärt den Fehler.
- Fehlt ein verpflichtender Sound oder Sprachbaustein oder schlägt dessen Dekodierung fehl, bleibt der Start gesperrt und nennt die betroffene Kategorie.
- Bei suspendiertem Audiokontext pausiert die Runde. Nach erfolgreicher Wiederaufnahme folgt ein Countdown.
- Bei getrenntem Eingabegerät pausiert die Runde und wartet auf erneute Zuordnung.
- Quellen werden gepoolt und begrenzt. Ein Ressourcenengpass entfernt zuerst Atmosphäre, niemals aktive Warnungen oder Bedienungsfeedback.
- Eine Statusansage wird abgebrochen, sobald eine kritische Warnung beginnt.

## 10. Tests und Abnahmekriterien

### Automatisierte Tests

- korrekte und symmetrische Spur-zu-X-Zuordnung,
- korrekte relative Entfernung vor und hinter dem Spieler,
- Prioritätsreihenfolge bei konkurrierenden Quellen,
- höchstens drei Vordergrundquellen,
- gleicher Aktivierungstick für visuelle und akustische Relevanz,
- Erzeugen, Aktualisieren, Ausblenden und Wiederverwenden räumlicher Quellen,
- korrekte Spurableitung aus der frei beweglichen X-Position und genau eine Bestätigung pro überquerter Spurgrenze,
- Pause bei Fokus-, Audio- und Controllerverlust,
- Audiocontroller kann den Spielzustand nicht verändern.

### Browser- und Integrationstests

- aktuelle Versionen von Chrome beziehungsweise Edge und Firefox,
- Tastatur und mindestens ein verbreiteter XInput-kompatibler Controller,
- Start nach Browser-Autoplay-Sperre,
- Unterbrechung und Wiederaufnahme des Audiokontexts,
- vollständiger Durchlauf mit verborgenem beziehungsweise ausgeschaltetem Bildschirm.

### Nutzertests

Blinde Testpersonen werden bereits mit einem frühen spielbaren Audioprototyp einbezogen. Nach der Einführung gelten folgende erste Zielwerte:

- mindestens 90 Prozent richtige Erkennung der vier demonstrierten Spuren,
- mindestens 90 Prozent richtige Richtungsentscheidung bei einer einzelnen dringenden Gefahr,
- verständliche Priorität bei bis zu drei gleichzeitig relevanten Quellen,
- vollständiger Ablauf von Einrichtung bis Ergebnis ohne sehende Hilfe,
- keine Verwechslung zwischen Hindernis, Item und gegnerischem Auto in den dokumentierten Testszenarien,
- Balance-Richtwert aus Abschnitt 8 nach einer vergleichbaren Übungsphase.

Fehler werden nicht nur als Kollision gewertet. Auch verspätete Reaktionen, falsche Spurmodelle, überhörte Items und unverständliche Mischungen werden protokolliert und zur Abstimmung der zentralen Audiokonfiguration verwendet.

## 11. Projektnahe JavaScript-Beispiele

Die folgenden Beispiele entsprechen dem Projektstand mit Phaser 4.2.1, JavaScript-ES-Modulen und Vite. Sie zeigen den im Branch eingebauten ersten Schritt: Gegnerfahrzeuge und Spieler 2 werden relativ zu Spieler 1 räumlich hörbar. Spieler 1 (this.car) ist in diesem Beispiel immer der Hörer.

Die Lösung erzeugt den Motorklang direkt mit der Web Audio API. Es werden deshalb keine zusätzlichen MP3- oder OGG-Dateien benötigt. Wenn Web Audio im Browser nicht verfügbar ist, bleibt das Spiel ohne diesen Beispielklang lauffähig.

### 11.1 Zentrale Audiokonfiguration

Die vier visuellen Spuren dienen als Maßstab. Das Spiel erlaubt weiterhin die vorhandene freie Links-rechts-Bewegung; die aktuelle X-Differenz wird nur durch eine Spurbreite geteilt, damit die hörbare seitliche Entfernung stabil bleibt.

```js
// src/accessibility/audio/carAudioConfig.js
export const CAR_AUDIO_CONFIG = Object.freeze({
  laneCount: 4,
  audioUnitsPerLane: 2,
  maxHorizontalUnits: 6,
  maxLongitudinalUnits: 30,
  audibleAheadFactor: 1.2,
  audibleBehindFactor: 0.2,
  maxSources: 3,
  enemyFrequency: 72,
  opponentFrequency: 108,
  baseGain: 0.08,
  smoothingSeconds: 0.04,
});
```

### 11.2 Phaser-Koordinaten in den Klangraum übertragen

Ein vorausfahrendes oder von oben kommendes Fahrzeug erhält einen negativen Z-Wert. Links und rechts werden relativ zur aktuellen Position von Spieler 1 berechnet, nicht relativ zur Bildschirmmitte.

```js
// src/accessibility/audio/carSpatialMath.js
import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function mapCarToAudioPosition(sourceCar, listenerCar, roadWidth, viewportHeight) {
  const laneWidth = roadWidth / CAR_AUDIO_CONFIG.laneCount;
  const horizontalOffset = sourceCar.x - listenerCar.x;
  const forwardDistance = listenerCar.y - sourceCar.y;

  return {
    x: clamp(
      (horizontalOffset / laneWidth) * CAR_AUDIO_CONFIG.audioUnitsPerLane,
      -CAR_AUDIO_CONFIG.maxHorizontalUnits,
      CAR_AUDIO_CONFIG.maxHorizontalUnits,
    ),
    y: 0,
    z: -clamp(
      (forwardDistance / viewportHeight) * CAR_AUDIO_CONFIG.maxLongitudinalUnits,
      -CAR_AUDIO_CONFIG.maxLongitudinalUnits,
      CAR_AUDIO_CONFIG.maxLongitudinalUnits,
    ),
    forwardDistance,
  };
}
```

Die Auswahl bleibt bewusst klein. Von EnemyCar-Instanzen und Spieler 2 werden höchstens drei aktive Fahrzeuge im hörbaren Fenster gewählt.

```js
export function selectAudibleCars(
  candidates,
  listenerCar,
  viewportHeight,
  limit = CAR_AUDIO_CONFIG.maxSources,
) {
  const minimumDistance = -viewportHeight * CAR_AUDIO_CONFIG.audibleBehindFactor;
  const maximumDistance = viewportHeight * CAR_AUDIO_CONFIG.audibleAheadFactor;

  return candidates
    .filter(({ target }) => {
      const distance = listenerCar.y - target.y;
      return (
        target.active && !target.dead && distance >= minimumDistance && distance <= maximumDistance
      );
    })
    .sort(
      (left, right) =>
        Math.abs(listenerCar.y - left.target.y) - Math.abs(listenerCar.y - right.target.y),
    )
    .slice(0, limit);
}
```

### 11.3 Synthetischen 3D-Motor erzeugen

SpatialEngineSource baut pro hörbarem Fahrzeug diese Kette auf:

```text
OscillatorNode -> BiquadFilterNode -> GainNode -> PannerNode -> Phaser-Ausgang
```

Der Panner verwendet HRTF. Positionsänderungen und Lautstärke werden geglättet, damit die Aktualisierung in jedem Frame nicht knackt oder springt.

```js
// src/accessibility/audio/SpatialEngineSource.js
import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';

export class SpatialEngineSource {
  constructor(audioContext, destination, frequency) {
    this.audioContext = audioContext;
    this.destroyed = false;

    this.oscillator = audioContext.createOscillator();
    this.filter = audioContext.createBiquadFilter();
    this.gain = audioContext.createGain();
    this.panner = audioContext.createPanner();

    this.oscillator.type = 'sawtooth';
    this.oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(240, audioContext.currentTime);
    this.gain.gain.setValueAtTime(0, audioContext.currentTime);

    this.panner.panningModel = 'HRTF';
    this.panner.distanceModel = 'linear';
    this.panner.refDistance = 1;
    this.panner.maxDistance = CAR_AUDIO_CONFIG.maxLongitudinalUnits;
    this.panner.rolloffFactor = 1;

    this.oscillator.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.panner);
    this.panner.connect(destination);
    this.oscillator.start();
  }

  setPosition({ x, y, z }) {
    if (this.destroyed) return;

    const now = this.audioContext.currentTime;
    const smoothing = CAR_AUDIO_CONFIG.smoothingSeconds;

    this.panner.positionX.setTargetAtTime(x, now, smoothing);
    this.panner.positionY.setTargetAtTime(y, now, smoothing);
    this.panner.positionZ.setTargetAtTime(z, now, smoothing);
    this.gain.gain.setTargetAtTime(CAR_AUDIO_CONFIG.baseGain, now, smoothing);
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    this.oscillator.stop();
    this.oscillator.disconnect();
    this.filter.disconnect();
    this.gain.disconnect();
    this.panner.disconnect();
  }
}
```

Die Quelle wird an scene.sound.destination angeschlossen. Dadurch gelten Phasers Stummschaltung und Gesamtlautstärke auch für den synthetischen Klang.

### 11.4 Quellen für Fahrzeuge verwalten

CarSpatialAudioSystem erhält normale Phaser-Objekte, wählt die relevanten Fahrzeuge aus und verwendet das Fahrzeugobjekt selbst als Map-Schlüssel. Verlässt ein Auto die Auswahl oder wird zerstört, wird auch seine Audioquelle entfernt.

```js
// src/accessibility/audio/CarSpatialAudioSystem.js
import { mapCarToAudioPosition, selectAudibleCars } from './carSpatialMath.js';

export class CarSpatialAudioSystem {
  constructor({ sourceFactory, isEnemyCar }) {
    this.sourceFactory = sourceFactory;
    this.isEnemyCar = isEnemyCar;
    this.candidates = [];
    this.sources = new Map();
  }

  update({ listenerCar, roadObjects, opponentCar, roadWidth, viewportHeight }) {
    if (!listenerCar?.active || listenerCar.dead) {
      this.clear();
      return;
    }

    this.candidates.length = 0;

    for (const roadObject of roadObjects) {
      if (this.isEnemyCar(roadObject)) {
        this.candidates.push({
          target: roadObject,
          kind: 'enemy',
        });
      }
    }

    if (opponentCar && opponentCar !== listenerCar) {
      this.candidates.push({
        target: opponentCar,
        kind: 'opponent',
      });
    }

    const selected = selectAudibleCars(this.candidates, listenerCar, viewportHeight);

    this.synchronizeSources(selected, listenerCar, roadWidth, viewportHeight);
  }
}
```

Die vollständige Klasse enthält zusätzlich synchronizeSources, clear und destroy. Diese Methoden aktualisieren Positionen, räumen nicht mehr ausgewählte Quellen auf und stoppen beim Verlassen der Szene sämtliche Oszillatoren.

### 11.5 Nur mit Phasers Web-Audio-Backend starten

Die kleine Factory kapselt den Browser- und Phaser-spezifischen Teil. Gegner erhalten 72 Hz, Spieler 2 erhält 108 Hz, damit beide Typen neben ihrer Position auch an der Tonhöhe unterscheidbar sind.

```js
// src/accessibility/audio/createCarSpatialAudioSystem.js
import Phaser from 'phaser';

import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';
import { CarSpatialAudioSystem } from './CarSpatialAudioSystem.js';
import { SpatialEngineSource } from './SpatialEngineSource.js';

export function createCarSpatialAudioSystem(scene, isEnemyCar) {
  const WebAudioSoundManager = Phaser.Sound?.WebAudioSoundManager;

  if (!WebAudioSoundManager || !(scene.sound instanceof WebAudioSoundManager)) {
    return null;
  }

  return new CarSpatialAudioSystem({
    isEnemyCar,
    sourceFactory: (kind) => {
      const frequency =
        kind === 'opponent' ? CAR_AUDIO_CONFIG.opponentFrequency : CAR_AUDIO_CONFIG.enemyFrequency;

      return new SpatialEngineSource(scene.sound.context, scene.sound.destination, frequency);
    },
  });
}
```

### 11.6 In die vorhandene GameScene einbinden

Die Aktivierung liest beide bereits im Projekt vorkommenden Registry-Schlüssel. Der erste gesetzte Wert gewinnt: accessibilityMode oder, zur Kompatibilität mit dem HTML-Schalter, accessibility enabled.

```js
// Ausschnitt aus src/scenes/GameScene.js
import Phaser from 'phaser';

import { createCarSpatialAudioSystem } from '../accessibility/audio/createCarSpatialAudioSystem.js';
import EnemyCar from '../objects/EnemyCar.js';

// Nach createPlayer() und createTrack():
const accessibilityEnabled =
  this.registry.get('accessibilityMode') ?? this.registry.get('accessibility enabled') ?? false;

this.carSpatialAudio = accessibilityEnabled
  ? createCarSpatialAudioSystem(this, (roadObject) => roadObject instanceof EnemyCar)
  : null;

this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.carSpatialAudio?.destroy();
  this.carSpatialAudio = null;
});
```

Am Ende von update werden die tatsächlichen Projektobjekte übergeben. Player 1 ist this.car und damit der Hörer. Player 2 ist this.secondCar. Gegner befinden sich zusammen mit anderen Objekten in roadObjects; die Factory filtert mit EnemyCar. Die Straßenbreite stammt aus track1.displayWidth.

```js
this.carSpatialAudio?.update({
  listenerCar: this.car,
  roadObjects: this.roadObjects,
  opponentCar: this.secondCar,
  roadWidth: this.track1.displayWidth,
  viewportHeight: this.scale.height,
});
```

### 11.7 Tests mit dem eingebauten Node-Test-Runner

Die reine Mathematik, der Lebenszyklus des Audio-Graphen und die Quellenverwaltung laufen ohne Browser mit node:test. Die Web-Audio-Grenze wird durch kleine Attrappen ersetzt.

```js
// test/accessibility/carSpatialMath.test.js
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mapCarToAudioPosition,
  selectAudibleCars,
} from '../../src/accessibility/audio/carSpatialMath.js';

test('maps a centered car ahead of the listener to negative z', () => {
  const position = mapCarToAudioPosition({ x: 500, y: 200 }, { x: 500, y: 800 }, 800, 1000);

  assert.deepEqual(position, {
    x: 0,
    y: 0,
    z: -18,
    forwardDistance: 600,
  });
});

test('keeps only the three nearest active cars', () => {
  const listener = { x: 500, y: 800 };
  const candidates = [
    {
      target: { x: 500, y: 700, active: true },
      kind: 'enemy',
    },
    {
      target: { x: 500, y: 600, active: true },
      kind: 'enemy',
    },
    {
      target: { x: 500, y: 500, active: true },
      kind: 'enemy',
    },
    {
      target: { x: 500, y: 400, active: true },
      kind: 'enemy',
    },
  ];

  assert.equal(selectAudibleCars(candidates, listener, 1000).length, 3);
});
```

Ausgeführt werden die Tests mit:

```bash
npm test
```

Diese Beispiele decken die Fahrzeugortung ab. Für vollständiges Spielen ohne visuelle Hilfe fehlen weiterhin unter anderem Item-Beacons, Start- und Statusansagen, Kollisionsvorwarnung, Audio-Menüführung, Kopfhörertest sowie Tests mit blinden Spielern.

## 12. Referenzen

- [Phaser: SpatialSoundConfig](https://docs.phaser.io/api-documentation/typedef/types-sound)
- [Phaser: WebAudioSoundManager](https://docs.phaser.io/api-documentation/class/sound-webaudiosoundmanager)
- [Phaser-Quellcode: WebAudioSound und PannerNode](https://github.com/phaserjs/phaser/blob/v3.90.0/src/sound/webaudio/WebAudioSound.js)
- [MDN: Grundlagen der räumlichen Web-Audio-Wiedergabe](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics)
- [MDN: PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/PannerNode)
