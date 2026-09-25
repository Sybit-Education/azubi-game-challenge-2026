/* global Phaser */

export default class PopUpScene extends Phaser.Scene {
  constructor() {
    super('PopUpScene');
  }

  create() {
    const { width, height } = this.scale;
    const panelWidth = Math.min(width * 0.44, 560);
    const panelX = width - panelWidth;
    const padding = Math.max(24, Math.min(width, height) * 0.04);
    const uiScale = Math.min(width / 1280, height / 720, 1.3);
    const purple = 0x6f3198;
    const white = '#ffffff';

    // Dim the game behind the settings panel.
    this.add.rectangle(0, 0, width, height, 0x000000, 0.48)
      .setOrigin(0)
      .setInteractive();

    this.add.rectangle(panelX, 0, panelWidth, height, purple)
      .setOrigin(0)
      .setStrokeStyle(3, 0xffffff, 0.18);

    this.add.text(panelX + padding, padding, 'SETTINGS', {
      fontFamily: 'Tiny5',
      fontSize: `${Math.max(28, 48 * uiScale)}px`,
      color: white,
    });

    const closeButton = this.add.text(width - padding, padding, 'X', {
      fontFamily: 'Tiny5',
      fontSize: `${Math.max(24, 38 * uiScale)}px`,
      color: white,
      backgroundColor: '#542474',
      padding: { x: 12, y: 6 },
    })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    closeButton.on('pointerdown', () => this.scene.stop());

    const labelStyle = {
      fontFamily: 'Tiny5',
      fontSize: `${Math.max(19, 27 * uiScale)}px`,
      color: white,
    };
    const rowX = panelX + padding;
    let rowY = Math.min(height * 0.25, 200);
    const rowWidth = panelWidth - padding * 2;

    this.add.text(rowX, rowY, 'Accessibility Mode', labelStyle);
    rowY += Math.max(48, 58 * uiScale);

    // Static switch mockup: settings are visual only for now.
    this.add.rectangle(rowX + rowWidth, rowY, 72 * uiScale, 34 * uiScale, 0x542474)
      .setOrigin(1, 0.5)
      .setStrokeStyle(2, 0xffffff, 0.7);
    this.add.circle(rowX + rowWidth - 17 * uiScale, rowY, 11 * uiScale, 0xffffff);
    this.add.text(rowX, rowY, 'OFF', {
      ...labelStyle,
      fontSize: `${Math.max(15, 19 * uiScale)}px`,
    }).setOrigin(0, 0.5);

    rowY += Math.max(90, 112 * uiScale);
    this.add.text(rowX, rowY, 'Game Mode', labelStyle);
    rowY += Math.max(48, 58 * uiScale);

    // Static dropdown mockup: choosing a mode has no effect yet.
    this.add.rectangle(rowX + rowWidth / 2, rowY + 24 * uiScale, rowWidth, 52 * uiScale, 0x542474)
      .setStrokeStyle(2, 0xffffff, 0.7);
    this.add.text(rowX + 18 * uiScale, rowY + 24 * uiScale, 'Standard Mode', {
      ...labelStyle,
      fontSize: `${Math.max(17, 22 * uiScale)}px`,
    }).setOrigin(0, 0.5);
    this.add.text(rowX + rowWidth - 18 * uiScale, rowY + 24 * uiScale, '▼', {
      ...labelStyle,
      fontSize: `${Math.max(14, 18 * uiScale)}px`,
    }).setOrigin(1, 0.5);
    this.add.text(rowX, rowY + 74 * uiScale, 'Options: Standard Mode / Christmas Mode', {
      ...labelStyle,
      fontSize: `${Math.max(13, 17 * uiScale)}px`,
      color: '#eadcf4',
      wordWrap: { width: rowWidth },
    });

    this.add.text(rowX, height - padding, 'Press M or select X to close', {
      fontFamily: 'Tiny5',
      fontSize: `${Math.max(14, 18 * uiScale)}px`,
      color: '#eadcf4',
      wordWrap: { width: rowWidth },
    }).setOrigin(0, 1);

    this.input.keyboard.once('keydown-M', () => this.scene.stop());
    this.input.keyboard.once('keydown-ESC', () => this.scene.stop());
  }
}
