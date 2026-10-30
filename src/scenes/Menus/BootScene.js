import Phaser from 'phaser';

import { loadSettings } from '../../settings/gameSettings.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  async create() {
    // main uses Tiny5; origin/main introduced Silkscreen too.
    // Load both so text is ready regardless of active scene.
    await Promise.all([document.fonts.load('1em Tiny5'), document.fonts.load('1em Silkscreen')]);

    // Load persisted settings early so all scenes can rely on registry values.
    const settings = loadSettings();
    this.registry.set('accessibilityMode', settings.accessibilityMode);
    this.registry.set('accessibility enabled', settings.accessibilityMode);
    this.registry.set('gameMode', settings.gameMode);

    this.scene.start(settings.gameMode === 'christmas' ? 'ChristmasScene' : 'MenuScene');
  }
}
