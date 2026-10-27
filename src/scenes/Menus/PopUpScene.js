import Phaser from 'phaser';

import InputManager from '../../objects/InputManager.js';
import { preloadMenuSounds, playMenuClick, bindMenuFocusSounds } from '../../../audio/sounds.js';

import { positionAccessibleControls } from '../../accessibility/positionControls.js';
import { setSetting } from '../../settings/gameSettings.js';

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

    const currentGameMode = this.registry.get('gameMode') ?? 'standard';
    const isChristmasMode = currentGameMode === 'christmas';

    gameModeMenu.setAttribute(
      'aria-label',
      `Game mode: ${isChristmasMode ? 'Christmas' : 'standard'}`,
    );
    gameModeMenu.setAttribute('aria-expanded', 'false');
    christmasModeChoice.setAttribute(
      'aria-label',
      `${isChristmasMode ? 'Standard' : 'Christmas'} mode`,
    );
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

    const gamemodeLabel = this.add
      .image(leftColumn, row2Y, 'Game Mode')
      .setScale(0.35 * uiScale)
      .setOrigin(0);

    const standardModeButton = this.add
      .image(rightColumn, row2Y, 'StandardModeButton')
      .setScale(0.3 * uiScale)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    const christmasModeButton = this.add
      .image(rightColumn, row2Y, 'christmasmode')
      .setOrigin(1, 0)
      .setScale(0.3 * uiScale)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    // Variante B: the active mode is the main button, the other mode is the dropdown choice.
    // We implement it by swapping textures so the layout stays the same (main button is standardModeButton).
    standardModeButton.setTexture(isChristmasMode ? 'christmasmode' : 'StandardModeButton');
    christmasModeButton.setTexture(isChristmasMode ? 'StandardModeButton' : 'christmasmode');

    let isGameModeDropdownOpen = false;

    const closedY = standardModeButton.y;
    const openY = standardModeButton.y + standardModeButton.displayHeight + 10;

    const updateGameModeDropdown = () => {
      gameModeMenu.setAttribute('aria-expanded', String(isGameModeDropdownOpen));
      christmasModeChoice.hidden = !isGameModeDropdownOpen;
      christmasModeChoice.disabled = !isGameModeDropdownOpen;
      this.tweens.killTweensOf(christmasModeButton);

      this.tweens.add({
        targets: christmasModeButton,
        y: isGameModeDropdownOpen ? openY : closedY,
        alpha: isGameModeDropdownOpen ? 1 : 0,
        duration: 150,
        ease: 'Power2',
      });
    };

    const applyGameMode = (mode) => {
      this.registry.set('gameMode', mode);
      setSetting('gameMode', mode);
    };

    const chooseChristmasMode = () => {
      playMenuClick(this);
      applyGameMode('christmas');
      this.scene.stop('MenuScene');
      this.scene.stop('PopUpScene');
      this.scene.start('ChristmasScene');
    };

    const chooseStandardMode = () => {
      playMenuClick(this);
      applyGameMode('standard');
      this.scene.stop('ChristmasScene');
      this.scene.stop('PopUpScene');
      this.scene.start('MenuScene');
    };

    const toggleGameModeDropdown = () => {
      playMenuClick(this);
      isGameModeDropdownOpen = !isGameModeDropdownOpen;
      updateGameModeDropdown();
    };

    const chooseAlternateMode = isChristmasMode ? chooseStandardMode : chooseChristmasMode;

    christmasModeButton.on('pointerdown', chooseAlternateMode);
    standardModeButton.on('pointerdown', toggleGameModeDropdown);

    // Load the saved state and remember the switch knob's two positions.
    let accessibilityEnabled = this.registry.get('accessibilityMode') ?? false;

    // Left position
    const switchLeft =
      accessibilitySwitch.x -
      accessibilitySwitch.displayWidth +
      accessibilitySwitch.displayHeight / 2;

    // Right position
    const switchRight = accessibilitySwitch.x - accessibilitySwitch.displayHeight / 2;

    accessibilitySwitch.setTexture(accessibilityEnabled ? 'switchOn' : 'switchOff');
    accessibilityKnob.x = accessibilityEnabled ? switchRight : switchLeft;
    accessibilityKnob.y = accessibilitySwitch.y + accessibilitySwitch.displayHeight / 2;
    const switchBaseScale = 0.37 * uiScale;
    const switchBaseWidth = accessibilitySwitch.displayWidth;
    const switchBaseHeight = accessibilitySwitch.displayHeight;
    let switchHovered = false;
    let switchSelected = false;

    const updateSwitchScale = () => {
      const scaleFactor = switchHovered || switchSelected ? 1.06 : 1;
      const scale = switchBaseScale * scaleFactor;
      const knobX = accessibilityEnabled
        ? accessibilitySwitch.x - (switchBaseHeight * scaleFactor) / 2
        : accessibilitySwitch.x -
          switchBaseWidth * scaleFactor +
          (switchBaseHeight * scaleFactor) / 2;
      const knobY = accessibilitySwitch.y + (switchBaseHeight * scaleFactor) / 2;

      this.tweens.add({
        targets: accessibilitySwitch,
        scale,
        duration: 100,
      });
      this.tweens.add({
        targets: accessibilityKnob,
        x: knobX,
        y: knobY,
        scale,
        duration: 100,
      });
    };

    const setAccessibilityEnabled = (enabled) => {
      accessibilityEnabled = enabled;
      this.registry.set('accessibilityMode', accessibilityEnabled);
      setSetting('accessibilityMode', accessibilityEnabled);

      accessibilityToggle.checked = accessibilityEnabled;

      accessibilitySwitch.setTexture(accessibilityEnabled ? 'switchOn' : 'switchOff');
      updateSwitchScale();
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
    const nativeInputEvents = ['mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'keyup'];
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

    const handleGameModeClick = toggleGameModeDropdown;
    const handleChristmasModeClick = chooseAlternateMode;
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
        {
          button: accessibilitySwitch,
          action: toggleAccessibility,
          scale: switchBaseScale,
          applySelection: (selected) => {
            switchSelected = selected;
            updateSwitchScale();
          },
        },
        { button: standardModeButton, action: toggleGameModeDropdown, scale: 0.3 * uiScale },
      ];

      if (isGameModeDropdownOpen) {
        items.push({
          button: christmasModeButton,
          action: chooseAlternateMode,
          scale: 0.3 * uiScale,
        });
      }

      return items;
    };
    this.selectedIndex = 0;
    this.updateGamepadSelection();

    const bindOverlayHover = (element, object, baseScale, hoverScale = 1.2) => {
      const updateScale = (hovered) => {
        const isSelected = this.navigationItems()[this.selectedIndex]?.button === object;
        const scale =
          baseScale *
          (hovered ? Math.max(hoverScale, isSelected ? 1.06 : 1) : isSelected ? 1.06 : 1);
        this.tweens.add({ targets: object, scale, duration: 100 });
      };
      const onEnter = () => updateScale(true);
      const onLeave = () => updateScale(false);
      element.addEventListener('mouseenter', onEnter);
      element.addEventListener('mouseleave', onLeave);
      this.events.once('shutdown', () => {
        element.removeEventListener('mouseenter', onEnter);
        element.removeEventListener('mouseleave', onLeave);
      });
    };

    bindOverlayHover(closeSettingsBtn, closeButton, 0.4 * uiScale);
    bindOverlayHover(gameModeMenu, standardModeButton, 0.3 * uiScale, 1.06);
    bindOverlayHover(christmasModeChoice, christmasModeButton, 0.3 * uiScale, 1.06);

    const setSwitchHover = (hovered) => {
      switchHovered = hovered;
      updateSwitchScale();
    };
    const onSwitchEnter = () => setSwitchHover(true);
    const onSwitchLeave = () => setSwitchHover(false);
    accessibilityToggle.addEventListener('mouseenter', onSwitchEnter);
    accessibilityToggle.addEventListener('mouseleave', onSwitchLeave);
    this.events.once('shutdown', () => {
      accessibilityToggle.removeEventListener('mouseenter', onSwitchEnter);
      accessibilityToggle.removeEventListener('mouseleave', onSwitchLeave);
    });

    bindMenuFocusSounds(this, ['close-settings', 'accessible-toggle', 'game-mode-menu']);
  }
  updateGamepadSelection() {
    const items = this.navigationItems();
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex, 0, items.length);

    items.forEach((item, index) => {
      const selected = index === this.selectedIndex;
      if (item.applySelection) {
        item.applySelection(selected);
      } else {
        this.tweens.add({
          targets: item.button,
          scale: selected ? item.scale * 1.06 : item.scale,
          duration: 100,
        });
      }
    });
  }

  update() {
    this.InputManager.update();
    const controls = this.InputManager.getControlsP1;
    const items = this.navigationItems();
    if (controls.button1) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex - 1, 0, items.length);
      this.updateGamepadSelection();
    } else if (controls.button3) {
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
