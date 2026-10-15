import Phaser from 'phaser';

export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
  }

  async create() {
    await document.fonts.load('32px Tiny5');
    const leaderboard = parseLeaderboard().slice(0, 10);

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    this.add
      .text(this.scale.width / 2, this.scale.height / 12, 'Leaderboard', {
        fontFamily: 'Tiny5',
        fontSize: '90px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    console.debug(leaderboard);

    const entryStyle = {
      fontFamily: 'Tiny5',
      fontSize: this.scale.height / 21 + 'px',
      color: '#ffffff',
    };

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

    const backButton = this.add
      .image(this.scale.width / 2, this.scale.height / 1.3, 'leaderboard-homepage-btn')
      .setScale(0.4)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    backButton.on('pointerover', () => {
      this.tweens.add({
        targets: backButton,
        scaleX: 0.45,
        scaleY: 0.45,
        duration: 100,
      });
    });
    backButton.on('pointerout', () => {
      this.tweens.add({
        targets: backButton,
        scaleX: 0.4,
        scaleY: 0.4,
        duration: 100,
      });
    });
  }
}

export function parseLeaderboard() {
  const entries = JSON.parse(localStorage.getItem('leaderboard') || '[]').map((entry) => {
    // Support older leaderboard data that stored distances as strings
    if (typeof entry === 'string') {
      return {
        name: 'Unbekannt',
        distance: Number(entry),
      };
    }

    return {
      name: entry.name,
      distance: Number(entry.distance),
    };
  });

  const bestByPlayer = new Map();
  entries.forEach((entry) => {
    const playerKey = entry.name.trim().toLowerCase();
    const previousBest = bestByPlayer.get(playerKey);
    if (!previousBest || entry.distance > previousBest.distance) {
      bestByPlayer.set(playerKey, entry);
    }
  });

  return [...bestByPlayer.values()].sort((a, b) => b.distance - a.distance);
}
