/* global Phaser */

import { positionAccessibleControls } from '../accessibility/positionControls.js';

export default class PopUpScene extends Phaser.Scene {
  constructor() {
    super('PopUpScene');
  }

  preload() {
    this.load.image('settingsBackground', 'sprites/Homepage/Settings Menu/Background.png');
    this.load.image('settingsLabel', 'sprites/Homepage/Settings Menu/SETTINGS.png');
    this.load.image('xButton', 'sprites/Homepage/Settings Menu/x.png');
    this.load.image('Accessibility Mode', 'sprites/Homepage/Settings Menu/Accessibility mode.png');
    this.load.image('Game Mode', 'sprites/Homepage/Settings Menu/GameModeLabel.png');
    this.load.image(
      'AccessibilitySwitchOff',
      'sprites/Homepage/Settings Menu/AccessibilitySwitchOff.png',
    );
    this.load.image('StandardModeButton', 'sprites/Homepage/Settings Menu/StandardModeButton.png');
    this.load.image('closeLabel', 'sprites/Homepage/Settings Menu/closeLabel.png');
  }
  create() {
    const { width, height } = this.scale;
    const padding = Math.max(24, Math.min(width, height) * 0.06);

    const background = this.add.image(width * 0.8, 0, 'settingsBackground').setOrigin(0.5);
    background.displayWidth = width / 2.5;

    const closeButton = this.add
      .image(background.x * 1.225, height * 0.05, 'xButton')
      .setScale(0.4)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    closeButton.setDepth(9999);
    closeButton.on('pointerdown', () => this.scene.stop());

    // Dim the game behind the settings panel.
    this.add.rectangle(0, 0, width, height, 0x000000, 0.48).setOrigin(0).setInteractive();

    this.add
      .image(background.x, background.y * -1 + padding, 'settingsLabel')
      .setScale(0.3)
      .setOrigin(0.5);

    this.add
      .image(background.x / 1.2, height * 0.2, 'Accessibility Mode')
      .setScale(0.35)
      .setOrigin(0);
    //rowY += Math.max(48, 58 * uiScale);

    // Static switch mockup: settings are visual only for now.
    const AccessibilitySwitch = this.add
      .image(background.x * 1.06 + padding, height * 0.195, 'AccessibilitySwitchOff')
      .setScale(0.3)
      .setOrigin(0)
.setInteractive({useHandCursor: true});

    let button_state = 0;
    function switch_button_state() {
      if (button_state) {
        button_state = 0;
      } else if (!button_state) {
        button_state = 1;
      }
    }

    AccessibilitySwitch.on('pointerdown', () => switch_button_state());
    //rowY += Math.max(90, 112 * uiScale);
    const gamemodeLabel = this.add
      .image(background.x * 0.79 + padding, AccessibilitySwitch.y / 0.66, 'Game Mode')
      .setScale(0.35)
      .setOrigin(0);

    //rowY += Math.max(48, 58 * uiScale);
    // Static dropdown mockup: choosing a mode has no effect yet.

    const gameModeImage = this.add
      .image(gamemodeLabel.x * 1.2, gamemodeLabel.y * 0.97, 'StandardModeButton')
      .setScale(0.3)
      .setOrigin(0);

    this.add
      .image(background.x, height - padding, 'closeLabel')
      .setScale(0.66)
      .setOrigin(0.5);

    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const dialog = document.getElementById('settings-dialog');
    const accessibilityToggle = document.getElementById('accessible-toggle');
    accessibilityToggle.checked = this.registry.get('accessibility enabled') ?? false;
    const gameModeMenu = document.getElementById('game-mode-menu');
    gameModeMenu.value = this.registry.get('gameMode') ?? 'standard';

    this.input.keyboard.once('keydown-M', () => this.scene.stop());
    const closeWindows = () => {
      this.scene.stop('PopUpScene');
    };

    const handleAccessibilityChange = () => {
      this.registry.set('accessibility enabled', accessibilityToggle.checked);
    };
    accessibilityToggle.addEventListener('change', handleAccessibilityChange);

    const handleGameModeChange = () => {
      this.registry.set('gameMode', gameModeMenu.value);
    };
    gameModeMenu.addEventListener('change', handleGameModeChange);
    closeSettingsBtn.addEventListener('click', closeWindows);

    const handleCancel = (event) => {
      event.preventDefault();
      closeWindows();
    };

    dialog.addEventListener('cancel', handleCancel);

    this.events.once('shutdown', () => {
      closeSettingsBtn.removeEventListener('click', closeWindows);
      dialog.removeEventListener('cancel', handleCancel);
      accessibilityToggle.removeEventListener('change', handleAccessibilityChange);
      gameModeMenu.removeEventListener('change', handleGameModeChange);
      dialog.close();
      settingsBtn.focus();
    });

    positionAccessibleControls(this, [
      [closeSettingsBtn, closeButton],
      [accessibilityToggle, AccessibilitySwitch],
      [gameModeMenu, gameModeImage],
    ]);
    dialog.showModal();
  }
}
