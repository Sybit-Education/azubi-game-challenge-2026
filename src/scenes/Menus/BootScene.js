import Phaser from 'phaser';

import { loadSettings } from '../../settings/gameSettings.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  async create() {
    await document.fonts.load('1em Tiny5');

    // Load persisted settings early so all scenes can rely on registry values.
    const settings = loadSettings();
    this.registry.set('accessibilityMode', settings.accessibilityMode);
    this.registry.set('gameMode', settings.gameMode);

    this.scene.start(settings.gameMode === 'christmas' ? 'ChristmasScene' : 'MenuScene');
  }
}
