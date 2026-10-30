# Leaderboard-Signaturen verstehen

Diese Dokumentation erklärt, wie Sybit Kart Veränderungen am gespeicherten Leaderboard erkennt. Die Implementierung steht in [../src/utils/leaderboardSecurity.js](../src/utils/leaderboardSecurity.js).

## 1. Welches Problem lösen wir?

Das Leaderboard liegt im `localStorage` des Browsers. Dort bleiben Daten nach dem Schließen des Browsers normalerweise erhalten. Allerdings können Personen mit Zugriff auf die Entwicklertools diese Daten verändern oder löschen.

Beispiel: Jemand ersetzt eine gefahrene Distanz von `12` durch `900`. Ohne zusätzliche Prüfung könnte das Spiel nicht erkennen, dass dieser Wert nachträglich geändert wurde.

Unsere Lösung ergänzt die Daten um einen Prüfwert namens `sig`. Beim Laden berechnet das Spiel den erwarteten Prüfwert erneut und vergleicht beide Werte.

**Ziel ist, bestimmte Veränderungen sichtbar zu machen. Das ist kein vollständiger Cheat-Schutz.**

## 2. Was bedeutet hier „Signatur“?

Als vereinfachtes Modell:

```text
Signatur = Prüfverfahren(Schlüssel, Nachricht)
```

Die **Nachricht** sind die zu schützenden Daten in einem festgelegten Format. Der **Schlüssel** fließt zusätzlich in die Berechnung ein. Dieselbe Nachricht mit demselben Schlüssel erzeugt denselben Prüfwert.

Ändert sich die Nachricht, passt der gespeicherte Prüfwert normalerweise nicht mehr zum neu berechneten Wert.

Technisch verwenden wir im Normalfall **HMAC-SHA-256**. Das ist ein schlüsselbasierter Nachrichtenauthentifizierungscode, kurz **MAC**. Im Projekt nennen wir ihn vereinfachend „Signatur“. Es handelt sich nicht um eine digitale Signatur mit öffentlichem und privatem Schlüssel.

**Signieren ist nicht Verschlüsseln:** Namen und Ergebnisse bleiben lesbar. Die Signatur soll Veränderungen erkennen, nicht die Daten verstecken.

### Warum ist der Schlüssel im Browser nicht wirklich geheim?

In einem klassischen Backend würde nur der Server den Schlüssel kennen. Bei uns muss der Browser selbst signieren. Deshalb enthält der ausgelieferte JavaScript-Code auch den Schlüssel.

Die Aufteilung in `_S` und das Zusammensetzen durch `_secret()` sind lediglich Verschleierung. Wer den Code untersucht, kann den Schlüssel rekonstruieren oder die Signierfunktionen benutzen. Nicht exportierte Hilfsfunktionen sind ebenfalls keine Sicherheitsgrenze.

## 3. Zwei Schutzebenen

Wir signieren sowohl **einzelne Ergebnisse** als auch **die gesamte Liste**. Beide Prüfungen beantworten unterschiedliche Fragen.

| Ebene          | Geprüfte Frage                                                    | Beispiel einer erkannten Veränderung                        |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| Einzelsignatur | Passen Name, Distanz, Punkte und Token noch zusammen?             | Die Punkte eines Ergebnisses wurden geändert.               |
| Gesamtsignatur | Passen Version und vollständige gespeicherte Liste noch zusammen? | Ein Ergebnis wurde gelöscht oder die Reihenfolge verändert. |

Die Gesamtsignatur umfasst auch die Einzelsignaturen in den gespeicherten Einträgen. Eine gültige Gesamtsignatur ersetzt aber nicht die Einzelprüfung: Auch eine Liste mit ungültigen Einzelergebnissen kann als Gesamtliste signiert worden sein, etwa bei der Migration alter Daten.

### Einzelsignatur

`_buildMessage()` erstellt diese Nachricht:

```text
name|distance|score|token
```

Für einen Beispieleintrag:

```text
Alex|12.5|350|beispiel-token
```

Vorher werden die Werte vereinheitlicht: Der Name wird mit `trim()` bearbeitet, Distanz und Punkte werden in Zahlen umgewandelt und der Token in einen String. Deshalb bedeuten zum Beispiel `12.50` und `12.5` bei der Einzelprüfung dieselbe Distanz.

`signEntry(entry)` gibt eine Kopie des Eintrags mit berechneter `sig` zurück. `verifyEntry(entry)` prüft Struktur, vorhandene Signatur, Wertebereiche und anschließend die Signatur.

### Gesamtsignatur

