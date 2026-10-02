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
    // closeButton.on('pointerdown', () => this.scene.stop()); (replaced with animated closing anim)

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
    const AccessibilitySwitch = this.add
      .image(background.x * 1.06 + padding, height * 0.195, 'AccessibilitySwitchOff')
      .setScale(0.3)
      .setOrigin(0);

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

    const standardModeButton = this.add
      .image(gamemodeLabel.x * 1.2, gamemodeLabel.y * 0.97, 'StandardModeButton')
      .setScale(0.3)
      .setOrigin(0);

    const closeLabel = this.add
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
  }
}
