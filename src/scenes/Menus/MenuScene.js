/* global Phaser */

import { positionAccessibleControls } from '../../accessibility/positionControls.js';

import InputManager from '../../objects/InputManager.js';

export default class MenuScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('MenuScene');
  }

  // Pre load images
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
      'homepage-anleitung',
      'assets/images/homepage/default-homepage/anleitung-button.png',
    );
    this.load.image(
      'homepage-barrierefreiheit',
      'assets/images/homepage/default-homepage/barrierefreiheit-button.png',
    );
  }

  // Create scene
  create() {
    console.log('PHASER.VERSION: ' + Phaser.VERSION);

    // Create InputManager instance and initialize it
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    const playBtn = document.getElementById('start-game');
    const settingsBtn = document.getElementById('settings-btn');
    const menu = document.getElementById('accessible-ui');
    menu.hidden = false;

    const startGame = () => {
      this.registry.set('gameMode', 'standard');
      this.scene.start('LoadingScene', { isMultiplayer: false });
    };

    const startMultiplayer = () => {
      this.registry.set('gameMode', 'multiplayer');
      this.scene.start('LoadingScene', { isMultiplayer: true });
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

    // Interface for our lovely Sybit Kart Game

    const footer_btn_y = this.scale.height / 1.17;

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

    const play_button = this.add
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

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.8, 'homepage-settings')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    const creditsButton = this.add
      .image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    const AnleitungsButton = this.add
      .image(this.scale.width / 8, footer_btn_y, 'homepage-anleitung')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    this.add
      .image(this.scale.width, this.scale.height / 1.5, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

    // Some variables to keep track of the button states
    let isPlayHovered = false;
    let isTwoPlayerHovered = false;
    this.isMultiplayerSelected = false;
    let hideSubmenuEvent;
    const playOriginalY = play_button.y;
    const settingsOriginalY = settings_button.y;
    const creditsOriginalY = creditsButton.y;
    const AnleitungsOriginalY = AnleitungsButton.y;

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
        if (isPlayHovered || isTwoPlayerHovered || this.isMultiplayerSelected) {
          return;
        }

        this.tweens.killTweensOf(twoPlayerButton);
        this.tweens.add({
          targets: twoPlayerButton,
          x: play_button.x,
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
        x: play_button.x + 325,
        y: play_button.y - 3,
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

    play_button.on('pointerover', () => {
      isPlayHovered = true;
      revealTwoPlayerButton();
      this.selectButton(play_button, playOriginalY);
    });

    play_button.on('pointerout', () => {
      isPlayHovered = false;
      this.deselectButton(play_button, playOriginalY);
      scheduleHide();
    });

    twoPlayerButton.on('pointerover', () => {
      isTwoPlayerHovered = true;
      twoPlayerButton.setDepth(-1);
      cancelScheduledHide();
      if (!isPlayHovered && isTwoPlayerHovered) {
        this.selectButton(play_button, playOriginalY);
      }
    });

    twoPlayerButton.on('pointerout', () => {
      isTwoPlayerHovered = false;
      isPlayHovered = false;
      twoPlayerButton.setDepth(0);
      scheduleHide();
      if (!isPlayHovered && !isTwoPlayerHovered) {
        this.deselectButton(play_button, playOriginalY);
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

    AnleitungsButton.on('pointerover', () => {
      this.selectButton(AnleitungsButton, AnleitungsOriginalY);
    });

    AnleitungsButton.on('pointerout', () => {
      this.deselectButton(AnleitungsButton, AnleitungsOriginalY);
    });

    // Helper functions for button animations
    this.selectButton = (button, originalY) => {
      this.tweens.add({
        targets: button,
        scaleX: 0.32,
        scaleY: 0.32,
        y: originalY - 5,
        duration: 50,
      });
    };

    this.deselectButton = (button, originalY) => {
      this.tweens.add({
        targets: button,
        scaleX: 0.3,
        scaleY: 0.3,
        y: originalY,
        duration: 50,
      });
    };

    // Click events
    positionAccessibleControls(this, [
      [playBtn, play_button],
      [settingsBtn, settings_button],
    ]);

    play_button.on('pointerdown', startGame);

    twoPlayerButton.on('pointerdown', () => {
      startMultiplayer();
    });

    settings_button.on('pointerdown', openSettings);

    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });

    // Menu button array and selected index
    this.menuButtons = [
      { button: play_button, y: playOriginalY, action: startGame },
      { button: settings_button, y: settingsOriginalY, action: openSettings },
      { button: AnleitungsButton, y: AnleitungsOriginalY },
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
      );

      this.selectedIndex--;

      if (this.selectedIndex < 0) {
        this.selectedIndex = this.menuButtons.length - 1;
      }

      this.selectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].y,
      );
    }
    if (controls.button3) {
      this.clearMultiplayerOption();
      this.deselectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].y,
      );

      this.selectedIndex++;

      if (this.selectedIndex >= this.menuButtons.length) {
        this.selectedIndex = 0;
      }

      this.selectButton(
        this.menuButtons[this.selectedIndex].button,
        this.menuButtons[this.selectedIndex].y,
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
