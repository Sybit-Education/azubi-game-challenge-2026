import Phaser from 'phaser';
import InputManager from '../../objects/InputManager.js';

import { preloadMenuSounds, playMenuClick, bindMenuFocusSounds } from '../../../audio/sounds.js';

import { positionAccessibleControls } from '../../accessibility/positionControls.js';
import { preserveNativeKeyboard } from '../../accessibility/nativeKeyboard.js';

export default class ChristmasScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('ChristmasScene');
  }

  // Pre load images
  preload() {
    preloadMenuSounds(this);
    this.load.image('christmas-homepage-2player', 'assets/images/homepage/2-multiplayer.png');
    //this.load.image('playButton', 'assets/images/button-template.png');
    this.load.image(
      'christmas-homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );
    this.load.image(
      'christmas-homepage-resonanz',
      'assets/images/homepage/default-homepage/resonanz.png',
    );
    this.load.image(
      'christmas-homepage-title',
      'assets/images/homepage/weihnachts-homepage/sybit-kart-weihnachtsthema.png',
    );
    this.load.image(
      'christmas-homepage-lights',
      'assets/images/homepage/weihnachts-homepage/die-lichterkette.png',
    );
    this.load.image(
      'christmas-homepage-play-btn',
      'assets/images/homepage/default-homepage/play-button.png',
    );
    this.load.image(
      'christmas-homepage-settings',
      'assets/images/homepage/default-homepage/settings-button.png',
    );
    this.load.image(
      'christmas-homepage-trees',
      'assets/images/homepage/weihnachts-homepage/bigger-trees.png',
    );
    this.load.image('christmas-homepage-car', 'assets/images/homepage/default-homepage/car.png');

    this.load.image('christmas-homepage-line', 'assets/images/homepage/default-homepage/line.png');
    this.load.image(
      'christmas-homepage-credits',
      'assets/images/homepage/default-homepage/credits-button.png',
    );
    this.load.image(
      'homepage-how-to-play',
      'assets/images/homepage/default-homepage/how-to-play-button.png',
    );
    this.load.image(
      'homepage-credits',
      'assets/images/homepage/default-homepage/credits-button.png',
    );
    this.load.image(
      'homepage-leaderboard-btn',
      'assets/images/gameover-scene-assets/leaderboard-button.png',
    );
  }

  // Create scene
  create(data) {
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    //html Menus erneut für diese Scene herholen.
    const menu = document.getElementById('accessible-ui');
    const playBtn = document.getElementById('start-game');
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const creditBtn = document.getElementById('credit-btn');
    const leaderboardBtn = document.getElementById('leaderboard-btn');

    const startGame = () => {
      playMenuClick(this);
      this.registry.set('gameMode', 'christmas');
      this.scene.start('NameInputScene', { isMultiplayer: false });
    };

    const startMultiplayer = () => {
      playMenuClick(this);
      this.registry.set('isMultiplayer', true);
      this.registry.set('gameMode', 'christmas');
      this.scene.start('NameInputScene', { isMultiplayer: true });
    };
    this.startMultiplayer = startMultiplayer;

    const openSettings = () => {
      playMenuClick(this);
      this.scene.launch('PopUpScene');
      this.scene.bringToTop('PopUpScene');
    };

    playBtn.addEventListener('click', startGame);
    const openLeaderboard = () => {
      playMenuClick(this);
      this.registry.set('gameMode', 'christmas');
      this.scene.start('LeaderboardScene');
    };
    leaderboardBtn.addEventListener('click', openLeaderboard);
    [playBtn, multiplayerBtn, settingsBtn, creditBtn, leaderboardBtn].forEach((button) =>
      preserveNativeKeyboard(this, button),
    );

    const openCredits = () => {
      playMenuClick(this);
      this.registry.set('gameMode', 'christmas');
      this.scene.start('CreditsScene');
    };
    creditBtn.addEventListener('click', openCredits);
    multiplayerBtn.addEventListener('click', startMultiplayer);
    settingsBtn.addEventListener('click', openSettings);

    menu.hidden = false;
    const focusTarget = document.getElementById(data?.focusTarget ?? 'start-game');
    focusTarget.focus();

    const footer_btn_y = this.scale.height / 1.17;
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);

    const background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'christmas-homepage-hintergrund')
      .setDisplaySize(this.scale.width * 1.01, this.scale.height * 1.01)
      .setDepth(-100);

    this.add
      .image(this.scale.width / 2, this.scale.height / 1.12, 'christmas-homepage-line')
      .setDisplaySize(this.scale.width - 175, 1)
      .setDepth(-2);

    this.add
      .image(this.scale.width / 2, this.scale.height / 3, 'christmas-homepage-title')
      .setOrigin(0.5)
      .setScale(0.5 * this.scaleFactor);

    const lights = this.add
      .image(this.scale.width / 2, this.scale.height / 6, 'christmas-homepage-lights')
      .setOrigin(0.5)
      .setScale(0.7 * this.scaleFactor);

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.55, 'christmas-homepage-settings')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setInteractive({ useHandCursor: true });

    const play_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'christmas-homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setInteractive({ useHandCursor: true });

    const twoPlayerButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'christmas-homepage-2player')
      .setOrigin(0.5)
      .setScale(0.275 * this.scaleFactor)
      .setDepth(-1)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    const creditsButton = this.add
      .image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setInteractive({ useHandCursor: true });
    creditsButton.setDepth(3);

    this.add
      .image(this.scale.width / 1.3, footer_btn_y * 1.1, 'christmas-homepage-resonanz')
      .setOrigin(0.5)
      .setScale(0.4 * this.scaleFactor);

    const trees = this.add
      .image(this.scale.width / 3, this.scale.height, 'christmas-homepage-trees')
      .setOrigin(0.5, 1)
      .setScale(0.3 * this.scaleFactor);

    const howToPlayScale = 0.2;
    const howToPlayButton = this.add
      .image(this.scale.width / 8, footer_btn_y, 'homepage-how-to-play')
      .setOrigin(0.5)
      .setScale(howToPlayScale * this.scaleFactor)
      .setInteractive({ useHandCursor: true });

    const homepageCar = this.add
      .image(this.scale.width, this.scale.height / 1.45, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor);

    // Leaderboard button
    const leaderboardButton = this.add
      .image(this.scale.width / 2, this.scale.height / 1.17, 'homepage-leaderboard-btn')
      .setScale(0.24 * this.scaleFactor)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const hitAreaPadding = 12;
    const hitboxVisual = this.add
      .rectangle(
        twoPlayerButton.x,
        twoPlayerButton.y,
        twoPlayerButton.displayWidth + hitAreaPadding * 2,
        twoPlayerButton.displayHeight + hitAreaPadding * 2,
        0xff0000,
        0,
      )
      .setOrigin(0.5)
      .setDepth(-2)
      .setInteractive();

    // Some variables to keep track of the button states
    let isPlayHovered = false;
    let isTwoPlayerHovered = false;
    this.isMultiplayerSelected = false;
    let hideSubmenuEvent;
    const cancelScheduledHide = () => {
      if (hideSubmenuEvent) {
        this.time.removeEvent(hideSubmenuEvent);
        hideSubmenuEvent = undefined;
      }
    };

    const scheduleHide = () => {
      cancelScheduledHide();
      hideSubmenuEvent = this.time.delayedCall(180, () => {
        hideSubmenuEvent = undefined;
        if (
          isPlayHovered ||
          isTwoPlayerHovered ||
          this.isMultiplayerSelected ||
          document.activeElement === multiplayerBtn
        ) {
          return;
        }

        this.tweens.killTweensOf(twoPlayerButton);
        this.tweens.add({
          targets: twoPlayerButton,
          x: play_button.x,
          y: play_button.y,
          alpha: 0.7,
          duration: 180,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            if (
              !isPlayHovered &&
              !isTwoPlayerHovered &&
              document.activeElement !== multiplayerBtn
            ) {
              twoPlayerButton.setVisible(false);
              twoPlayerButton.setAlpha(1);
            }
          },
        });
      });
    };

    const revealTwoPlayerButton = () => {
      cancelScheduledHide();
      this.tweens.killTweensOf(twoPlayerButton);
      this.tweens.add({
        targets: twoPlayerButton,
        x: play_button.x + 325 * this.scaleFactor,
        scaleX: (0.278 + 0.02) * this.scaleFactor,
        scaleY: (0.278 + 0.02) * this.scaleFactor,
        duration: 220,
        ease: 'Sine.easeOut',
      });
      this.time.delayedCall(100, () => {
        twoPlayerButton.setVisible(true);
      });
    };

    // Register once when the scene starts so keyboard focus can reveal the submenu.
    multiplayerBtn.addEventListener('focus', revealTwoPlayerButton);
    multiplayerBtn.addEventListener('blur', scheduleHide);
    this.events.once('shutdown', () => {
      multiplayerBtn.removeEventListener('focus', revealTwoPlayerButton);
      multiplayerBtn.removeEventListener('blur', scheduleHide);
    });

    this.selectMultiplayerOption = () => {
      this.isMultiplayerSelected = true;
      revealTwoPlayerButton();
      twoPlayerButton.setDepth(1);
      this.selectButton(twoPlayerButton, 0.278);
    };

    this.clearMultiplayerOption = () => {
      this.isMultiplayerSelected = false;
      twoPlayerButton.setDepth(0);
      this.deselectButton(twoPlayerButton, 0.278);
      scheduleHide();
    };

    twoPlayerButton.on('pointerover', () => {
      isTwoPlayerHovered = true;
      twoPlayerButton.setDepth(-1);
      cancelScheduledHide();
      if (!isPlayHovered && isTwoPlayerHovered) {
        this.selectButton(play_button);
      }
    });

    twoPlayerButton.on('pointerout', () => {
      isTwoPlayerHovered = false;
      isPlayHovered = false;
      twoPlayerButton.setDepth(0);
      if (twoPlayerButton.visible) {
        this.deselectButton(twoPlayerButton, 0.278);
      }
      scheduleHide();
      if (!isPlayHovered && !isTwoPlayerHovered) {
        this.deselectButton(play_button);
      }
    });

    this.selectButton = (button, scale = 0.3) => {
      this.tweens.add({
        targets: button,
        scaleX: (scale + 0.02) * this.scaleFactor,
        scaleY: (scale + 0.02) * this.scaleFactor,
        duration: 50,
      });
    };

    this.deselectButton = (button, scale = 0.3) => {
      this.tweens.add({
        targets: button,
        scaleX: scale * this.scaleFactor,
        scaleY: scale * this.scaleFactor,
        duration: 50,
      });
    };

    play_button.on('pointerover', () => {
      isPlayHovered = true;
      revealTwoPlayerButton();
      this.selectButton(play_button);
    });

    play_button.on('pointerout', () => {
      isPlayHovered = false;

      this.deselectButton(play_button);

      if (twoPlayerButton.visible) {
        this.deselectButton(twoPlayerButton, 0.278);
      }
      scheduleHide();
    });

    settings_button.on('pointerover', () => {
      this.selectButton(settings_button);
    });

    settings_button.on('pointerout', () => {
      this.deselectButton(settings_button);
    });

    creditsButton.on('pointerover', () => {
      this.selectButton(creditsButton);
    });

    creditsButton.on('pointerout', () => {
      this.deselectButton(creditsButton);
    });

    howToPlayButton.on('pointerover', () => {
      this.selectButton(howToPlayButton, howToPlayScale);
    });

    howToPlayButton.on('pointerout', () => {
      this.deselectButton(howToPlayButton, howToPlayScale);
    });

    // Leaderboard click listener
    leaderboardButton.on('pointerdown', openLeaderboard);

    leaderboardButton.on('pointerover', () => {
      this.tweens.add({
        targets: leaderboardButton,
        scaleX: 0.26 * this.scaleFactor,
        scaleY: 0.26 * this.scaleFactor,
        duration: 100,
      });
    });

    leaderboardButton.on('pointerout', () => {
      this.tweens.add({
        targets: leaderboardButton,
        scaleX: 0.24 * this.scaleFactor,
        scaleY: 0.24 * this.scaleFactor,
        duration: 100,
      });
    });

    //Background parralax effect
    this.input.on('pointermove', (pointer) => {
      background.setPosition(
        this.scale.width / 2 + (pointer.x - this.scale.width / 2) * 0.01,
        this.scale.height / 2 + (pointer.y - this.scale.height / 2) * 0.01,
      );
    });

    //homepage car parallax effect
    this.input.on('pointermove', (pointer) => {
      homepageCar.setPosition(
        this.scale.width + (pointer.x - this.scale.width / 2) * 0.015,
        this.scale.height / 1.45 + (pointer.y - this.scale.height / 2) * 0.015,
      );
    });

    //christmas lights parallax effect
    this.input.on('pointermove', (pointer) => {
      lights.setPosition(
        this.scale.width / 2 + (pointer.x - this.scale.width / 2) * 0.03,
        this.scale.height / 6 + (pointer.y - this.scale.height / 2) * 0.03,
      );
    });

    //christmas trees parallax effect
    this.input.on('pointermove', (pointer) => {
      trees.setPosition(
        this.scale.width / 3 + (pointer.x - this.scale.width / 2) * 0.0225,
        this.scale.height + (pointer.y - this.scale.height / 2) * 0.0225,
      );
    });

    const startSinglePlayer = startGame;
    twoPlayerButton.on('pointerdown', () => {
      startMultiplayer();
    });
    positionAccessibleControls(this, [
      [playBtn, play_button],
      [multiplayerBtn, twoPlayerButton],
      [settingsBtn, settings_button],
      [creditBtn, creditsButton],
      [leaderboardBtn, leaderboardButton],
    ]);

    play_button.on('pointerdown', startGame);
    settings_button.on('pointerdown', openSettings);

    hitboxVisual.on('pointerdown', startMultiplayer);

    //logic to start multiplayer
    creditsButton.on('pointerdown', openCredits);

    this.events.once('shutdown', () => {
      playBtn.removeEventListener('click', startGame);
      multiplayerBtn.removeEventListener('click', startMultiplayer);
      settingsBtn.removeEventListener('click', openSettings);
      creditBtn.removeEventListener('click', openCredits);
      leaderboardBtn.removeEventListener('click', openLeaderboard);
      menu.hidden = true;
    });
    bindMenuFocusSounds(this, [
      'start-game',
      'multiplayer-btn',
      'settings-btn',
      'credit-btn',
      'leaderboard-btn',
    ]);

    this.menuButtons = [
      { button: play_button, action: startSinglePlayer },
      {
        button: settings_button,
        action: () => {
          this.scene.launch('PopUpScene');
          this.scene.bringToTop('PopUpScene');
        },
      },
      { button: howToPlayButton, scale: howToPlayScale },
      {
        button: leaderboardButton,
        scale: 0.24,
        action: openLeaderboard,
      },
      {
        button: creditsButton,
        action: () => this.scene.start('CreditsScene'),
      },
    ];

    this.selectedIndex = 0;
    this.previousHorizontalInput = { left: false, right: false };
    this.previousVerticalInput = { up: false, down: false };
    this.hasReadHorizontalInput = false;
    this.hasReadVerticalInput = false;
    this.selectButton(this.menuButtons[0].button);

    this.tweens.add({
      targets: lights,
      alpha: 0.2,
      duration: 2000,
      yoyo: 0.5,
      repeat: -1,
    });
  }

  update() {
    this.InputManager.update();
    const controls = this.InputManager.getControlsP1;
    const gamepad = this.input.gamepad;
    const gamepadP1 = gamepad?.enabled ? gamepad.getPad(0) : null;
    const padP1 = gamepadP1?.pad?.connected ? gamepadP1 : null;
    const axisX = padP1?.axes?.[0]?.getValue() ?? 0;
    const axisY = padP1?.axes?.[1]?.getValue() ?? 0;
    const menuLeft =
      axisX < -0.2 ||
      (padP1?.buttons?.[14]?.pressed ?? false);
    const menuRight =
      axisX > 0.2 ||
      (padP1?.buttons?.[15]?.pressed ?? false);
    const menuUp =
      axisY < -0.2 ||
      (padP1?.buttons?.[12]?.pressed ?? false);
    const menuDown =
      axisY > 0.2 ||
      (padP1?.buttons?.[13]?.pressed ?? false);
    const rightPressed =
      menuRight && this.hasReadHorizontalInput && !this.previousHorizontalInput.right;
    const leftPressed = menuLeft && this.hasReadHorizontalInput && !this.previousHorizontalInput.left;
    const downPressed =
      menuDown && this.hasReadVerticalInput && !this.previousVerticalInput.down;
    const upPressed = menuUp && this.hasReadVerticalInput && !this.previousVerticalInput.up;
    this.previousHorizontalInput.left = menuLeft;
    this.previousHorizontalInput.right = menuRight;
    this.previousVerticalInput.up = menuUp;
    this.previousVerticalInput.down = menuDown;
    this.hasReadHorizontalInput = true;
    this.hasReadVerticalInput = true;

    if (rightPressed && this.selectedIndex === 0) {
      this.selectMultiplayerOption();
    } else if (leftPressed && this.isMultiplayerSelected) {
      this.clearMultiplayerOption();
    }

    if (upPressed) {
      this.clearMultiplayerOption();
      this.deselectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].scale,
      );

      this.selectedIndex--;
      if (this.selectedIndex < 0) {
        this.selectedIndex = this.menuButtons.length - 1;
      }

      this.selectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].scale,
      );
    }

    if (downPressed) {
      this.clearMultiplayerOption();
      this.deselectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].scale,
      );

      this.selectedIndex++;
      if (this.selectedIndex >= this.menuButtons.length) {
        this.selectedIndex = 0;
      }

      this.selectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].scale,
      );
    }

    if (controls.button3 && !this.InputManager.keys.select.isDown) {
      if (this.selectedIndex === 0 && this.isMultiplayerSelected) {
        this.startMultiplayer();
      } else {
        this.menuButtons[this.selectedIndex].action?.();
      }
    } else if (controls.button4 && this.isMultiplayerSelected) {
      this.clearMultiplayerOption();
    }
  }
}
