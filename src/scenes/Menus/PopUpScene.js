/* global Phaser */

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

    this.input.keyboard.once('keydown-M', () => this.scene.stop());
    this.input.keyboard.once('keydown-ESC', () => this.scene.stop());
  }
}