`signLeaderboard(entries)` bildet einen JSON-Datenstand und signiert folgende Nachricht:

```javascript
JSON.stringify(['sybitkart:leaderboard', 1, entries]);
```

Dabei ist:

- `sybitkart:leaderboard` der feste Kontext für diese Art von Signatur;
- `1` die Formatversion;
- `entries` die vollständige gespeicherte Liste, nicht nur die angezeigten Top 10.

Die Liste enthält alle gespeicherten Ergebnisfelder einschließlich ihrer Einzelsignaturen. Die Reihenfolge der Einträge gehört zur Nachricht. Die äußere Gesamtsignatur selbst gehört nicht zur Nachricht, sonst müsste sie sich selbst mitsignieren.

**Wichtig:** `verifyLeaderboard()` prüft die gespeicherte Liste, bevor `loadLeaderboard()` sie für die Anzeige normalisiert, nach Spielern zusammenfasst oder sortiert. Andernfalls könnten solche Bearbeitungsschritte Veränderungen verdecken.

Die Gesamtsignatur basiert auf dem JSON-Format, nicht auf einem beliebigen semantischen Vergleich von Objekten. Beispielsweise kann auch eine geänderte Reihenfolge der Eigenschaften innerhalb eines Eintrags den Prüfwert verändern. Leerzeichen zwischen JSON-Elementen sind nach `JSON.parse()` dagegen nicht mehr relevant.

## 4. Wie sehen die gespeicherten Daten aus?

Der Schlüssel im `localStorage` lautet:

```text
sybitkart:leaderboard
```

Das Präfix ordnet die Daten dem Spiel zu, wie bei `sybitkart:settings`. Es ist eine Namenskonvention, kein zusätzlicher Zugriffsschutz.

Unter diesem Schlüssel liegt ein JSON-String mit folgender Struktur:

```json
{
  "version": 1,
  "entries": [
    {
      "name": "Alex",
      "distance": 12.5,
      "score": 350,
      "token": "beispiel-token",
      "sig": "hmac256:PLATZHALTER_EINZELSIGNATUR"
    }
  ],
  "sig": "hmac256:PLATZHALTER_GESAMTSIGNATUR"
}
```

Die Signaturen und der Token im Beispiel sind nur Platzhalter. Sie ergeben keinen gültigen Testdatensatz.

`version` ermöglicht es, Speicherformate voneinander zu unterscheiden. Die aktuelle Prüfung akzeptiert nur Version `1`. Ein Versionswechsel braucht deshalb auch eine bewusste Anpassung der Lade- und Migrationslogik.

### Was macht der Session-Token?

`createSessionToken()` legt im `sessionStorage` unter `_lbst` einen Token an und verwendet ihn innerhalb derselben Tab-Sitzung wieder. Er wird nicht für jeden Lauf neu erzeugt. Bei verfügbarer Zufallsquelle werden dafür 16 Zufallsbytes erzeugt und als Hexadezimal-String dargestellt.

Jedes Ergebnis speichert seinen Token zusätzlich in `entries[].token`. Dieser Wert fließt in die Einzelsignatur ein.

**Der Token ist kein Passwort und kein Beweis für einen echten Lauf.** Er steht mit im Leaderboard und ist damit lesbar. Die Prüfung verwendet den Token aus dem jeweiligen Eintrag, nicht den aktuellen Token aus dem Tab. Deshalb kann ein gespeichertes Ergebnis auch nach einem Browser-Neustart geprüft werden.

## 5. Was passiert nach einem Rennen?

Die Speicherlogik in [../src/scenes/GameoverScene.js](../src/scenes/GameoverScene.js) arbeitet so:

1. `loadLeaderboard()` lädt und prüft das bisherige Leaderboard. Das Ergebnis enthält `entries` und den Zustand `isTampered` für die Gesamtliste.
2. Der aktuelle Spieler wird anhand seines Namens gesucht. Groß- und Kleinschreibung werden dabei nicht unterschieden.
3. Ein gültiger Bestwert wird nur verbessert: zuerst zählt die Distanz, bei gleicher Distanz die Punktzahl.
4. Ein manipuliertes Einzelergebnis desselben Spielers wird durch die Werte des aktuellen Laufs ersetzt. Die gefälschten alten Werte werden nicht übernommen.
5. Nur neue oder ersetzte Ergebnisse bekommen eine neue Einzelsignatur.
6. Die Liste wird nach Distanz und danach nach Punkten absteigend sortiert.
7. `saveLeaderboard(entries, { isTampered })` speichert die fünf Ergebnisfelder und den äußeren Datenumschlag.

