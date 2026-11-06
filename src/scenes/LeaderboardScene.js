import Phaser from 'phaser';
import InputManager from '../objects/InputManager.js';
import { loadLeaderboard } from '../utils/leaderboardSecurity.js';
import { preloadMenuSounds, playMenuClick } from '../../audio/sounds.js';
import { bindLeaderboardControls } from '../accessibility/leaderboard.js';

export default class LeaderboardScene extends Phaser.Scene {
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

    this.background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width * 1.01, this.scale.height * 1.01)
      .setDepth(-2);

    this.input.on('pointermove', (pointer) => {
      this.background.setPosition(
        this.scale.width / 2 + (pointer.x - this.scale.width / 2) * 0.01,
        this.scale.height / 2 + (pointer.y - this.scale.height / 2) * 0.01,
      );
    });

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

    // Keep each value in its own text object to align it with the column headers.
    const entryStyle = {
      fontFamily: 'Silkscreen',
      fontSize: `${this.scale.height / 26}px`,
      color: '#ffffff',
    };

    this.columnHeaders = [
      this.add.text(0, 0, '#', entryStyle).setOrigin(0.5, 1),
      this.add.text(0, 0, 'PLAYER', entryStyle).setOrigin(0, 1),
      this.add.text(0, 0, 'DISTANCE', entryStyle).setOrigin(1),
      this.add.text(0, 0, 'SCORE', entryStyle).setOrigin(1),
    ];

    this.leaderboardEntries = leaderboard.map((entry, index) => {
      const name = entry.name || 'Unbekannt';
      const displayName = entry.isTampered ? `${name} ⚠ manipuliert` : name;
      const alpha = index <= 7 ? 1 - (index / 2) * 0.04 : 0.75;

      return {
        rank: this.add
          .text(0, 0, String(index + 1), entryStyle)
          .setOrigin(0.5)
          .setAlpha(alpha),
        name: this.add.text(0, 0, displayName, entryStyle).setOrigin(0, 0.5).setAlpha(alpha),
        distance: this.add
          .text(0, 0, `${entry.distance} km`, entryStyle)
          .setOrigin(1, 0.5)
          .setAlpha(alpha),
        score: this.add
          .text(0, 0, String(entry.score ?? 0), entryStyle)
          .setOrigin(1, 0.5)
          .setAlpha(alpha),
      };
    });

    this.emptyLeaderboardText =
      leaderboard.length === 0
        ? this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'NO ENTRIES YET', {
              ...entryStyle,
              align: 'center',
            })
            .setOrigin(0.5)
        : null;

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

    const controls = this.InputManager.getControlsP1;
    if (controls.button4) {
      this.goHome();
    }
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.scaleFactor = Math.min(width / 1920, height / 1080);

    this.background.setPosition(width / 2, height / 2).setDisplaySize(width, height);
    this.title
      .setPosition(width / 2, height / 12)
      .setFontSize((this.isLeaderboardTampered ? 60 : 90) * this.scaleFactor);

    // Keep the numeric columns right-aligned and rank/player together on the left.
    const rankX = width * 0.32;
    const nameX = width * 0.35;
    const distanceX = width * 0.62;
    const scoreX = width * 0.69;
    const headerY = height * 0.31;
    const firstRowY = height * 0.36;
    const rowGap = height * 0.052;
    const rowFontSize = height / 26;

    this.columnHeaders.forEach((header) => header.setFontSize(rowFontSize));
    this.columnHeaders[0].setPosition(rankX, headerY);
    this.columnHeaders[1].setPosition(nameX, headerY);
    this.columnHeaders[2].setPosition(distanceX, headerY);
    this.columnHeaders[3].setPosition(scoreX, headerY);

    this.leaderboardEntries.forEach((row, index) => {
      const y = firstRowY + index * rowGap;
      row.rank.setPosition(rankX, y).setFontSize(rowFontSize);
      row.name.setPosition(nameX, y).setFontSize(rowFontSize);
      const availableNameWidth = distanceX - nameX - 18 * this.scaleFactor;
      if (row.name.width > availableNameWidth) {
        row.name.setFontSize(rowFontSize * (availableNameWidth / row.name.width));
      }
      row.distance.setPosition(distanceX, y).setFontSize(rowFontSize);
      row.score.setPosition(scoreX, y).setFontSize(rowFontSize);
    });

    this.emptyLeaderboardText?.setPosition(width / 2, height * 0.5).setFontSize(rowFontSize);
  }
}

// Loads and parses leaderboard
export async function parseLeaderboard() {
  return (await loadLeaderboard()).entries;
}
