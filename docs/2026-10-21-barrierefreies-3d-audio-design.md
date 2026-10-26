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

Der `FeedbackBus` spielt kurze Rückmeldungen für Spurwechsel, Straßenrand, Einsammeln, Treffer, Start und Pause. Bedien- und Sammelhinweise liegen mittig. Der Crash des Hörerautos liegt ebenfalls mittig; ein Crash des gegnerischen Spielerautos bleibt dagegen relativ zum Hörer räumlich positioniert. `SpeechOutput` kapselt gesprochene Menüs, Statusabfragen und Ergebnisse. Feste Ansagen werden als geprüfte Audiodateien ausgeliefert. Dynamische Zahlen werden aus aufgenommenen Zahl- und Ziffernfragmenten zusammengesetzt; lokale Sprachsynthese ist nur eine optionale Alternative und keine Voraussetzung. Dieselben Informationen liegen zusätzlich in zugänglichen HTML-Elementen für den Screenreader vor.

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
| Treffer                     | Hörer mittig, gegnerischer Spieler relativ          | kurze negative Klangfarbe                      |
| Einsammeln                  | kurzer mittiger Ereigniston                         | eigene positive Klangfarbe                     |

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

Die folgenden Beispiele entsprechen dem Projektstand mit Phaser 4.2.1, JavaScript-ES-Modulen und Vite. Gegnerfahrzeuge und Spieler 2 werden relativ zu Spieler 1 räumlich hörbar. Spieler 1 (this.car) ist der Hörer und besitzt zusätzlich einen leiseren, mittigen Eigenmotor. Dessen Tonhöhe folgt der Spielgeschwindigkeit. Beim stabilen Spurwechsel ertönen ein kurzer Ton von tief (links) nach hoch (rechts) und eine englische Ansage wie „Lane three“. Ein wirksamer Zusammenstoß erhält zusätzlich einen kurzen räumlichen Crash-Klang.

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
  listenerFrequencyMin: 84,
  listenerFrequencyMax: 132,
  gameSpeedMin: 700,
  gameSpeedMax: 1600,
  laneHysteresisFactor: 0.1,
  baseGain: 0.08,
  listenerGain: 0.035,
  fadeInSeconds: 0.25,
  fadeOutSeconds: 0.25,
  frequencySmoothingSeconds: 0.08,
  laneCueFrequencies: Object.freeze([330, 440, 550, 660]),
  laneCueGain: 0.055,
  laneCueAttackSeconds: 0.015,
  laneCueDurationSeconds: 0.16,
  crashStartFrequency: 140,
  crashEndFrequency: 45,
  crashFilterFrequency: 500,
  crashGain: 0.18,
  crashAttackSeconds: 0.008,
  crashDurationSeconds: 0.28,
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

Der Eigenmotor wird separat behandelt und zählt deshalb nicht gegen diese drei räumlichen Fremdquellen. mapSpeedToListenerFrequency bildet die Straßengeschwindigkeit geklemmt von 700–1600 auf 84–132 Hz ab. resolveRoadLane teilt die Straße in vier Bereiche und verlangt zehn Prozent einer Spurbreite Abstand zur Grenze, bevor ein erneuter Spurhinweis ausgelöst wird. Dadurch wiederholt sich die Ansage nicht bei kleinen Positionsschwankungen.

### 11.3 Synthetischen 3D-Motor erzeugen

SpatialEngineSource baut pro hörbarem Fahrzeug diese Kette auf:

```text
OscillatorNode -> BiquadFilterNode -> GainNode -> PannerNode -> Phaser-Ausgang
```

Der Panner verwendet HRTF. Eine neue Quelle startet bei Lautstärke null und blendet über 250 ms ein. destroy blendet ebenfalls über 250 ms aus, plant erst danach das Ende des Oszillators und trennt die Knoten im ended-Ereignis. Dadurch entstehen beim Erzeugen und Entfernen keine harten Sprünge. Positions- und Frequenzänderungen werden unabhängig davon geglättet.

