/* global Phaser */

import { positionAccessibleControls } from '../../accessibility/positionControls.js';

export default class PopUpScene extends Phaser.Scene {
  constructor() {
    super('PopUpScene');
  }

  preload() {
    this.load.image('settingsBackground', 'sprites/Homepage/Settings Menu/Background.png');
    this.load.image('settingsLabel', 'sprites/Homepage/Settings Menu/SETTINGS.png');
    this.load.image('xButton', 'sprites/Homepage/Settings Menu/x.png');
    this.load.image('Accessibility Mode', 'sprites/Homepage/Settings Menu/Accessibility mode.png');
    this.load.image('switchOn', 'sprites/Homepage/Settings Menu/SwitchOn.png');
    this.load.image('switchOff', 'sprites/Homepage/Settings Menu/switchOff.png');
    this.load.image('switchCircle', 'sprites/Homepage/Settings Menu/switchCircle.png');
    this.load.image('Game Mode', 'sprites/Homepage/Settings Menu/GameModeLabel.png');
    this.load.image(
      'AccessibilitySwitchOff',
      'sprites/Homepage/Settings Menu/AccessibilitySwitchOff.png',
    );
    this.load.image('StandardModeButton', 'sprites/Homepage/Settings Menu/StandardModeButton.png');
    this.load.image('closeLabel', 'sprites/Homepage/Settings Menu/closeLabel.png');
    this.load.image('christmasmode', 'sprites/Homepage/Settings Menu/ChristmasModeButton.png');
  }

