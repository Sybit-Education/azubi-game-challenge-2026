import Phaser from 'phaser';

import InputManager from '../../objects/InputManager.js';
import { preloadMenuSounds, playMenuClick, bindMenuFocusSounds } from '../../../audio/sounds.js';

import { positionAccessibleControls } from '../../accessibility/positionControls.js';

export default class PopUpScene extends Phaser.Scene {
  constructor() {
    super('PopUpScene');
  }

  preload() {
    preloadMenuSounds(this);
    this.load.image('settingsBackground', 'assets/images/homepage/settings-menu/background.png');
    this.load.image('settingsLabel', 'assets/images/homepage/settings-menu/settings.png');
    this.load.image('xButton', 'assets/images/homepage/settings-menu/x.png');
    this.load.image(
      'Accessibility Mode',
      'assets/images/homepage/settings-menu/accessibility-mode.png',
    );
    this.load.image('switchOn', 'assets/images/homepage/settings-menu/switch-on.png');
    this.load.image('switchOff', 'assets/images/homepage/settings-menu/switch-off.png');
    this.load.image('switchCircle', 'assets/images/homepage/settings-menu/switch-circle.png');
    this.load.image('Game Mode', 'assets/images/homepage/settings-menu/game-mode-label.png');
    this.load.image(
      'AccessibilitySwitchOff',
      'assets/images/homepage/settings-menu/accessibility-switch-off.png',
    );
    this.load.image(
      'StandardModeButton',
      'assets/images/homepage/settings-menu/standard-mode-button.png',
    );
    this.load.image('closeLabel', 'assets/images/homepage/settings-menu/close-label.png');
    this.load.image(
      'christmasmode',
      'assets/images/homepage/settings-menu/christmas-mode-button.png',
    );
  }