```js
// Auszüge aus src/accessibility/audio/SpatialEngineSource.js
export class SpatialEngineSource {
  constructor(
    audioContext,
    destination,
    frequency,
    { targetGain = CAR_AUDIO_CONFIG.baseGain } = {},
  ) {
    this.audioContext = audioContext;
    this.targetGain = targetGain;
    this.audible = false;
    this.destroyed = false;

    // Erzeugung und Verbindung von oscillator, filter, gain und panner
    this.gain.gain.setValueAtTime(0, audioContext.currentTime);
    this.oscillator.onended = () => this.disconnectNodes();
    this.oscillator.start();
  }

  setPosition({ x, y, z }) {
    if (this.destroyed) return;

    const now = this.audioContext.currentTime;
    const smoothing = CAR_AUDIO_CONFIG.smoothingSeconds;
    this.panner.positionX.setTargetAtTime(x, now, smoothing);
    this.panner.positionY.setTargetAtTime(y, now, smoothing);
    this.panner.positionZ.setTargetAtTime(z, now, smoothing);

    if (!this.audible) {
      this.audible = true;
      this.fadeInStartTime = now;
      this.setGainAt(0, now);
      this.gain.gain.linearRampToValueAtTime(this.targetGain, now + CAR_AUDIO_CONFIG.fadeInSeconds);
    }
  }

  setFrequency(frequency) {
    if (this.destroyed) return;

    this.oscillator.frequency.setTargetAtTime(
      frequency,
      this.audioContext.currentTime,
      CAR_AUDIO_CONFIG.frequencySmoothingSeconds,
    );
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    const now = this.audioContext.currentTime;
    const stopTime = now + CAR_AUDIO_CONFIG.fadeOutSeconds;
    const currentGain = this.getCurrentGain(now);
    this.setGainAt(currentGain, now);
    this.gain.gain.linearRampToValueAtTime(0, stopTime);
    this.oscillator.stop(stopTime);
  }
}
```

getCurrentGain berechnet den aktuellen linearen Hüllkurvenwert auch dann, wenn der Fade-in noch läuft. setGainAt entfernt ältere Automationsereignisse und setzt bei now einen ausdrücklichen Startwert. Damit beginnt die Ausblendrampe garantiert am gerade hörbaren Pegel.

Die Quelle wird an scene.sound.destination angeschlossen. Dadurch gelten Phasers Stummschaltung und Gesamtlautstärke auch für den synthetischen Klang.

### 11.4 Eigenmotor, Fremdfahrzeuge und Spurhinweise verwalten

CarSpatialAudioSystem besitzt eine dauerhafte Quelle für Spieler 1 und bis zu drei ausgewählte Fremdfahrzeuge. Der Eigenmotor liegt bei X/Y/Z = 0, ist leiser als die anderen Motoren und erhält in jedem Frame die aus gameSpeed berechnete Frequenz. Die räumliche Auswahl für EnemyCar und Spieler 2 bleibt unverändert.

```js
// Auszüge aus src/accessibility/audio/CarSpatialAudioSystem.js
update({
  listenerCar,
  roadObjects,
  opponentCar,
  roadLeftEdge,
  roadWidth,
  viewportHeight,
  gameSpeed,
}) {
  if (!listenerCar?.active || listenerCar.dead) {
    this.clear();
    return;
  }

  this.updateListener(
    listenerCar,
    roadLeftEdge,
    roadWidth,
    gameSpeed,
  );

  // Anschließend: höchstens drei Gegner-/Opponent-Quellen auswählen,
  // positionieren und nicht mehr benötigte Quellen ausblenden.
}

updateListener(listenerCar, roadLeftEdge, roadWidth, gameSpeed) {
  if (!this.listenerSource) {
    this.listenerSource = this.sourceFactory('listener');
    this.listenerSource.setPosition({ x: 0, y: 0, z: 0 });
  }

  this.listenerSource.setFrequency(
    mapSpeedToListenerFrequency(gameSpeed),
  );

  const nextLane = resolveRoadLane(
    listenerCar.x,
    roadLeftEdge,
    roadWidth,
    this.currentLane,
  );

  if (nextLane !== this.currentLane) {
    this.currentLane = nextLane;
    this.laneCue.announce(nextLane);
  }
}
```