  create() {
    console.log('PopUpScene create');
    this.scene.bringToTop();
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

    // Dim the game behind the settings panel.
    const dim = this.add
      .rectangle(0, 0, width, height, 0x000000, 0.48)
      .setOrigin(0)
      .setInteractive()
      .setAlpha(0);

    const settingsLabel = this.add
      .image(background.x, background.y * -1 + padding, 'settingsLabel')
      .setScale(0.3)
      .setOrigin(0.5);

    const accessibilityLabel = this.add
      .image(background.x / 1.2, height * 0.2, 'Accessibility Mode')
      .setScale(0.35)
      .setOrigin(0);
    //rowY += Math.max(48, 58 * uiScale);

    // Static switch mockup: settings are visual only for now.
    const accessibilitySwitch = this.add
      .image(background.x * 1.06 + padding, height * 0.195, 'switchOff')
      .setScale(0.3)
      .setOrigin(0)
      .setInteractive();

    const Accessibilitycircle = this.add
      .image(background.x * 1.06 + padding, height * 0.196, 'switchCircle')
      .setScale(0.35)
      .setOrigin(0)
      .setInteractive();
      .setInteractive({ useHandCursor: true });

    //rowY += Math.max(90, 112 * uiScale);
    const gamemodeLabel = this.add
      .image(background.x * 0.79 + padding, accessibilitySwitch.y / 0.66, 'Game Mode')
      .setScale(0.35)
      .setOrigin(0);

    const standardModeButton = this.add
      .image(gamemodeLabel.x * 1.2, gamemodeLabel.y * 0.97, 'StandardModeButton')
      .setScale(0.3)
      .setOrigin(0)
      .setInteractive();

    const christmasModeButton = this.add
      .image(standardModeButton.x, standardModeButton.y, 'christmasmode')
      .setOrigin(0)
      .setScale(0.3)
      .setAlpha(0)
      .setInteractive();

    let hoveringStandard = false;
    let hoveringChristmas = false;

    const closedY = standardModeButton.y;
    const openY = standardModeButton.y + standardModeButton.displayHeight + 10;

    const updateChristmasButton = () => {
      const shouldBeOpen = hoveringStandard || hoveringChristmas;

      this.tweens.killTweensOf(christmasModeButton);

      this.tweens.add({
        targets: christmasModeButton,
        y: shouldBeOpen ? openY : closedY,
        alpha: shouldBeOpen ? 1 : 0,
        duration: 150,
        ease: 'Power2',
      });
    };

    standardModeButton.on('pointerover', () => {
      hoveringStandard = true;
      updateChristmasButton();
    });

    standardModeButton.on('pointerout', () => {
      hoveringStandard = false;

      this.time.delayedCall(20, () => {
        updateChristmasButton();
      });
    });

    christmasModeButton.on('pointerover', () => {
      hoveringChristmas = true;
      updateChristmasButton();
    });

    christmasModeButton.on('pointerdown', () => {
      this.registry.set('gameMode', 'christmas');
      this.scene.stop('MenuScene');
      this.scene.stop('PopUpScene');
      this.scene.start('ChristmasScene');
    });

    standardModeButton.on('pointerdown', () => {
      this.scene.stop('ChristmasScene');
      this.scene.stop('PopUpScene');
      this.scene.start('MenuScene');
    });

    //defining switch status, "origin x" and "goal x"
    let accessibilityEnabled = false;
    const leftX = Accessibilitycircle.x;
    const rightX = leftX * 1.035;

    //prüft ob der switch an oder aus ist, speichert den zustand, wechselt auf den anderen zustand
    //tween für den kreisanimation

    const toggleAccessibility = () => {
      accessibilityEnabled = !accessibilityEnabled;

      this.registry.set('accessibilityMode', accessibilityEnabled);

      accessibilitySwitch.setTexture(accessibilityEnabled ? 'switchOn' : 'switchOff');
      this.tweens.add({
        targets: Accessibilitycircle,
        x: accessibilityEnabled ? rightX : leftX,
        duration: 150,
        ease: 'Power2',
      });
    };

    accessibilitySwitch.on('pointerdown', toggleAccessibility);
    Accessibilitycircle.on('pointerdown', toggleAccessibility);

    this.add
      .image(background.x, height - padding, 'closeLabel')
      .setScale(0.66)
      .setOrigin(0.5);

    // Slide the panel in from the right edge. The dim overlay stays in place.
    //added an array of all the elements. add element here, to animate
    const panel = [
      background,
      closeButton,
      settingsLabel,
      accessibilityLabel,
      AccessibilitySwitch,
      gamemodeLabel,
      standardModeButton,
      christmasModeButton,
      closeLabel,
    ];

    //fades the dimming in slowly
    this.tweens.add({ targets: dim, alpha: 1, duration: 200 });

    //animates each panel to move
    panel.forEach((obj) => (obj.x += width));
    this.tweens.add({
      targets: panel,
      x: `-=${width}`,
      duration: 200,
      ease: 'Cubic.easeOut',
    });

    let closing = false;
    const close = () => {
      if (closing) return; // ignore double clicks
      closing = true;
      this.tweens.add({ targets: panel, x: `+=${width}`, duration: 200, ease: 'Cubic.easeIn' });
      this.tweens.add({
        targets: dim,
        alpha: 0,
        duration: 200,
        onComplete: () => this.scene.stop(),
      });
    };

    closeButton.on('pointerdown', close);

    this.input.keyboard.once('keydown-M', close);
    this.input.keyboard.once('keydown-ESC', close);

    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const dialog = document.getElementById('settings-dialog');
    const accessibilityToggle = document.getElementById('accessible-toggle');
    accessibilityToggle.checked = this.registry.get('accessibility enabled') ?? false;
    const gameModeMenu = document.getElementById('game-mode-menu');
    gameModeMenu.value = this.registry.get('gameMode') ?? 'standard';

    const closeWindows = close;

    const handleAccessibilityChange = () => {
      this.registry.set('accessibility enabled', accessibilityToggle.checked);
    };
    accessibilityToggle.addEventListener('change', handleAccessibilityChange);

    const handleGameModeChange = () => {
      this.registry.set('gameMode', gameModeMenu.value);
      this.scene.stop(gameModeMenu.value === 'christmas' ? 'MenuScene' : 'ChristmasScene');
      this.scene.stop('PopUpScene');
      this.scene.start(gameModeMenu.value === 'christmas' ? 'ChristmasScene' : 'MenuScene');
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
      [gameModeMenu, standardModeButton],
    ]);
    dialog.showModal();

    // Hover-effects for the buttons

    closeButton.on('pointerover', () => {
      this.tweens.add({
        targets: closeButton,
        scaleX: 0.45,
        scaleY: 0.45,
        duration: 100,
      });
    });
    closeButton.on('pointerout', () => {
      this.tweens.add({
        targets: closeButton,
        scaleX: 0.4,
        scaleY: 0.4,
        duration: 100,
      });
    });

    AccessibilitySwitch.on('pointerover', () => {
      this.tweens.add({
        targets: AccessibilitySwitch,
        scaleX: 0.32,
        scaleY: 0.32,
        duration: 100,
      });
    });
    AccessibilitySwitch.on('pointerout', () => {
      this.tweens.add({
        targets: AccessibilitySwitch,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 100,
      });
    });
    standardModeButton.on('pointerover', () => {
      this.tweens.add({
        targets: standardModeButton,
        scaleX: 0.32,
        scaleY: 0.32,
        duration: 100,
      });
    });

    standardModeButton.on('pointerout', () => {
      this.tweens.add({
        targets: standardModeButton,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 100,
      });
    });
  }
}