  create() {
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    this.parentSceneKeys = ['MenuScene', 'ChristmasScene'].filter((key) =>
      this.scene.isActive(key),
    );
    this.parentSceneKeys.forEach((key) => this.scene.pause(key));

    this.scene.bringToTop();
    const { width, height } = this.scale;

    // Get HTML controls first so every handler can access them.
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const dialog = document.getElementById('settings-dialog');
    const accessibilityToggle = document.getElementById('accessible-toggle');
    const gameModeMenu = document.getElementById('game-mode-menu');
    const christmasModeChoice = document.getElementById('christmas-mode-choice');
    gameModeMenu.setAttribute(
      'aria-label',
      `Game mode: ${this.parentSceneKeys.includes('ChristmasScene') ? 'Christmas' : 'standard'}`,
    );
    gameModeMenu.setAttribute('aria-expanded', 'false');
    christmasModeChoice.hidden = true;
    christmasModeChoice.disabled = true;

    const padding = Math.max(24, Math.min(width, height) * 0.06);
    const uiScale = Phaser.Math.Clamp(
      Math.min(this.scale.width / 1920, this.scale.height / 1080),
      0.6, // minimum
      1, // maximum
    );

    const background = this.add.image(width * 0.8, 0, 'settingsBackground').setOrigin(0.5);
    background.displayWidth = width / 2.5;
    const popupLeft = background.x - background.displayWidth / 2;
    const popupRight = background.x + background.displayWidth / 2;
    const leftColumn = popupLeft + padding;
    const rightColumn = popupRight - padding;
    const rowGap = 120 * uiScale;
    const row1Y = height * 0.2;
    const row2Y = row1Y + rowGap;
    const row3Y = row2Y + rowGap * 2;

    const closeButton = this.add
      .image(background.x * 1.225, height * 0.05, 'xButton')
      .setScale(0.4 * uiScale)
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
      .setScale(0.3 * uiScale)
      .setOrigin(0.5);

    const accessibilityLabel = this.add
      .image(leftColumn, row1Y, 'Accessibility Mode')
      .setScale(0.35 * uiScale)
      .setOrigin(0);
    //rowY += Math.max(48, 58 * uiScale);

    // The visual switch and HTML checkbox share the same saved state.
    const accessibilitySwitch = this.add
      .image(rightColumn, row1Y, 'switchOff')
      .setScale(0.37 * uiScale)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    const accessibilityKnob = this.add
      .image(rightColumn, row1Y, 'switchCircle')
      .setScale(0.37 * uiScale)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    //rowY += Math.max(90, 112 * uiScale);
    const gamemodeLabel = this.add
      .image(leftColumn, row2Y, 'Game Mode')
      .setScale(0.35 * uiScale)
      .setOrigin(0);

    const standardModeButton = this.add
      .image(rightColumn, row2Y, 'StandardModeButton')
      .setScale(0.3 * uiScale)
      .setOrigin(1, 0)
      .setInteractive();

    const christmasModeButton = this.add
      .image(rightColumn, row2Y, 'christmasmode')
      .setOrigin(1, 0)
      .setScale(0.3 * uiScale)
      .setAlpha(0)
      .setInteractive();

    let hoveringStandard = false;
    let hoveringChristmas = false;

    const closedY = standardModeButton.y;
    const openY = standardModeButton.y + standardModeButton.displayHeight + 10;

    const updateChristmasButton = () => {
      const shouldBeOpen = hoveringStandard || hoveringChristmas;

      gameModeMenu.setAttribute('aria-expanded', String(shouldBeOpen));
      christmasModeChoice.hidden = !shouldBeOpen;
      christmasModeChoice.disabled = !shouldBeOpen;
      this.tweens.killTweensOf(christmasModeButton);

      this.tweens.add({
        targets: christmasModeButton,
        y: shouldBeOpen ? openY : closedY,
        alpha: shouldBeOpen ? 1 : 0,
        duration: 150,
        ease: 'Power2',
      });
    };

    const chooseChristmasMode = () => {
      playMenuClick(this);
      this.registry.set('gameMode', 'christmas');
      this.scene.stop('MenuScene');
      this.scene.stop('PopUpScene');
      this.scene.start('ChristmasScene');
    };

    const chooseStandardMode = () => {
      playMenuClick(this);
      //Return from Christmas mode to standard mode.
      if (this.parentSceneKeys.includes('ChristmasScene')) {
        this.registry.set('gameMode', 'standard');
        this.scene.stop('ChristmasScene');
        this.scene.stop('PopUpScene');
        this.scene.start('MenuScene');
        return;
      }
      hoveringStandard = !hoveringStandard; // Toggle the dropdown on each click.
      updateChristmasButton();
    };

    christmasModeButton.on('pointerdown', chooseChristmasMode);
    standardModeButton.on('pointerdown', chooseStandardMode);

    // Load the saved state and remember the switch knob's two positions.
    let accessibilityEnabled =
      this.registry.get('accessibility enabled') ?? this.registry.get('accessibilityMode') ?? false;

    // Left position
    const switchLeft =
      accessibilitySwitch.x -
      accessibilitySwitch.displayWidth +
      accessibilitySwitch.displayHeight / 2;

    // Right position
    const switchRight = accessibilitySwitch.x - accessibilitySwitch.displayHeight / 2;

    // Sets coordinates
    accessibilitySwitch.setTexture(accessibilityEnabled ? 'switchOn' : 'switchOff');
    accessibilityKnob.x = accessibilityEnabled ? switchRight : switchLeft;
    accessibilityKnob.y = accessibilitySwitch.y + accessibilitySwitch.displayHeight / 2;

    // Mouse, keyboard and gamepad use the same function to change the state.

    const setAccessibilityEnabled = (enabled) => {
      accessibilityEnabled = enabled;
      this.registry.set('accessibility enabled', accessibilityEnabled);
      // Other game code still uses this legacy key. Keep both keys in sync.
      this.registry.set('accessibilityMode', accessibilityEnabled);
      accessibilityToggle.checked = accessibilityEnabled;

      accessibilitySwitch.setTexture(accessibilityEnabled ? 'switchOn' : 'switchOff');
      this.tweens.add({
        targets: accessibilityKnob,
        x: accessibilityEnabled ? switchRight : switchLeft,
        duration: 150,
        ease: 'Power2',
      });
    };

    const toggleAccessibility = () => {
      playMenuClick(this);
      setAccessibilityEnabled(!accessibilityEnabled);
    };

    accessibilitySwitch.on('pointerdown', toggleAccessibility);
    accessibilityKnob.on('pointerdown', toggleAccessibility);

    const closeLabel = this.add
      .image(background.x, row3Y * 2, 'closeLabel')
      .setScale(0.66 * uiScale)
      .setOrigin(0.5);

    // Slide the panel in from the right edge. The dim overlay stays in place.
    //added an array of all the elements. add element here, to animate
    const panel = [
      accessibilityKnob,
      background,
      closeButton,
      settingsLabel,
      accessibilityLabel,
      accessibilitySwitch,
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
      playMenuClick(this);
      closing = true;
      this.tweens.add({ targets: panel, x: `+=${width}`, duration: 200, ease: 'Cubic.easeIn' });
      this.tweens.add({
        targets: dim,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          this.scene.stop();
          this.parentSceneKeys.forEach((key) => {
            const parentScene = this.scene.get(key);
            parentScene.InputManager?.resetButtonStates();
            this.scene.resume(key);
          });
        },
      });
    };

    closeButton.on('pointerdown', close);

    this.input.keyboard.once('keydown-M', close);
    this.input.keyboard.once('keydown-ESC', close);

