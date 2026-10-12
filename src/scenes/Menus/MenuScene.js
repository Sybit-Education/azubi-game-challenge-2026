import Phaser from 'phaser';

import { preloadMenuSounds, playMenuClick, bindMenuFocusSounds } from '../../../audio/menuSounds.js';

import { positionAccessibleControls } from '../../accessibility/positionControls.js';

import InputManager from '../../objects/InputManager.js';

export default class MenuScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('MenuScene');
  }

  // Pre load images
  preload() {
    preloadMenuSounds(this);
    this.load.image('homepage-2player', 'assets/images/homepage/2-multiplayer.png');
    this.load.image(
      'homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );
    this.load.image(
      'WeCreateCXChampions',
      'assets/images/homepage/default-homepage/we-create-cx-champions.png',
    );
    this.load.image('homepage-title', 'assets/images/homepage/default-homepage/sybit-kart.png');
    this.load.image('homepage-play-btn', 'assets/images/homepage/default-homepage/play-button.png');
    this.load.image(
      'homepage-settings',
      'assets/images/homepage/default-homepage/settings-button.png',
    );
    this.load.image('homepage-car', 'assets/images/homepage/default-homepage/car.png');
    this.load.image(
      'homepage-credits',
      'assets/images/homepage/default-homepage/credits-button.png',
    );
    this.load.image(
      'homepage-how-to-play',
      'assets/images/homepage/default-homepage/how-to-play-button.png',
    );
    this.load.image(
      'homepage-leaderboard-btn',
      'assets/images/gameover-scene-assets/leaderboard-button.png',
    );
    this.load.image(
      'leaderboard-homepage-btn',
      'assets/images/gameover-scene-assets/back-to-menu-button.png',
    );
    this.load.image('homepage-line', 'assets/images/homepage/default-homepage/line.png');
  }

  // Create scene
  async create(data) {
    await document.fonts.load('32px Tiny5');
    console.log('PHASER.VERSION: ' + Phaser.VERSION);

    // Create InputManager instance and initialize it
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    const playBtn = document.getElementById('start-game');
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const creditBtn = document.getElementById('credit-btn');
    const menu = document.getElementById('accessible-ui');
    menu.hidden = false;

    const startGame = () => {
      playMenuClick(this);
      this.registry.set('gameMode', 'standard');
      this.scene.start('NameInputScene', { isMultiplayer: false });
    };

    const startMultiplayer = () => {
      playMenuClick(this);
      this.registry.set('isMultiplayer', true);
      this.registry.set('gameMode', 'standard');
      console.log('StartScene gameMode:', this.registry.get('gameMode'));
      this.scene.start('NameInputScene', { isMultiplayer: true });
    };

    this.startMultiplayer = startMultiplayer;
    const openSettings = () => {
      playMenuClick(this);
      this.scene.launch('PopUpScene');
    };

    const openCredits = () => {
      playMenuClick(this);
      this.scene.start('CreditsScene');
    };

    playBtn.addEventListener('click', startGame);
    const focusTarget = document.getElementById(data?.focusTarget ?? 'start-game');
    focusTarget.focus();

    multiplayerBtn.addEventListener('click', startMultiplayer);

    settingsBtn.addEventListener('click', openSettings);
    creditBtn.addEventListener('click', openCredits);

    this.events.once('shutdown', () => {
      playBtn.removeEventListener('click', startGame);
      multiplayerBtn.removeEventListener('click', startMultiplayer);
      settingsBtn.removeEventListener('click', openSettings);
      creditBtn.removeEventListener('click', openCredits);
      menu.hidden = true;
    });

    // Interface for our lovely Sybit Kart Game

    const footer_btn_y = this.scale.height / 1.17;
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);

    const background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width * 1.01, this.scale.height * 1.01)
      .setDepth(-2);

    this.add
      .image(this.scale.width / 2, this.scale.height / 1.12, 'homepage-line')
      .setDisplaySize(this.scale.width - 175, 1)
      .setDepth(-2);

    this.add
      .image(this.scale.width / 2, this.scale.height / 1.08, 'WeCreateCXChampions')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setDepth(-1);

    this.title = this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5 * this.scaleFactor)
      .setDepth(-1);

    this.play_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setInteractive({ useHandCursor: true });

    const twoPlayerButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'homepage-2player')
      .setOrigin(0.5)
      .setScale(0.275 * this.scaleFactor)
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .setDepth(-1);

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.55, 'homepage-settings')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setInteractive({ useHandCursor: true });

    const creditsButton = this.add
      .image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setInteractive({ useHandCursor: true });

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

    // Leaderboard click listener
    leaderboardButton.on('pointerdown', () => {
      this.scene.start('LeaderboardScene');
    });

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

    //Background parallax effect
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

    // Some variables to keep track of the button states
    let isPlayHovered = false;
    let isTwoPlayerHovered = false;
    this.isMultiplayerSelected = false;
    let hideSubmenuEvent;
    const playOriginalY = this.play_button.y;
    const settingsOriginalY = settings_button.y;
    const creditsOriginalY = creditsButton.y;
    const howToPlayOriginalY = howToPlayButton.y;

    // Functions

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
        if (isPlayHovered || isTwoPlayerHovered || this.isMultiplayerSelected || document.activeElement === multiplayerBtn) {
          return;
        }

        this.tweens.killTweensOf(twoPlayerButton);

        this.tweens.add({
          targets: twoPlayerButton,
          x: this.play_button.x,
          y: this.play_button.y,
          scaleX: 0.275 * this.scaleFactor,
          scaleY: 0.275 * this.scaleFactor,
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
        x: this.play_button.x + 325 * this.scaleFactor,
        y: playOriginalY - 10 * this.scaleFactor,
        scaleX: (0.278 + 0.02) * this.scaleFactor,
        scaleY: (0.278 + 0.02) * this.scaleFactor,
        duration: 220,
        ease: 'Sine.easeOut',
      });
      this.time.delayedCall(100, () => {
        twoPlayerButton.setVisible(true);
      });
    };

    this.selectMultiplayerOption = () => {
      this.isMultiplayerSelected = true;
      revealTwoPlayerButton();
      twoPlayerButton.setDepth(1);
      this.selectButton(twoPlayerButton, playOriginalY - 3);
    };

    this.clearMultiplayerOption = () => {
      this.isMultiplayerSelected = false;
      twoPlayerButton.setDepth(0);
      this.deselectButton(twoPlayerButton, playOriginalY - 3);
      scheduleHide();
    };
    multiplayerBtn.addEventListener('focus', revealTwoPlayerButton);
    multiplayerBtn.addEventListener('blur', scheduleHide);
    this.events.once('shutdown', () => {
      multiplayerBtn.removeEventListener('focus', revealTwoPlayerButton);
      multiplayerBtn.removeEventListener('blur', scheduleHide);
    });

    this.play_button.on('pointerover', () => {
      isPlayHovered = true;
      revealTwoPlayerButton();
      this.selectButton(this.play_button, playOriginalY);
    });

    this.play_button.on('pointerout', () => {
      isPlayHovered = false;
      this.deselectButton(this.play_button, playOriginalY);

      if (twoPlayerButton.visible) {
        this.deselectButton(twoPlayerButton, playOriginalY, 0.278);
      }
      scheduleHide();
    });

    twoPlayerButton.on('pointerover', () => {
      isTwoPlayerHovered = true;
      twoPlayerButton.setDepth(-1);
      cancelScheduledHide();
      if (!isPlayHovered && isTwoPlayerHovered) {
        this.selectButton(this.play_button, playOriginalY);

        this.tweens.add({
          targets: twoPlayerButton,
          y: playOriginalY - 10 * this.scaleFactor,
          duration: 50,
        });
      }
    });

    twoPlayerButton.on('pointerout', () => {
      isTwoPlayerHovered = false;
      isPlayHovered = false;
      twoPlayerButton.setDepth(0);
      if (twoPlayerButton.visible) {
        this.deselectButton(twoPlayerButton, playOriginalY, 0.278);
      }
      scheduleHide();
      if (!isPlayHovered && !isTwoPlayerHovered) {
        this.deselectButton(this.play_button, playOriginalY);
      }
    });

    settings_button.on('pointerover', () => {
      this.selectButton(settings_button, settingsOriginalY);
    });

    settings_button.on('pointerout', () => {
      this.deselectButton(settings_button, settingsOriginalY);
    });

    creditsButton.on('pointerover', () => {
      this.selectButton(creditsButton, creditsOriginalY);
    });

    creditsButton.on('pointerout', () => {
      this.deselectButton(creditsButton, creditsOriginalY);
    });

    settings_button.on('pointerout', () => {
      this.deselectButton(settings_button, settingsOriginalY);
    });

    creditsButton.on('pointerout', () => {
      this.deselectButton(creditsButton, creditsOriginalY);
    });

    howToPlayButton.on('pointerover', () => {
      this.selectButton(howToPlayButton, howToPlayOriginalY, howToPlayScale);
    });

    howToPlayButton.on('pointerout', () => {
      this.deselectButton(howToPlayButton, howToPlayOriginalY, howToPlayScale);
    });

    // Helper functions for button animations
    this.selectButton = (button, originalY, scale = 0.3) => {
      this.tweens.add({
        targets: button,
        scaleX: (scale + 0.02) * this.scaleFactor,
        scaleY: (scale + 0.02) * this.scaleFactor,
        y: originalY - 10 * this.scaleFactor,
        duration: 50,
      });
    };

    this.deselectButton = (button, originalY, scale = 0.3) => {
      this.tweens.add({
        targets: button,
        scaleX: scale * this.scaleFactor,
        scaleY: scale * this.scaleFactor,
        y: originalY,
        duration: 50,
      });
    };

    // Click events
    positionAccessibleControls(this, [
      [playBtn, this.play_button],
      [multiplayerBtn, twoPlayerButton],
      [settingsBtn, settings_button],
      [creditBtn, creditsButton],
    ]);

    this.play_button.on('pointerdown', startGame);

    twoPlayerButton.on('pointerdown', () => {
      startMultiplayer();
    });

    settings_button.on('pointerdown', openSettings);

    creditsButton.on('pointerdown', openCredits);
    bindMenuFocusSounds(this, ['start-game', 'multiplayer-btn', 'settings-btn', 'credit-btn']);

    // Menu button array and selected index
    this.menuButtons = [
      { button: this.play_button, y: playOriginalY, action: startGame },
      { button: settings_button, y: settingsOriginalY, action: openSettings },
      { button: howToPlayButton, y: howToPlayOriginalY, scale: howToPlayScale },
      {
        button: leaderboardButton,
        y: footer_btn_y,
        scale: 0.24,
        action: () => this.scene.start('LeaderboardScene'),
      },
      {
        button: creditsButton,
        y: creditsOriginalY,
        action: openCredits,
      },
    ];

    this.selectedIndex = 0;
    this.previousHorizontalInput = { left: false, right: false };
    this.hasReadHorizontalInput = false;

    this.selectButton(this.menuButtons[0].button, this.menuButtons[0].y);
  }

  update() {
    this.InputManager.update();
    const controls = this.InputManager.getControlsP1;
    const rightPressed =
      controls.right && this.hasReadHorizontalInput && !this.previousHorizontalInput.right;
    const leftPressed =
      controls.left && this.hasReadHorizontalInput && !this.previousHorizontalInput.left;
    this.previousHorizontalInput.left = controls.left;
    this.previousHorizontalInput.right = controls.right;
    this.hasReadHorizontalInput = true;

    if (rightPressed && this.selectedIndex === 0) {
      this.selectMultiplayerOption();
    } else if (leftPressed && this.isMultiplayerSelected) {
      this.clearMultiplayerOption();
    }

    if (controls.button1) {
      this.clearMultiplayerOption();
      this.deselectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].y,
        this.menuButtons[this.selectedIndex].scale,
      );

      this.selectedIndex--;

      if (this.selectedIndex < 0) {
        this.selectedIndex = this.menuButtons.length - 1;
      }

      this.selectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].y,
        this.menuButtons[this.selectedIndex].scale,
      );
    }
    if (controls.button3) {
      this.clearMultiplayerOption();
      this.deselectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].y,
        this.menuButtons[this.selectedIndex].scale,
      );

      this.selectedIndex++;

      if (this.selectedIndex >= this.menuButtons.length) {
        this.selectedIndex = 0;
      }

      this.selectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].y,
        this.menuButtons[this.selectedIndex].scale,
      );
    }
    if (controls.button2) {
      if (this.selectedIndex === 0 && this.isMultiplayerSelected) {
        this.startMultiplayer();
      } else {
        this.menuButtons[this.selectedIndex].action?.();
      }
    }
  }
}
