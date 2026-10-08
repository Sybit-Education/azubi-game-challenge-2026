export const tutorialSteps = [
  {
    title: 'Willkommen bei Sybit Kart!',
    description:
      'Fahre möglichst weit, sammle Münzen und weiche anderen Autos aus. Wir zeigen dir zuerst das Menü. Danach kannst du alles ohne Zeitdruck und ohne Game Over ausprobieren.',
    location:
      'Die Anleitung findest du unten links im Hauptmenü. Du kannst sie jederzeit erneut öffnen.',
    target: 'tutorial',
  },
  {
    title: 'Hier startest du dein Rennen',
    description:
      'Mit PLAY startest du ein Einzelspieler-Rennen. Danach folgen der Ladebildschirm und eine kurze Startanimation. Die Animation kannst du mit „Skip Intro!“ überspringen.',
    location: 'PLAY befindet sich links im Hauptmenü, über den Einstellungen.',
    target: 'play',
  },
  {
    title: 'Deine Einstellungen',
    description:
      'Unter SETTINGS findest du den Schalter für den Accessibility Mode und die Auswahl zwischen Standard- und Weihnachtsmodus. Mit Escape schließt du die Einstellungen. Das Tutorial ist auch ohne aktivierten Accessibility Mode per Tastatur bedienbar.',
    location: 'SETTINGS befindet sich links im Hauptmenü, direkt unter PLAY.',
    target: 'settings',
  },
  {
    title: 'Steuere dein Auto',
    description:
      'A lenkt nach links, D nach rechts. W bewegt dich nach vorne, S nach hinten. Probiere mit deinem markierten Auto alle vier Richtungen aus!',
    location:
      'Die Straße läuft automatisch und wird im Rennen schneller. Person 2 nutzt im Zweispielermodus die Pfeiltasten. Hier in der Übung gehen auch Pfeiltasten und Buttons.',
    target: 'car',
    practice: 'steering',
  },
  {
    title: 'Sammle eine Münze',
    description:
      'Fahre mit deinem Auto über eine Münze: Jede Münze bringt dir 50 Punkte. Hier liegt eine direkt vor dir. Fahre mit W, Pfeil nach oben oder dem oberen Button zu ihr.',
    location: 'Münzen erscheinen auf der Straße. Deinen Punktestand findest du oben rechts.',
    target: 'coin',
    practice: 'coin',
  },
  {
    title: 'Weiche anderen Autos aus',
    description:
      'Ein Zusammenstoß mit einem anderen Auto beendet das Rennen. Bleibe auf der Straße und wechsle rechtzeitig zur Seite. Lenke jetzt mit A oder D am markierten Auto vorbei. In der Übung kann dir nichts passieren.',
    location: 'Andere Autos kommen von oben auf der Straße auf dich zu.',
    target: 'enemy',
    practice: 'obstacle',
  },
  {
    title: 'Behalte deinen Fortschritt im Blick',
    description:
      'SCORE zeigt deine gesammelten Punkte. DISTANCE zeigt deine gefahrene Strecke in Kilometern. Nach einem Zusammenstoß siehst du beide Werte noch einmal. Mit „Nochmal spielen“ startest du neu, mit „Hauptmenü“ kehrst du zurück.',
    location: 'Beide Anzeigen stehen am oberen Rand: die Strecke links neben den Punkten.',
    target: 'hud',
  },
  {
    title: 'Bereit für dein Rennen?',
    description:
      'Steuere mit W, A, S und D, sammle Münzen und vermeide Zusammenstöße. Mit „Rennen starten“ beginnt ein neues Einzelspieler-Rennen mit null Punkten. Die Anleitung kannst du später im Hauptmenü wieder öffnen.',
    location: 'Du kannst auch „Schließen“ wählen, um zuerst ins Hauptmenü zurückzukehren.',
  },
];