LaneCueAnnouncer erzeugt pro Hinweis einen kurzen Sinuston. Die Frequenzen 330, 440, 550 und 660 Hz stehen von links nach rechts für Spur eins bis vier. Wenn die Speech-Synthesis-API verfügbar ist, wird gleichzeitig die passende englische Ansage gesprochen. Nur `utterance.lang = 'en-US'` reicht dafür nicht zuverlässig aus, weil einige Browser trotzdem ihre deutsche Standardstimme verwenden. Deshalb sucht die Implementierung mit `speechSynthesis.getVoices()` zuerst explizit nach einer installierten en-US-Stimme und danach nach einer anderen englischen Stimme. Das Ereignis `voiceschanged` aktualisiert die Auswahl, falls der Browser seine Stimmen erst nach dem Szenenstart bereitstellt.

```js
selectEnglishVoice() {
  const voices = this.speechSynthesis?.getVoices?.() ?? [];

  return (
    voices.find(({ lang }) => lang?.toLowerCase() === 'en-us') ??
    voices.find(({ lang }) => lang?.toLowerCase().startsWith('en')) ??
    null
  );
}

const utterance = new this.Utterance(`Lane ${LANE_NAMES[safeLaneIndex]}`);
utterance.voice = this.englishVoice;
utterance.lang = this.englishVoice?.lang ?? 'en-US';
```

Eine noch laufende eigene Spuransage wird vor der nächsten ersetzt, damit immer die aktuelle Spur Vorrang hat. Ohne Speech-Synthesis bleibt der Ton als Fallback erhalten. Beim Tod des Hörers und beim Verlassen der Szene werden Sprache, der `voiceschanged`-Listener und aktive Cue-Knoten aufgeräumt.

### 11.5 Räumlichen Crash-Klang bei wirksamen Treffern erzeugen

CrashSoundPlayer erzeugt eine 280 ms lange, schnell abfallende Sägezahnwelle. Ein Tiefpass macht daraus einen kurzen dumpfen Aufprall. Die Position kommt aus demselben `mapCarToAudioPosition` wie bei den Fahrzeugmotoren: Ein Treffer von Spieler 1 liegt mittig, ein Treffer von Spieler 2 bleibt relativ zu Spieler 1 räumlich hörbar.

```js
// Auszüge aus src/accessibility/audio/CrashSoundPlayer.js
play({ x, y, z }) {
  const now = this.audioContext.currentTime;
  const endTime = now + CAR_AUDIO_CONFIG.crashDurationSeconds;

  oscillator.frequency.setValueAtTime(CAR_AUDIO_CONFIG.crashStartFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(
    CAR_AUDIO_CONFIG.crashEndFrequency,
    endTime,
  );
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(
    CAR_AUDIO_CONFIG.crashGain,
    now + CAR_AUDIO_CONFIG.crashAttackSeconds,
  );
  gain.gain.linearRampToValueAtTime(0, endTime);

  panner.panningModel = 'HRTF';
  panner.positionX.setValueAtTime(x, now);
  panner.positionY.setValueAtTime(y, now);
  panner.positionZ.setValueAtTime(z, now);
}
```

Die Trefferregel verhindert Doppel- und Fehlsignale: Ein bereits totes, unverwundbares oder durch ein Schild geschütztes Auto bleibt still. Wird ein Extraleben verbraucht oder endet der Treffer tödlich, wird der Crash-Klang vor der jeweiligen Spielreaktion gestartet. Bereits laufende Crash-Klänge dürfen ihre kurze Hüllkurve beim Szenenwechsel beenden und trennen danach selbstständig alle Audioknoten.

```js
// src/objects/carHit.js
export function handleCarHit({
  car,
  invulnerable,
  shieldActive,
  extraLifeActive,
  onEffectiveHit,
  useExtraLife,
  gameOver,
}) {
  const outcome = resolveCarHit({
    dead: car.dead,
    invulnerable,
    shieldActive,
    extraLifeActive,
  });

  if (outcome === 'ignored') return outcome;
  onEffectiveHit?.(car);

  if (outcome === 'extra-life') useExtraLife(car);
  else gameOver(car);

  return outcome;
}
```

### 11.6 Nur mit Phasers Web-Audio-Backend starten

Die Factory kapselt den Browser- und Phaser-spezifischen Teil. Gegner starten bei 72 Hz, Spieler 2 bei 108 Hz. Der eigene Motor startet leiser bei 84 Hz und kann bis 132 Hz ansteigen.

