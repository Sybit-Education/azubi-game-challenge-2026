import Phaser from 'phaser';

export default class LeaderboardScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('LeaderboardScene');
  }

  // On create
  async create() {
    await document.fonts.load('32px Tiny5');
    const leaderboard = parseLeaderboard().slice(0, 10);
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);

    // Background image
    const background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width * 1.01, this.scale.height * 1.01)
      .setDepth(-2);

    //Background parallax effect
    this.input.on('pointermove', (pointer) => {
      background.setPosition(
        this.scale.width / 2 + (pointer.x - this.scale.width / 2) * 0.01,
        this.scale.height / 2 + (pointer.y - this.scale.height / 2) * 0.01,
      );
    });

    // Titel Überschrifft "Leaderboard"
    this.title = this.add
      .text(this.scale.width / 2, this.scale.height / 12, 'Leaderboard', {
        fontFamily: 'Tiny5',
        fontSize: '90px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScale(1 * this.scaleFactor);

    // Debug logging
    console.debug(leaderboard);

    // Style for one entry
    const entryStyle = {
      fontFamily: 'Tiny5',
      fontSize: this.scale.height / 21 + 'px',
      color: '#ffffff',
    };

    this.leaderboardEntries = [];

    leaderboard.forEach((entry, index) => {
      const name = entry.name || 'Unbekannt';
      const distance = entry.distance || entry;

      const text = this.add
        .text(
          this.scale.width / 2,
          200 + index * (this.scale.height / 20),
          `${index + 1}. ${name} - ${distance} km`,
          entryStyle,
        )
        .setOrigin(0.5)
        .setAlpha(index <= 7 ? 1 - (index / 2) * 0.04 : 0.75);

      this.leaderboardEntries.push(text);
    });

    // Home button display
    this.backButton = this.add
      .image(this.scale.width / 2, this.scale.height / 1.3, 'leaderboard-homepage-btn')
      .setScale(0.4 * this.scaleFactor)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.resetButton = this.add
      .text(this.scale.width / 2, this.scale.height / 1.15, 'Reset Leaderboard', {
        fontFamily: 'Tiny5',
        fontSize: '40px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive()
      .setScale(1 * this.scaleFactor);

    this.resetButton.on('pointerdown', () => {
      localStorage.removeItem('leaderboard');

      this.scene.restart();
    });

    // On home button listener
    this.backButton.on('pointerdown', () => {
      const gameMode = this.registry.get('gameMode');

      if (gameMode === 'christmas') {
        this.scene.start('ChristmasScene');
      } else {
        this.scene.start('MenuScene');
      }
    });
    // Hover effect
    this.backButton.on('pointerover', () => {
      this.tweens.add({
        targets: this.backButton,
        scaleX: 0.45 * this.scaleFactor,
        scaleY: 0.45 * this.scaleFactor,
        duration: 100,
      });
    });
    this.backButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.backButton,
        scaleX: 0.4 * this.scaleFactor,
        scaleY: 0.4 * this.scaleFactor,
        duration: 100,
      });
    });

    //listener for resizing
    this.scale.on('resize', this.resize, this);

    this.resize({
      width: this.scale.width,
      height: this.scale.height,
    });
  }
  

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    const scaleFactor = Math.min(width / 1920, height / 1080);

    this.background.setPosition(width / 2, height / 2).setDisplaySize(width, height);

    this.title.setPosition(width / 2, height / 12).setFontSize(90 * scaleFactor);

    this.backButton.setPosition(width / 2, height / 1.3).setScale(0.4 * scaleFactor);

    this.leaderboardEntries.forEach((entry, index) => {
      entry.setPosition(width / 2, 200 * scaleFactor + index * (height / 20));

      entry.setFontSize(height / 21);
    });
  }
}

// Loads and parses leaderboard
export function parseLeaderboard() {
  const entries = JSON.parse(localStorage.getItem('leaderboard') || '[]').map((entry) => {
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

  const bestByPlayer = new Map();
  entries.forEach((entry) => {
    const playerKey = entry.name?.trim()?.toLowerCase() ?? 'unknown';

    const previousBest = bestByPlayer.get(playerKey);
    if (!previousBest || entry.distance > previousBest.distance) {
      bestByPlayer.set(playerKey, entry);
    }
  });

  return [...bestByPlayer.values()].sort((a, b) => b.distance - a.distance);
}