Die Ergebnisfelder sind `name`, `distance`, `score`, `token` und `sig`. Berechnete Anzeigefelder wie `entry.isTampered` werden nicht als vertrauenswürdige Eigenschaften gespeichert, sondern beim Laden erneut ermittelt.

### Warum muss `isTampered` weitergegeben werden?

Angenommen, jemand löscht einen Eintrag. Die Gesamtsignatur stimmt anschließend nicht mehr. Würde der nächste normale Spielabschluss einfach die veränderte Liste neu signieren, wäre die Löschung danach nicht mehr sichtbar.

Deshalb darf eine bereits als manipuliert erkannte Gesamtliste nicht automatisch wieder als vertrauenswürdig signiert werden. `saveLeaderboard()` speichert in diesem Fall absichtlich eine **leere äußere Signatur**:

```json
{
  "version": 1,
  "entries": [],
  "sig": ""
}
```

Die fehlende Signatur wird beim nächsten Laden wieder als ungültig erkannt. Neue Ergebnisse können weiterhin enthalten sein; die globale Warnung bleibt bestehen. Dafür müssen Aufrufer den von `loadLeaderboard()` gelieferten Zustand beim Speichern weiterreichen.

## 6. Was sieht man bei ungültigen Daten?

| Fall                                                | Verhalten                                                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Einzelsignatur fehlt, ist leer oder passt nicht     | Der betroffene angezeigte Eintrag erhält den Zusatz „manipuliert“.                                      |
| Gesamtsignatur fehlt oder passt nicht               | Die Überschrift des Leaderboards erhält eine Manipulationswarnung.                                      |
| Manipulierte Liste enthält keine Einträge mehr      | Die globale Warnung erscheint trotzdem.                                                                 |
| JSON ist beschädigt oder das äußere Format ungültig | Das Laden liefert eine leere Liste mit globaler Warnung.                                                |
| Browser verweigert bereits den Speicherzugriff      | Das Laden liefert ebenfalls eine leere Liste mit globaler Warnung. Das ist nicht automatisch ein Cheat. |
| Beide Speicherschlüssel fehlen                      | Das Spiel behandelt dies als frischen, leeren Datenbestand ohne Warnung.                                |

Die globale Warnung wird auch über die zugängliche HTML-Überschrift ausgegeben. Eintragswarnungen stehen ebenfalls in der Screenreader-Tabelle. Dafür ist [../src/accessibility/leaderboard.js](../src/accessibility/leaderboard.js) zuständig; die sichtbare Spielansicht liegt in [../src/scenes/LeaderboardScene.js](../src/scenes/LeaderboardScene.js).

### Zusätzliche Plausibilitätsprüfung

Eine passende Signatur allein reicht für ein Einzelergebnis nicht aus. `verifyEntry()` prüft auch:

- Distanz: endlich, nicht negativ und höchstens `9999` km;
- Punkte: endlich, nicht negativ und höchstens `999999`.

`NaN` und `Infinity` werden bei dieser Prüfung nicht akzeptiert. Beim Laden werden Einträge mit nicht endlicher oder negativer Distanz außerdem aus der Anzeigeliste entfernt. Andere ungültige Einzelergebnisse können als manipuliert angezeigt werden.

Diese Grenzen sind grobe Obergrenzen. Sie prüfen weder die Dauer eines Laufs noch alle Spielregeln. Auch `signEntry()` selbst führt keine Plausibilitätsprüfung durch; das ist Aufgabe von `verifyEntry()`.

## 7. Wie werden alte Daten übernommen?

Früher lag direkt ein Array unter `leaderboard`. Jetzt liegt ein versioniertes Objekt unter `sybitkart:leaderboard`.

Die Migration läuft automatisch beim Laden:

1. Ist der neue Schlüssel vorhanden, wird ausschließlich dieser Datenbestand geprüft. Ein ungültiger neuer Datenbestand führt nicht zu einem Rückgriff auf alte Daten.
2. Fehlt der neue Schlüssel, wird der alte Schlüssel gelesen.
3. Ist dort ein gültiges JSON-Array gespeichert, bekommt dieses Array den neuen Datenumschlag und eine Gesamtsignatur.
4. Erst nach erfolgreichem Schreiben des neuen Werts wird der alte Schlüssel entfernt.
5. Die bisherigen Einzelsignaturen werden nicht neu erzeugt. Unsignierte oder ungültig signierte Ergebnisse bleiben deshalb auffällig.

