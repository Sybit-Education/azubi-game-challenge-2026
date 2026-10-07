/* global Phaser*/

import { GameData } from
 './Menus/GameDate.js';

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
  }
  create() {
    const leaderboard = JSON.parse(
  localStorage.getItem('leaderboard') || '[]'
).map(entry => {
  if (typeof entry === 'string') {
    return {
      name: 'Unbekannt',
      distance: entry,
    };
  }
  return entry;
});

    // Hintergrund bild
    this.add
      .image(
        this.scale.width / 2,
        this.scale.height / 2,
        'homepage-hintergrund'
      )
      .setDisplaySize(this.scale.width, this.scale.height);

    // Titel Überschrifft "Leaderboard"
    this.add.text(
  this.scale.width / 2,
  this.scale.height / 12,
  'Leaderboard',
  {
    fontFamily: 'Tiny5',
    fontSize: '90px',
    color: '#ffffff'
  }
)
.setOrigin(0.5);

    // Einträge anzeigen für die gefahrende strecke km
   console.log(leaderboard);

    leaderboard.forEach((entry, index) => {
        const name = entry.name || 'Unbekannt';
        const distance = entry.distance|| entry;

  this.add.text(
    this.scale.width / 2,
    200 + index * 50,
    `${index + 1}. ${entry.name} - ${entry.distance} km`
  ).setOrigin(0.5);
});

    // Back Button- schickt zurück ins Hauptmenü
    const backButton = this.add
      .image(
        this.scale.width / 2,
        this.scale.height / 1.3,
        'leaderboard-homepage-btn'
      )
      .setScale(0.5)
      .setOrigin(0.5)
      .setInteractive();

    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
