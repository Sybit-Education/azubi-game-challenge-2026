import Phaser from 'phaser';
import InputManager from '../objects/InputManager.js';
import { loadLeaderboard } from '../utils/leaderboardSecurity.js';
import { preloadMenuSounds, playMenuClick } from '../../audio/sounds.js';
import { bindLeaderboardControls } from '../accessibility/leaderboard.js';

export default class LeaderboardScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('LeaderboardScene');
  }

  preload() {
    preloadMenuSounds(this);
    this.load.image(
      'homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );
    this.load.image(
      'leaderboard-homepage-btn',
      'assets/images/gameover-scene-assets/back-to-menu-button.png',
    );
  }

  // BootScene loads the font before menus become available.
  async create(data) {
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    const result = await loadLeaderboard();
    const leaderboard = result.entries.slice(0, 10);
    this.isLeaderboardTampered = result.isTampered;
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);

    // Background image
    this.background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width * 1.01, this.scale.height * 1.01)
      .setDepth(-2);

    //Background parallax effect
    this.input.on('pointermove', (pointer) => {
      this.background.setPosition(
        this.scale.width / 2 + (pointer.x - this.scale.width / 2) * 0.01,
        this.scale.height / 2 + (pointer.y - this.scale.height / 2) * 0.01,
      );
    });

    // Titel Überschrifft "Leaderboard"
    this.title = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 12,
        this.isLeaderboardTampered ? 'Leaderboard\n⚠ manipuliert' : 'Leaderboard',
        {
          fontFamily: 'Silkscreen',
          fontSize: this.isLeaderboardTampered ? '60px' : '90px',
          color: '#ffffff',
          align: 'center',
        },
      )
      .setOrigin(0.5)
      .setScale(1 * this.scaleFactor);

    // Style for one entry
    const entryStyle = {
      fontFamily: 'Silkscreen',
      fontSize: this.scale.height / 21 + 'px',
      color: '#ffffff',
    };

    this.leaderboardEntries = [];

    leaderboard.forEach((entry, index) => {
      const name = entry.name || 'Unbekannt';
      const distance = entry.distance;
      const displayName = entry.isTampered ? `${name} ⚠ manipuliert` : name;

      const text = this.add
        .text(
          this.scale.width / 2,
          200 + index * (this.scale.height / 20),
          `${index + 1}. ${displayName} - ${distance} km`,
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

    // On home button listener
    this.backButton.on('pointerdown', () => this.goHome());
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
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
    });

    this.resize({
      width: this.scale.width,
      height: this.scale.height,
    });
    bindLeaderboardControls(this, leaderboard, data?.focusTarget, this.isLeaderboardTampered);
  }

  goHome() {
    playMenuClick(this);
    const menu = this.registry.get('gameMode') === 'christmas' ? 'ChristmasScene' : 'MenuScene';
    this.scene.start(menu, { focusTarget: 'leaderboard-btn' });
  }

  update() {
    this.InputManager.update();

    if (this.InputManager.getControlsP1.button4) {
      this.goHome();
    }
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    const scaleFactor = Math.min(width / 1920, height / 1080);

    this.background.setPosition(width / 2, height / 2).setDisplaySize(width, height);

    this.title
      .setPosition(width / 2, height / 12)
      .setFontSize((this.isLeaderboardTampered ? 60 : 90) * scaleFactor);

    this.backButton.setPosition(width / 2, height / 1.3).setScale(0.4 * scaleFactor);

    this.leaderboardEntries.forEach((entry, index) => {
      entry.setPosition(width / 2, 200 * scaleFactor + index * (height / 20));

      entry.setFontSize(height / 21);
    });
  }
}

// Loads and parses leaderboard
export async function parseLeaderboard() {
  return (await loadLeaderboard()).entries;
}
