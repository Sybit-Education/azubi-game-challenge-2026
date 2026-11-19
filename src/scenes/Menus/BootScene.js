import Phaser from 'phaser';

import { loadSettings } from '../../settings/gameSettings.js';
import { keepAudioOutputAwake } from '../../../audio/keepAudioOutputAwake.js';

/** Initializes shared audio, fonts and settings before opening the selected menu. */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  /**
   * Enables the output keep-alive, waits for menu fonts and restores settings.
   *
   * @returns {Promise<void>} Resolves after requesting the selected menu scene.
   */
  async create() {
    keepAudioOutputAwake(this.sound);

    // main uses Tiny5; origin/main introduced Silkscreen too.
    // Load both so text is ready regardless of active scene.
    await Promise.all([document.fonts.load('1em Tiny5'), document.fonts.load('1em Silkscreen')]);

    // Load persisted settings early so all scenes can rely on registry values.
    const settings = loadSettings();
    this.registry.set('accessibilityMode', settings.accessibilityMode);
    this.registry.set('gameMode', settings.gameMode);

    this.scene.start(settings.gameMode === 'christmas' ? 'ChristmasScene' : 'MenuScene');
  }
}