```js
// Auszüge aus src/accessibility/audio/createCarSpatialAudioSystem.js
import { getEngineVoice } from './engineVoice.js';
import { CrashSoundPlayer } from './CrashSoundPlayer.js';
import { LaneCueAnnouncer } from './LaneCueAnnouncer.js';

return new CarSpatialAudioSystem({
  crashSound: new CrashSoundPlayer(scene.sound.context, scene.sound.destination),
  isEnemyCar,
  laneCue: new LaneCueAnnouncer({
    audioContext: scene.sound.context,
    destination: scene.sound.destination,
    speechSynthesis: globalThis.speechSynthesis,
    Utterance: globalThis.SpeechSynthesisUtterance,
  }),
  sourceFactory: (kind) => {
    const { frequency, targetGain } = getEngineVoice(kind);

    return new SpatialEngineSource(scene.sound.context, scene.sound.destination, frequency, {
      targetGain,
    });
  },
});
```

Wenn scene.sound kein Phaser.Sound.WebAudioSoundManager ist, liefert die Factory weiterhin null und das Spiel läuft ohne das Beispielaudio weiter.

### 11.7 In die vorhandene GameScene einbinden

Die Aktivierung verwendet accessibilityMode als gemeinsamen Schlüssel. Der bisherige HTML-Schlüssel accessibility enabled dient als Migrationsfallback. Beide Schalter schreiben anschließend immer beide Werte, damit Canvas- und HTML-Einstellung nicht auseinanderlaufen.

```js
// src/accessibility/accessibilityMode.js
export function getAccessibilityMode(registry) {
  return registry.get('accessibilityMode') ?? registry.get('accessibility enabled') ?? false;
}

export function setAccessibilityMode(registry, enabled) {
  const normalizedValue = Boolean(enabled);
  registry.set('accessibilityMode', normalizedValue);
  registry.set('accessibility enabled', normalizedValue);
  return normalizedValue;
}
```

```js
// Ausschnitt aus src/scenes/GameScene.js
import Phaser from 'phaser';

import { getAccessibilityMode } from '../accessibility/accessibilityMode.js';
import { createCarSpatialAudioSystem } from '../accessibility/audio/createCarSpatialAudioSystem.js';
import EnemyCar from '../objects/EnemyCar.js';

// Nach createPlayer() und createTrack():
const accessibilityEnabled = getAccessibilityMode(this.registry);

this.carSpatialAudio = accessibilityEnabled
  ? createCarSpatialAudioSystem(this, (roadObject) => roadObject instanceof EnemyCar)
  : null;

this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.carSpatialAudio?.destroy();
  this.carSpatialAudio = null;
});
```

Am Ende von update werden die tatsächlichen Projektobjekte übergeben. Player 1 ist this.car und damit der Hörer. Player 2 ist this.secondCar. Gegner befinden sich zusammen mit anderen Objekten in roadObjects; die Factory filtert mit EnemyCar. Straßenkante und -breite stammen aus track1, die Motortonhöhe aus targetTrackSpeed.

```js
this.carSpatialAudio?.update({
  listenerCar: this.car,
  roadObjects: this.roadObjects,
  opponentCar: this.secondCar,
  roadLeftEdge: this.track1.x - this.track1.displayWidth / 2,
  roadWidth: this.track1.displayWidth,
  viewportHeight: this.scale.height,
  gameSpeed: targetTrackSpeed,
});
```

ItemManager leitet beide Kollisionspfade über dieselbe geprüfte Trefferregel. Damit gilt das Verhalten gleichermaßen für Spieler 1 und Spieler 2.

```js
lebenCheckCar1(car) {
  return handleCarHit({
    car,
    extraLifeActive: this.extraLifeActiveCar1,
    gameOver: (hitCar) => this.scene.gameOver(hitCar),
    invulnerable: this.invulnerableCar1,
    onEffectiveHit: (hitCar) => this.scene.carSpatialAudio?.playCrash(hitCar),
    shieldActive: this.schildAktivCar1,
    useExtraLife: (hitCar) => this.useExtraLifeCar1(hitCar),
  });
}
```

### 11.8 Tests mit dem eingebauten Node-Test-Runner

Die Einstellungssynchronisierung, reine Mathematik, Geschwindigkeitsabbildung, Spurhysterese, explizite englische Stimmauswahl, kombinierte Spurhinweise, Fade-Lebenszyklus, Crash-Regeln und Quellenverwaltung laufen ohne Browser mit node:test. Die Web-Audio- und Speech-Synthesis-Grenzen werden durch kleine Attrappen ersetzt.

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
