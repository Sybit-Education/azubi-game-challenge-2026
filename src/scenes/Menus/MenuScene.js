import Phaser from 'phaser';

import { positionAccessibleControls } from '../../accessibility/positionControls.js';

import InputManager from '../../objects/InputManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
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
      'homepage-barrierefreiheit',
      'assets/images/homepage/default-homepage/barrierefreiheit-button.png',
    );
    this.load.image(
      'homepage-leaderboard-btn',
      'assets/images/gameover-scene-assets/leaderboard-button.png',
    );
    this.load.image(
      'leaderboard-homepage-btn',
      'assets/images/gameover-scene-assets/back-to-menu-button.png',
    );
  }

  async create() {
    await document.fonts.load('32px Tiny5');
    console.log('PHASER.VERSION: ' + Phaser.VERSION);

    this.inputManager = new InputManager(this);
    this.inputManager.create();

    const playBtn = document.getElementById('start-game');
    const settingsBtn = document.getElementById('settings-btn');
    const menu = document.getElementById('accessible-ui');
    menu.hidden = false;

    const startGame = () => {
      this.registry.set('gameMode', 'standard');
      this.scene.start('NameInputScene', { isMultiplayer: false });
    };

    const startMultiplayer = () => {
      this.registry.set('gameMode', 'multiplayer');
      this.scene.start('NameInputScene', { isMultiplayer: true });
    };
    this.startMultiplayer = startMultiplayer;

    const openSettings = () => {
      this.scene.launch('PopUpScene');
    };

    playBtn.addEventListener('click', startGame);
    playBtn.focus();
    settingsBtn.addEventListener('click', openSettings);

    this.events.once('shutdown', () => {
      playBtn.removeEventListener('click', startGame);
      settingsBtn.removeEventListener('click', openSettings);
      menu.hidden = true;
    });

    const footerButtonY = this.scale.height / 1.17;

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(-2);

    this.add
      .image(this.scale.width / 2, this.scale.height / 1.08, 'WeCreateCXChampions')
      .setOrigin(0.5)
      .setScale(0.3)
      .setDepth(-1);

    this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5)
      .setDepth(-1);

    const playButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 2.2, 'homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    const twoPlayerButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 2.2, 'homepage-2player')
      .setOrigin(0.5)
      .setScale(0.278)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    const settingsButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.8, 'homepage-settings')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    const creditsButton = this.add
      .image(this.scale.width / 1.14, footerButtonY, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    const howToPlayScale = 0.2;
    const howToPlayButton = this.add
      .image(this.scale.width / 8, footerButtonY, 'homepage-how-to-play')
      .setOrigin(0.5)
      .setScale(howToPlayScale)
      .setInteractive({ useHandCursor: true });

    this.add
      .image(this.scale.width, this.scale.height / 1.5, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

    const leaderboardButton = this.add
      .image(this.scale.width / 2, this.scale.height / 1.17, 'homepage-leaderboard-btn')
      .setScale(0.24)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    leaderboardButton.on('pointerdown', () => {
      this.scene.start('LeaderboardScene');
    });

    leaderboardButton.on('pointerover', () => {
      this.tweens.add({
        targets: leaderboardButton,
        scaleX: 0.26,
        scaleY: 0.26,
        duration: 100,
      });
    });

    leaderboardButton.on('pointerout', () => {
      this.tweens.add({
        targets: leaderboardButton,
        scaleX: 0.24,
        scaleY: 0.24,
        duration: 100,
      });
    });

    let isPlayHovered = false;
    let isTwoPlayerHovered = false;
    this.isMultiplayerSelected = false;
    let hideSubmenuEvent;
    const playOriginalY = playButton.y;
    const settingsOriginalY = settingsButton.y;
    const creditsOriginalY = creditsButton.y;
    const howToPlayOriginalY = howToPlayButton.y;

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
        if (isPlayHovered || isTwoPlayerHovered || this.isMultiplayerSelected) {
          return;
        }

        this.tweens.killTweensOf(twoPlayerButton);
        this.tweens.add({
          targets: twoPlayerButton,
          x: playButton.x,
          duration: 150,
          onComplete: () => {
            if (!isPlayHovered && !isTwoPlayerHovered) {
              twoPlayerButton.setVisible(false);
            }
          },
        });
      });
    };

    const revealTwoPlayerButton = () => {
      cancelScheduledHide();
      this.tweens.killTweensOf(twoPlayerButton);
      twoPlayerButton.setVisible(true);
      this.tweens.add({
        targets: twoPlayerButton,
        x: playButton.x + 325,
        y: playButton.y - 3,
        duration: 150,
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

    playButton.on('pointerover', () => {
      isPlayHovered = true;
      revealTwoPlayerButton();
      this.selectButton(playButton, playOriginalY);
    });

    playButton.on('pointerout', () => {
      isPlayHovered = false;
      this.deselectButton(playButton, playOriginalY);
      scheduleHide();
    });

    twoPlayerButton.on('pointerover', () => {
      isTwoPlayerHovered = true;
      twoPlayerButton.setDepth(-1);
      cancelScheduledHide();
      if (!isPlayHovered && isTwoPlayerHovered) {
        this.selectButton(playButton, playOriginalY);
      }
    });

    twoPlayerButton.on('pointerout', () => {
      isTwoPlayerHovered = false;
      isPlayHovered = false;
      twoPlayerButton.setDepth(0);
      scheduleHide();
      if (!isPlayHovered && !isTwoPlayerHovered) {
        this.deselectButton(playButton, playOriginalY);
      }
    });

    settingsButton.on('pointerover', () => {
      this.selectButton(settingsButton, settingsOriginalY);
    });

    settingsButton.on('pointerout', () => {
      this.deselectButton(settingsButton, settingsOriginalY);
    });

    creditsButton.on('pointerover', () => {
      this.selectButton(creditsButton, creditsOriginalY);
    });

    creditsButton.on('pointerout', () => {
      this.deselectButton(creditsButton, creditsOriginalY);
    });

    settingsButton.on('pointerout', () => {
      this.deselectButton(settingsButton, settingsOriginalY);
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

    this.selectButton = (button, originalY, scale = 0.3) => {
      this.tweens.add({
        targets: button,
        scaleX: scale + 0.02,
        scaleY: scale + 0.02,
        y: originalY - 5,
        duration: 50,
      });
    };

    this.deselectButton = (button, originalY, scale = 0.3) => {
      this.tweens.add({
        targets: button,
        scaleX: scale,
        scaleY: scale,
        y: originalY,
        duration: 50,
      });
    };

    positionAccessibleControls(this, [
      [playBtn, playButton],
      [settingsBtn, settingsButton],
    ]);

    playButton.on('pointerdown', startGame);

    twoPlayerButton.on('pointerdown', () => {
      startMultiplayer();
    });

    settingsButton.on('pointerdown', openSettings);

    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });

    this.menuButtons = [
      { button: playButton, y: playOriginalY, action: startGame },
      { button: settingsButton, y: settingsOriginalY, action: openSettings },
      { button: howToPlayButton, y: howToPlayOriginalY, scale: howToPlayScale },
      {
        button: creditsButton,
        y: creditsOriginalY,
        action: () => this.scene.start('CreditsScene'),
      },
    ];

    this.selectedIndex = 0;
    this.previousHorizontalInput = { left: false, right: false };
    this.hasReadHorizontalInput = false;

    this.selectButton(this.menuButtons[0].button, this.menuButtons[0].y);
  }

  update() {
    this.inputManager.update();
    const controls = this.inputManager.getControlsP1;
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