    accessibilityToggle.checked = accessibilityEnabled;

    // Phaser also listens on window. Input in the HTML dialog must not
    // trigger the visual controls a second time. Do not use preventDefault:
    // native checkbox and keyboard behavior must keep working.
    const nativeInputEvents = [
      'mousedown',
      'mouseup',
      'touchstart',
      'touchend',
      'keydown',
      'keyup',
    ];
    const stopPhaserInput = (event) => {
      const formControl = event.target.closest('button, input, select');
      if (formControl) event.stopPropagation();
    };
    for (const eventName of nativeInputEvents) {
      dialog.addEventListener(eventName, stopPhaserInput);
    }

    const closeWindows = close;

    const handleAccessibilityChange = () => {
      playMenuClick(this);
      setAccessibilityEnabled(accessibilityToggle.checked);
    };
    accessibilityToggle.addEventListener('change', handleAccessibilityChange);

    const handleGameModeClick = chooseStandardMode;
    const handleChristmasModeClick = chooseChristmasMode;
    gameModeMenu.addEventListener('click', handleGameModeClick);
    christmasModeChoice.addEventListener('click', handleChristmasModeClick);
    closeSettingsBtn.addEventListener('click', closeWindows);

    const handleCancel = (event) => {
      event.preventDefault();
      closeWindows();
    };

    dialog.addEventListener('cancel', handleCancel);

    this.events.once('shutdown', () => {
      for (const eventName of nativeInputEvents) {
        dialog.removeEventListener(eventName, stopPhaserInput);
      }
      closeSettingsBtn.removeEventListener('click', closeWindows);
      dialog.removeEventListener('cancel', handleCancel);
      accessibilityToggle.removeEventListener('change', handleAccessibilityChange);
      gameModeMenu.removeEventListener('click', handleGameModeClick);
      christmasModeChoice.removeEventListener('click', handleChristmasModeClick);
      dialog.close();
      settingsBtn.focus();
    });

    positionAccessibleControls(this, [
      [closeSettingsBtn, closeButton],
      [accessibilityToggle, accessibilitySwitch],
      [gameModeMenu, standardModeButton],
      [christmasModeChoice, christmasModeButton],
    ]);
    dialog.showModal();

    this.navigationItems = () => {
      const items = [
        { button: closeButton, action: close, scale: 0.4 * uiScale },
        { button: accessibilitySwitch, action: toggleAccessibility, scale: 0.37 * uiScale },
        { button: standardModeButton, action: chooseStandardMode, scale: 0.3 * uiScale },
      ];

      if (hoveringStandard) {
        items.push({
          button: christmasModeButton,
          action: chooseChristmasMode,
          scale: 0.3 * uiScale,
        });
      }

      return items;
    };
    this.selectedIndex = 0;
    this.updateGamepadSelection();

    // Hover-effects for the buttons

    closeButton.on('pointerover', () => {
      this.tweens.add({
        targets: closeButton,
        scaleX: 0.45 * uiScale,
        scaleY: 0.45 * uiScale,
        duration: 100,
      });
    });
    closeButton.on('pointerout', () => {
      this.tweens.add({
        targets: closeButton,
        scaleX: 0.4 * uiScale,
        scaleY: 0.4 * uiScale,
        duration: 100,
      });
    });

    standardModeButton.on('pointerover', () => {
      this.tweens.add({
        targets: standardModeButton,
        scaleX: 0.32 * uiScale,
        scaleY: 0.32 * uiScale,
        duration: 100,
      });
    });

    standardModeButton.on('pointerout', () => {
      this.tweens.add({
        targets: standardModeButton,
        scaleX: 0.3 * uiScale,
        scaleY: 0.3 * uiScale,
        duration: 100,
      });
    });
    bindMenuFocusSounds(this, ['close-settings', 'accessible-toggle', 'game-mode-menu']);
  }
  updateGamepadSelection() {
    const items = this.navigationItems();
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex, 0, items.length);

    items.forEach((item, index) => {
      this.tweens.add({
        targets: item.button,
        scale: index === this.selectedIndex ? item.scale * 1.12 : item.scale,
        duration: 100,
      });
    });
  }

  update() {
    this.InputManager.update();
    const controls = this.InputManager.getControlsP1;
    const items = this.navigationItems();
    if (controls.button1 || controls.accelerate) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex - 1, 0, items.length);
      this.updateGamepadSelection();
    } else if (controls.button3 || controls.brake) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + 1, 0, items.length);
      this.updateGamepadSelection();
    } else if (controls.button2) {
      this.navigationItems()[this.selectedIndex].action();
      this.updateGamepadSelection();
    } else if (controls.button4) {
      this.navigationItems()[0].action();
    }
  }
}
