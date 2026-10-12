/* global Phaser*/

export default class LeaderboardScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('LeaderboardScene');
  }

  // On create
  create() {
    const leaderboard = parseLeaderboard();

    // Background image
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    // Titel Überschrifft "Leaderboard"
    this.add
      .text(this.scale.width / 2, this.scale.height / 12, 'Leaderboard', {
        fontFamily: 'Tiny5',
        fontSize: '90px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Debug logging
    console.debug(leaderboard);

    // Style for one entry
    const entryStyle = {
      fontFamily: 'Tiny5',
      fontSize: this.scale.height / 21 + 'px',
      color: '#ffffff',
    };

    // For each entry
    leaderboard.forEach((entry, index) => {
      const name = entry.name || 'Unbekannt';
      const distance = entry.distance || entry;
      this.add
        .text(
          this.scale.width / 2,
          200 + index * (this.scale.height / 20),
          `${index + 1}. ${name} - ${distance} km`,
          entryStyle,
        )
        .setOrigin(0.5)
        .setAlpha(index <= 7 ? 1 - (index / 2) * 0.04 : 0.75);
    });

    // Home button display
    const backButton = this.add
      .image(this.scale.width / 2, this.scale.height / 1.3, 'leaderboard-homepage-btn')
      .setScale(0.5)
      .setOrigin(0.5)
      .setInteractive();

    // On home button listener
    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}

// Loads and parses leaderboard
export function parseLeaderboard() {
  return JSON.parse(localStorage.getItem('leaderboard') || '[]').map((entry) => {
    // String only entries are counted as scores
    if (typeof entry === 'string') {
      return {
        name: 'Unbekannt',
        distance: Number(entry),
      };
    }

    // Parses entity
    return {
      name: entry.name,
      distance: Number(entry.distance),
    };
  });
}
