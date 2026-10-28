import Phaser from 'phaser';

import InputManager from '../../objects/InputManager.js';
import { preloadMenuSounds, playMenuClick, bindMenuFocusSounds } from '../../../audio/sounds.js';
import { positionAccessibleControls } from '../../accessibility/positionControls.js';
import { setSetting } from '../../settings/gameSettings.js';

// ---------------------------------------------------------------------------
// UI constants
// ---------------------------------------------------------------------------
const SCALE_CLOSE_BTN = 0.4;
const SCALE_LABEL = 0.3;
const SCALE_LABEL_LARGE = 0.35;
const SCALE_SWITCH = 0.37;
const SCALE_CLOSE_LABEL = 0.66;
const SCALE_MODE_BTN = 0.3;

const DIM_ALPHA = 0.48;
const ROW_GAP_BASE = 120;
const DROPDOWN_GAP = 10;
const HOVER_SCALE_FACTOR = 1.06;
const TWEEN_DURATION_FAST = 100;
const TWEEN_DURATION_MID = 150;
const TWEEN_DURATION_SLOW = 200;

// Phaser reads native DOM events on window; these must not bubble from the HTML dialog.
const NATIVE_INPUT_EVENTS = ['mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'keyup'];

export default class PopUpScene extends Phaser.Scene {
  constructor() {
    super('PopUpScene');
  }

  // -------------------------------------------------------------------------
  // Phaser lifecycle
  // -------------------------------------------------------------------------

  /** Loads all assets required by the settings panel. */
  preload() {
    preloadMenuSounds(this);
    this.load.image('settingsBackground', 'assets/images/homepage/settings-menu/background.png');
    this.load.image('settingsLabel', 'assets/images/homepage/settings-menu/settings.png');
    this.load.image('xButton', 'assets/images/homepage/settings-menu/x.png');
    this.load.image(
      'accessibilityModeLabel',
      'assets/images/homepage/settings-menu/accessibility-mode.png',
    );
    this.load.image('switchOn', 'assets/images/homepage/settings-menu/switch-on.png');
    this.load.image('switchOff', 'assets/images/homepage/settings-menu/switch-off.png');
    this.load.image('switchCircle', 'assets/images/homepage/settings-menu/switch-circle.png');
    this.load.image('gameModeLabel', 'assets/images/homepage/settings-menu/game-mode-label.png');
    this.load.image(
      'standardModeButton',
      'assets/images/homepage/settings-menu/standard-mode-button.png',
    );
    this.load.image('closeLabel', 'assets/images/homepage/settings-menu/close-label.png');
    this.load.image(
      'christmasModeButton',
      'assets/images/homepage/settings-menu/christmas-mode-button.png',
    );
  }

  /**
   * Initialises the settings panel: builds the layout, wires up all
   * event handlers and opens the HTML dialog.
   */
  create() {
    this._setupInputManager();
    this._pauseParentScenes();
    this.scene.bringToTop();

    const { width, height } = this.scale;
    this._uiScale = Phaser.Math.Clamp(Math.min(width / 1920, height / 1080), 0.6, 1);

    this._html = this._getHtmlElements();
    this._initGameModeState();
    this._initAccessibilityState();

    this._closing = false;
    this._buildLayout(width, height);
    this._setupGameModeDropdown();
    this._setupAccessibilitySwitch();
    this._setupCloseHandlers();
    this._setupHtmlEventHandlers();
    this._setupGamepadNavigation();
    this._animateIn(width);

    this._html.dialog.showModal();
  }

  /**
   * Highlights the currently selected navigation item and resets all others.
   * Called after `selectedIndex` changes.
   */
  updateGamepadSelection() {
    const items = this.navigationItems;
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex, 0, items.length);

    items.forEach((item, index) => {
      const selected = index === this.selectedIndex;
      if (item.applySelection) {
        item.applySelection(selected);
      } else {
        this.tweens.add({
          targets: item.button,
          scale: selected ? item.scale * HOVER_SCALE_FACTOR : item.scale,
          duration: TWEEN_DURATION_FAST,
        });
      }
    });
  }

  /**
   * Phaser game loop — polls gamepad/keyboard input each frame and delegates
   * to the appropriate navigation action.
   */
  update() {
    this.InputManager.update();
    const controls = this.InputManager.getControlsP1;
    const items = this.navigationItems;
    const upPressed = controls.up && this._hasReadVerticalInput && !this._previousUp;
    const downPressed = controls.down && this._hasReadVerticalInput && !this._previousDown;
    this._previousUp = controls.up;
    this._previousDown = controls.down;
    this._hasReadVerticalInput = true;

    if (upPressed) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex - 1, 0, items.length);
      this.updateGamepadSelection();
    } else if (downPressed) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + 1, 0, items.length);
      this.updateGamepadSelection();
    } else if (controls.button3) {
      items[this.selectedIndex].action();
      this.updateGamepadSelection();
    } else if (controls.button4) {
      items[0].action();
    }
  }

  // -------------------------------------------------------------------------
  // Initialisation helpers
  // -------------------------------------------------------------------------

  /** Creates and initialises the InputManager for this scene. */
  _setupInputManager() {
    this.InputManager = new InputManager(this);
    this.InputManager.create();
  }

  /** Pauses whichever of MenuScene / ChristmasScene is currently active. */
  _pauseParentScenes() {
    this.parentSceneKeys = ['MenuScene', 'ChristmasScene'].filter((key) =>
      this.scene.isActive(key),
    );
    this.parentSceneKeys.forEach((key) => this.scene.pause(key));
  }

  /**
   * Returns an object containing all HTML elements the scene interacts with.
   * Centralises every `document.getElementById` call in one place.
   * @returns {{ settingsBtn: HTMLElement, closeSettingsBtn: HTMLElement, dialog: HTMLDialogElement, accessibilityToggle: HTMLInputElement, gameModeMenu: HTMLButtonElement, christmasModeChoice: HTMLButtonElement }}
   */
  _getHtmlElements() {
    return {
      settingsBtn: document.getElementById('settings-btn'),
      closeSettingsBtn: document.getElementById('close-settings'),
      dialog: document.getElementById('settings-dialog'),
      accessibilityToggle: document.getElementById('accessible-toggle'),
      gameModeMenu: document.getElementById('game-mode-menu'),
      christmasModeChoice: document.getElementById('christmas-mode-choice'),
    };
  }

  /**
   * Reads the current game-mode from the registry, derives helper flags
   * and sets the initial ARIA attributes on the HTML controls.
   */
  _initGameModeState() {
    const { gameModeMenu, christmasModeChoice } = this._html;

    const currentGameMode = this.registry.get('gameMode') ?? 'standard';
    this._isChristmasMode = currentGameMode === 'christmas';
    this._isDropdownOpen = false;

    gameModeMenu.setAttribute(
      'aria-label',
      `Game mode: ${this._isChristmasMode ? 'Christmas' : 'standard'}`,
    );
    gameModeMenu.setAttribute('aria-expanded', 'false');
    christmasModeChoice.setAttribute(
      'aria-label',
      `${this._isChristmasMode ? 'Standard' : 'Christmas'} mode`,
    );
    christmasModeChoice.hidden = true;
    christmasModeChoice.disabled = true;
  }

  /** Reads the persisted accessibility setting and resets hover/selection flags. */
  _initAccessibilityState() {
    this._accessibilityEnabled = this.registry.get('accessibilityMode') ?? false;
    this._switchHovered = false;
    this._switchSelected = false;
  }

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------

  /**
   * Creates all Phaser game objects (background, buttons, labels, switch)
   * and computes layout coordinates.
   * Also populates `this._panelObjects` for slide animations.
   * @param {number} width  Canvas width in pixels.
   * @param {number} height Canvas height in pixels.
   */
  _buildLayout(width, height) {
    const s = this._uiScale;
    const padding = Math.max(24, Math.min(width, height) * 0.06);
    const rowGap = ROW_GAP_BASE * s;
    const row1Y = height * 0.2;
    const row2Y = row1Y + rowGap;
    const row3Y = row2Y + rowGap * 2;

    const background = this.add.image(width * 0.8, 0, 'settingsBackground').setOrigin(0.5);
    background.displayWidth = width / 2.5;

    const popupLeft = background.x - background.displayWidth / 2;
    const popupRight = background.x + background.displayWidth / 2;
    const leftColumn = popupLeft + padding;
    const rightColumn = popupRight - padding;

    // Dim backdrop — clicking outside closes the panel
    this._dim = this.add
      .rectangle(0, 0, width, height, 0x000000, DIM_ALPHA)
      .setOrigin(0)
      .setInteractive()
      .setAlpha(0);
    this._dim.on('pointerdown', () => this._close());

    // Close (X) button
    this._closeButton = this.add
      .image(background.x * 1.225, height * 0.05, 'xButton')
      .setScale(SCALE_CLOSE_BTN * s)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    this._closeButton.setDepth(9999);

    // Static decorative labels
    const settingsLabel = this.add
      .image(background.x, padding, 'settingsLabel')
      .setScale(SCALE_LABEL * s)
      .setOrigin(0.5);

    const accessibilityLabel = this.add
      .image(leftColumn, row1Y, 'accessibilityModeLabel')
      .setScale(SCALE_LABEL_LARGE * s)
      .setOrigin(0);

    const gamemodeLabel = this.add
      .image(leftColumn, row2Y, 'gameModeLabel')
      .setScale(SCALE_LABEL_LARGE * s)
      .setOrigin(0);

    this._closeLabel = this.add
      .image(background.x, row3Y * 2, 'closeLabel')
      .setScale(SCALE_CLOSE_LABEL * s)
      .setOrigin(0.5);

    // Accessibility toggle switch
    this._accessibilitySwitch = this.add
      .image(rightColumn, row1Y, 'switchOff')
      .setScale(SCALE_SWITCH * s)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    this._accessibilityKnob = this.add
      .image(rightColumn, row1Y, 'switchCircle')
      .setScale(SCALE_SWITCH * s)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true });

    // Game-mode buttons — active one is shown, inactive one slides down as dropdown
    this._standardModeButton = this.add
      .image(rightColumn, row2Y, 'standardModeButton')
      .setScale(SCALE_MODE_BTN * s)
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });

    this._christmasModeButton = this.add
      .image(rightColumn, row2Y, 'christmasModeButton')
      .setOrigin(1, 0)
      .setScale(SCALE_MODE_BTN * s)
      .setAlpha(0)
      .setInteractive();

    this._activeModeButton = this._isChristmasMode
      ? this._christmasModeButton
      : this._standardModeButton;
    this._inactiveModeButton = this._isChristmasMode
      ? this._standardModeButton
      : this._christmasModeButton;
    this._inactiveModeButton.setAlpha(0);
    this._activeModeButton.setAlpha(1);

    this._dropdownClosedY = this._activeModeButton.y;
    this._dropdownOpenY =
      this._activeModeButton.y + this._activeModeButton.displayHeight + DROPDOWN_GAP;

    // Collect all panel objects for the slide-in/out animation
    this._panelObjects = [
      background,
      this._closeButton,
      settingsLabel,
      accessibilityLabel,
      gamemodeLabel,
      this._closeLabel,
      this._accessibilitySwitch,
      this._accessibilityKnob,
      this._standardModeButton,
      this._christmasModeButton,
    ];
  }

  // -------------------------------------------------------------------------
  // Game-mode dropdown
  // -------------------------------------------------------------------------

  /** Attaches pointerdown handlers to the active/inactive game-mode buttons. */
  _setupGameModeDropdown() {
    this._activeModeButton.on('pointerdown', () => this._toggleDropdown());
    this._inactiveModeButton.on('pointerdown', () => this._chooseAlternateMode());
  }

  /**
   * Persists the chosen game mode to both the Phaser registry and local settings.
   * @param {'standard'|'christmas'} mode
   */
  _applyGameMode(mode) {
    this.registry.set('gameMode', mode);
    setSetting('gameMode', mode);
  }

  /**
   * Saves the mode, swaps the background scene and updates PopUpScene in-place.
   * PopUpScene stays open — no full reload needed.
   * @param {'standard'|'christmas'} mode
   */
  _switchToMode(mode) {
    playMenuClick(this);
    this._applyGameMode(mode);

    // Swap the background scene behind PopUpScene
    const oldParent = this._isChristmasMode ? 'ChristmasScene' : 'MenuScene';
    const newParent = this._isChristmasMode ? 'MenuScene' : 'ChristmasScene';

    this.scene.stop(oldParent);
    this.scene.launch(newParent);

    // Pause the new parent once it has finished its own create() cycle,
    // so it doesn't process input while PopUpScene is in the foreground.
    const newScene = this.scene.get(newParent);
    newScene.events.once('create', () => {
      if (this.scene.isActive(newParent)) this.scene.pause(newParent);
    });

    this.parentSceneKeys = [newParent];

    // Update mode state and refresh the UI in-place
    this._isChristmasMode = mode === 'christmas';
    this._updateModeButtons();
  }

  /** Switches to whichever mode is currently *not* active. */
  _chooseAlternateMode() {
    this._switchToMode(this._isChristmasMode ? 'standard' : 'christmas');
  }

  /**
   * Swaps the active/inactive game-mode buttons, updates ARIA labels,
   * repositions the HTML overlay controls and rebuilds gamepad navigation.
   * Called after a mode switch while PopUpScene remains open.
   */
  _updateModeButtons() {
    const { gameModeMenu, christmasModeChoice, closeSettingsBtn, accessibilityToggle } = this._html;

    // Close dropdown first if it was open
    if (this._isDropdownOpen) {
      this._isDropdownOpen = false;
      this._updateDropdownHtml();
      this._updateDropdownVisual();
    }

    // Remove old Phaser pointerdown handlers
    this._activeModeButton.off('pointerdown');
    this._inactiveModeButton.off('pointerdown');

    // Swap references
    [this._activeModeButton, this._inactiveModeButton] = [
      this._inactiveModeButton,
      this._activeModeButton,
    ];

    // Kill any lingering tweens (e.g. from a dropdown close tween that was
    // still running on what is now the active button)
    this.tweens.killTweensOf(this._activeModeButton);
    this.tweens.killTweensOf(this._inactiveModeButton);

    // Reset both buttons to the original row after swapping their roles.
    this._activeModeButton.setAlpha(1);
    this._activeModeButton.setY(this._dropdownClosedY);
    this._inactiveModeButton.setAlpha(0).setY(this._dropdownClosedY);

    // Re-attach Phaser pointerdown
    this._activeModeButton.on('pointerdown', () => this._toggleDropdown());
    this._inactiveModeButton.on('pointerdown', () => this._chooseAlternateMode());

    // Update ARIA labels
    gameModeMenu.setAttribute(
      'aria-label',
      `Game mode: ${this._isChristmasMode ? 'Christmas' : 'standard'}`,
    );
    christmasModeChoice.setAttribute(
      'aria-label',
      `${this._isChristmasMode ? 'Standard' : 'Christmas'} mode`,
    );

    // Reposition accessible HTML overlay controls
    positionAccessibleControls(this, [
      [closeSettingsBtn, this._closeButton],
      [accessibilityToggle, this._accessibilitySwitch],
      [gameModeMenu, this._activeModeButton],
      [christmasModeChoice, this._inactiveModeButton],
    ]);

    // Rebuild and reset gamepad navigation
    this._rebuildNavigationItems();
    this.updateGamepadSelection();
  }

  /** Toggles the game-mode dropdown open/closed and rebuilds navigation items. */
  _toggleDropdown() {
    playMenuClick(this);
    this._isDropdownOpen = !this._isDropdownOpen;
    this._updateDropdownHtml();
    this._updateDropdownVisual();
    this._rebuildNavigationItems();
  }

  /** Syncs ARIA attributes and the hidden/disabled state of the HTML choice button. */
  _updateDropdownHtml() {
    const { gameModeMenu, christmasModeChoice } = this._html;
    gameModeMenu.setAttribute('aria-expanded', String(this._isDropdownOpen));
    christmasModeChoice.hidden = !this._isDropdownOpen;
    christmasModeChoice.disabled = !this._isDropdownOpen;
  }

  /** Tweens the inactive mode button into or out of the dropdown position. */
  _updateDropdownVisual() {
    const btn = this._inactiveModeButton;
    this.tweens.killTweensOf(btn);
    this.tweens.add({
      targets: btn,
      y: this._isDropdownOpen ? this._dropdownOpenY : this._dropdownClosedY,
      alpha: this._isDropdownOpen ? 1 : 0,
      duration: TWEEN_DURATION_MID,
      ease: 'Power2',
    });
  }

  // -------------------------------------------------------------------------
  // Accessibility switch
  // -------------------------------------------------------------------------

  /**
   * Measures the switch widget, positions the knob for the current state
   * and attaches pointerdown listeners.
   */
  _setupAccessibilitySwitch() {
    const sw = this._accessibilitySwitch;
    const knob = this._accessibilityKnob;

    this._switchBaseScale = SCALE_SWITCH * this._uiScale;
    this._switchBaseWidth = sw.displayWidth;
    this._switchBaseHeight = sw.displayHeight;

    sw.setTexture(this._accessibilityEnabled ? 'switchOn' : 'switchOff');
    knob.x = this._accessibilityEnabled
      ? sw.x - sw.displayHeight / 2
      : sw.x - sw.displayWidth + sw.displayHeight / 2;
    knob.y = sw.y + sw.displayHeight / 2;

    this._html.accessibilityToggle.checked = this._accessibilityEnabled;

    sw.on('pointerdown', () => this._toggleAccessibility());
    knob.on('pointerdown', () => this._toggleAccessibility());
  }

  /**
   * Tweens the switch and knob to the correct scale and knob position,
   * taking hover and gamepad-selection state into account.
   */
  _updateSwitchScale() {
    const scaleFactor = this._switchHovered || this._switchSelected ? HOVER_SCALE_FACTOR : 1;
    const scale = this._switchBaseScale * scaleFactor;
    const sw = this._accessibilitySwitch;
    const knobX = this._accessibilityEnabled
      ? sw.x - (this._switchBaseHeight * scaleFactor) / 2
      : sw.x - this._switchBaseWidth * scaleFactor + (this._switchBaseHeight * scaleFactor) / 2;
    const knobY = sw.y + (this._switchBaseHeight * scaleFactor) / 2;

    this.tweens.killTweensOf(sw);
    this.tweens.killTweensOf(this._accessibilityKnob);
    this.tweens.add({ targets: sw, scale, duration: TWEEN_DURATION_FAST });
    this.tweens.add({
      targets: this._accessibilityKnob,
      x: knobX,
      y: knobY,
      scale,
      duration: TWEEN_DURATION_FAST,
    });
  }

  /**
   * Persists the accessibility setting, updates the HTML checkbox,
   * changes the switch texture and re-runs the scale tween.
   * @param {boolean} enabled
   */
  _setAccessibilityEnabled(enabled) {
    this._accessibilityEnabled = enabled;
    this.registry.set('accessibilityMode', enabled);
    // Gameplay announcements still read this key; keep both values in sync.
    this.registry.set('accessibility enabled', enabled);
    setSetting('accessibilityMode', enabled);
    this._html.accessibilityToggle.checked = enabled;
    this._accessibilitySwitch.setTexture(enabled ? 'switchOn' : 'switchOff');
    this._updateSwitchScale();
  }

  /** Plays the click sound and flips the accessibility setting. */
  _toggleAccessibility() {
    playMenuClick(this);
    this._setAccessibilityEnabled(!this._accessibilityEnabled);
  }

  // -------------------------------------------------------------------------
  // Close / animation
  // -------------------------------------------------------------------------

  /** Binds the X button to `_close()`. */
  _setupCloseHandlers() {
    this._closeButton.on('pointerdown', () => this._close());
  }

  /**
   * Slides the panel out, fades the dim overlay and stops the scene.
   * A guard prevents double-invocation.
   */
  _close() {
    if (this._closing) return;
    playMenuClick(this);
    this._closing = true;
    this.tweens.add({
      targets: this._panelObjects,
      x: `+=${this.scale.width}`,
      duration: TWEEN_DURATION_SLOW,
      ease: 'Cubic.easeIn',
    });
    this.tweens.add({
      targets: this._dim,
      alpha: 0,
      duration: TWEEN_DURATION_SLOW,
      onComplete: () => {
        this.scene.stop();
        this.parentSceneKeys.forEach((key) => {
          const parentScene = this.scene.get(key);
          parentScene.InputManager?.resetButtonStates();
          this.scene.resume(key);
        });
      },
    });
  }

  /**
   * Fades in the dim backdrop and slides the panel in from the right.
   * @param {number} width Canvas width — used as the slide offset.
   */
  _animateIn(width) {
    this.tweens.add({ targets: this._dim, alpha: 1, duration: TWEEN_DURATION_SLOW });
    this._panelObjects.forEach((obj) => (obj.x += width));
    this.tweens.add({
      targets: this._panelObjects,
      x: `-=${width}`,
      duration: TWEEN_DURATION_SLOW,
      ease: 'Cubic.easeOut',
    });
  }

  // -------------------------------------------------------------------------
  // HTML event handlers & cleanup
  // -------------------------------------------------------------------------

  /**
   * Registers all HTML event listeners (change, click, cancel, hover, etc.),
   * positions the accessible overlay controls and schedules cleanup on shutdown.
   */
  _setupHtmlEventHandlers() {
    const { dialog, accessibilityToggle, gameModeMenu, christmasModeChoice, closeSettingsBtn } =
      this._html;
    const s = this._uiScale;

    // Prevent Phaser from receiving events that target HTML form controls
    this._stopPhaserInput = (event) => {
      if (event.target.closest('button, input, select')) event.stopPropagation();
    };
    NATIVE_INPUT_EVENTS.forEach((name) => dialog.addEventListener(name, this._stopPhaserInput));

    // Named handler references kept for cleanup
    this._handleAccessibilityChange = () => {
      playMenuClick(this);
      this._setAccessibilityEnabled(accessibilityToggle.checked);
    };
    this._handleGameModeClick = () => this._toggleDropdown();
    this._handleAlternateModeClick = () => this._chooseAlternateMode();
    this._handleCloseClick = () => this._close();
    this._handleModeShortcut = (event) => {
      if (event.key.toLowerCase() === 'm') this._close();
    };
    this._handleCancel = (e) => {
      e.preventDefault();
      this._close();
    };

    accessibilityToggle.addEventListener('change', this._handleAccessibilityChange);
    gameModeMenu.addEventListener('click', this._handleGameModeClick);
    christmasModeChoice.addEventListener('click', this._handleAlternateModeClick);
    closeSettingsBtn.addEventListener('click', this._handleCloseClick);
    dialog.addEventListener('keydown', this._handleModeShortcut);
    dialog.addEventListener('cancel', this._handleCancel);

    // Hover effects — pass getters so the correct button is used after a mode swap
    this._bindOverlayHover(closeSettingsBtn, this._closeButton, SCALE_CLOSE_BTN * s);
    this._bindOverlayHover(
      gameModeMenu,
      () => this._activeModeButton,
      SCALE_MODE_BTN * s,
      HOVER_SCALE_FACTOR,
    );
    this._bindOverlayHover(
      christmasModeChoice,
      () => this._inactiveModeButton,
      SCALE_MODE_BTN * s,
      HOVER_SCALE_FACTOR,
    );

    const onSwitchEnter = () => {
      this._switchHovered = true;
      this._updateSwitchScale();
    };
    const onSwitchLeave = () => {
      this._switchHovered = false;
      this._updateSwitchScale();
    };
    accessibilityToggle.addEventListener('mouseenter', onSwitchEnter);
    accessibilityToggle.addEventListener('mouseleave', onSwitchLeave);
    this._cleanupSwitchHover = () => {
      accessibilityToggle.removeEventListener('mouseenter', onSwitchEnter);
      accessibilityToggle.removeEventListener('mouseleave', onSwitchLeave);
    };

    positionAccessibleControls(this, [
      [closeSettingsBtn, this._closeButton],
      [accessibilityToggle, this._accessibilitySwitch],
      [gameModeMenu, this._activeModeButton],
      [christmasModeChoice, this._inactiveModeButton],
    ]);

    bindMenuFocusSounds(this, ['close-settings', 'accessible-toggle', 'game-mode-menu']);

    this.events.once('shutdown', () => this._cleanup());
  }

  /** Single consolidated cleanup — called once on scene shutdown. */
  _cleanup() {
    const {
      dialog,
      accessibilityToggle,
      gameModeMenu,
      christmasModeChoice,
      closeSettingsBtn,
      settingsBtn,
    } = this._html;
    NATIVE_INPUT_EVENTS.forEach((name) => dialog.removeEventListener(name, this._stopPhaserInput));
    accessibilityToggle.removeEventListener('change', this._handleAccessibilityChange);
    gameModeMenu.removeEventListener('click', this._handleGameModeClick);
    christmasModeChoice.removeEventListener('click', this._handleAlternateModeClick);
    closeSettingsBtn.removeEventListener('click', this._handleCloseClick);
    dialog.removeEventListener('keydown', this._handleModeShortcut);
    dialog.removeEventListener('cancel', this._handleCancel);
    this._cleanupSwitchHover?.();

    dialog.close();
    settingsBtn.focus();
  }

  /**
   * Mirrors mouse-hover on an HTML overlay element as a scale tween on the
   * corresponding Phaser game object.
   * Accepts either a direct object reference or a getter `() => object`,
   * so the correct button is used even after a mode swap.
   * @param {HTMLElement} element    The HTML element to listen on.
   * @param {Phaser.GameObjects.Image|function} objectOrGetter The Phaser object (or getter).
   * @param {number} baseScale       The object's resting scale.
   * @param {number} [hoverScale=1.2] Scale multiplier while hovered.
   */
  _bindOverlayHover(element, objectOrGetter, baseScale, hoverScale = 1.2) {
    const getObject = () =>
      typeof objectOrGetter === 'function' ? objectOrGetter() : objectOrGetter;
    const updateScale = (hovered) => {
      const object = getObject();
      const isSelected = this.navigationItems[this.selectedIndex]?.button === object;
      const scale =
        baseScale *
        (hovered
          ? Math.max(hoverScale, isSelected ? HOVER_SCALE_FACTOR : 1)
          : isSelected
            ? HOVER_SCALE_FACTOR
            : 1);
      this.tweens.add({ targets: object, scale, duration: TWEEN_DURATION_FAST });
    };
    const onEnter = () => updateScale(true);
    const onLeave = () => updateScale(false);
    element.addEventListener('mouseenter', onEnter);
    element.addEventListener('mouseleave', onLeave);
    this.events.once('shutdown', () => {
      element.removeEventListener('mouseenter', onEnter);
      element.removeEventListener('mouseleave', onLeave);
    });
  }

  // -------------------------------------------------------------------------
  // Gamepad / keyboard navigation
  // -------------------------------------------------------------------------

  /** Initialises `selectedIndex` and builds the first `navigationItems` array. */
  _setupGamepadNavigation() {
    this.selectedIndex = 0;
    this._previousUp = false;
    this._previousDown = false;
    this._hasReadVerticalInput = false;
    this._rebuildNavigationItems();
    this.updateGamepadSelection();
  }

  /**
   * Rebuilds `this.navigationItems`.
   * Called once during setup and again whenever the dropdown opens or closes,
   * so the gamepad navigation always reflects the current UI state.
   */
  _rebuildNavigationItems() {
    const s = this._uiScale;
    this.navigationItems = [
      { button: this._closeButton, action: () => this._close(), scale: SCALE_CLOSE_BTN * s },
      {
        button: this._accessibilitySwitch,
        action: () => this._toggleAccessibility(),
        scale: this._switchBaseScale,
        applySelection: (selected) => {
          this._switchSelected = selected;
          this._updateSwitchScale();
        },
      },
      {
        button: this._activeModeButton,
        action: () => this._toggleDropdown(),
        scale: SCALE_MODE_BTN * s,
      },
    ];

    if (this._isDropdownOpen) {
      this.navigationItems.push({
        button: this._inactiveModeButton,
        action: () => this._chooseAlternateMode(),
        scale: SCALE_MODE_BTN * s,
      });
    }
  }
}