Scheitert das Schreiben, etwa wegen einer Speicherbegrenzung, können die lesbaren Altdaten trotzdem angezeigt werden. Das alte Array wird dann nicht gelöscht. Scheitert nur das Entfernen des alten Schlüssels, bleibt der bereits geschriebene neue Datenbestand nutzbar.

Die erste Gesamtsignatur bestätigt lediglich den bei der Migration vorgefundenen Datenstand. Sie kann nicht nachträglich feststellen, ob vorher bereits Einträge gelöscht oder umgeordnet wurden.

## 8. HMAC und der Fallback

Normalerweise verwendet `_signMessage()` die Web Crypto API mit HMAC-SHA-256. Der gespeicherte Wert beginnt dann mit `hmac256:` und enthält anschließend 64 Hexadezimalzeichen.

Ist Web Crypto nicht verfügbar, verwendet das Spiel einen schwächeren Prüfwert auf Basis von FNV-1a mit eingebundenem Schlüssel. Dieser beginnt mit `fnv1a32:` und enthält acht Hexadezimalzeichen. **FNV-1a ist kein kryptografisch sicheres Authentifizierungsverfahren.**

Web Crypto ist üblicherweise in sicheren Browser-Kontexten verfügbar, etwa bei HTTPS und lokalen Loopback-Adressen. Bei einfachem HTTP über eine Netzwerk-IP kann dagegen der Fallback greifen.

Die aktuelle Prüfung berechnet das Verfahren neu anhand der verfügbaren Browser-Funktionen. Sie wählt es nicht anhand des gespeicherten Präfixes aus. Ein Wechsel zwischen HMAC- und Fallback-Umgebung kann deshalb auch unveränderte Daten als ungültig erscheinen lassen.

## 9. Was verhindert der Schutz nicht?

- **Komplettes Löschen:** Ohne unabhängigen Referenzstand kann das Spiel einen gelöschten Datenbestand nicht von einer Erstbenutzung unterscheiden.
- **Zurückspielen eines alten Datenstands:** Eine frühere gültige Liste bleibt gültig. Es gibt keinen extern geprüften Zeitstempel oder Versionszähler für einzelne Speicherstände.
- **Manipulation während des Rennens:** Verändert jemand die Spielwerte vor dem regulären Speichern, kann das Spiel diese Werte selbst gültig signieren.
- **Bewusstes Fälschen von Signaturen:** Schlüssel und Signierlogik befinden sich im Browser. Entsprechend entschlossene Personen können neue gültige Signaturen erzeugen.
- **Betriebsfehler sicher von Manipulation unterscheiden:** Eine ungültige Signatur kann auch durch einen Formatwechsel, beschädigte Daten oder einen Wechsel des Prüfverfahrens entstehen.

Für den Stand bleiben ein betreuter beziehungsweise administrativ gesperrter Browser und ein gebautes Spiel sinnvoll. Für verbindliche Wettbewerbsergebnisse braucht es serverseitige Speicherung und eine Prüfung, die nicht einfach beliebigen vom Browser gemeldeten Werten vertraut.

## 10. Selbst nachvollziehen und testen

Die automatisierten Tests stehen in [../test/utils/leaderboardSecurity.test.js](../test/utils/leaderboardSecurity.test.js). Aus dem Projektordner:

```bash
node --test test/utils/leaderboardSecurity.test.js
```

Alle vorhandenen Tests laufen mit:

```bash
node --test
```

Die Leaderboard-Tests behandeln unter anderem Änderungen an Ergebnisfeldern, gelöschte oder umsortierte Einträge, leere Listen, fehlende Signaturen, Migration und verweigerten Speicherzugriff.

Für einen kleinen Versuch ohne Browserdaten lässt sich aus dem Projektordner Node.js starten:

```bash
node
```

Dann diese Befehle nacheinander ausführen:

```javascript
const { signEntry, verifyEntry, signLeaderboard, verifyLeaderboard } =
  await import('./src/utils/leaderboardSecurity.js');

const entry = await signEntry({ name: 'Alex', distance: 12.5, score: 350, token: 'demo' });
await verifyEntry(entry);
await verifyEntry({ ...entry, score: 999 });

const board = await signLeaderboard([entry]);
await verifyLeaderboard(board);
await verifyLeaderboard({ ...board, entries: [] });
```

Erwartung: Die beiden unveränderten Datenstände liefern `valid: true`. Die geänderten Punkte und die geleerte Liste liefern `valid: false`. Dieser Versuch schreibt nichts in den Browser-Speicher.

**Merksatz:** Eine passende Signatur bedeutet hier „Die Daten passen zu diesem Prüfwert“, nicht „Dieser Rekord wurde garantiert ehrlich erspielt“.
