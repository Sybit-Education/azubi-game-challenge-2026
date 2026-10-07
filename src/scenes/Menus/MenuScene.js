/* global Phaser */

import InputManager from '../../objects/InputManager.js';

export default class MenuScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('MenuScene');
  }

  // Pre load images
  preload() {
    this.load.image('homepage-2player', 'sprites/Homepage/2Multiplayer.png');
    this.load.image('homepage-hintergrund', 'sprites/Homepage/Default Homepage/background.png');
    this.load.image('WeCreateCXChampions','sprites/Homepage/Default Homepage/WeCreateCXChampions.png');
    this.load.image('homepage-title', 'sprites/Homepage/Default Homepage/SYBIT KART.png');
    this.load.image('homepage-play-btn', 'sprites/Homepage/Default Homepage/playButton.png');
    this.load.image('homepage-settings', 'sprites/Homepage/Default Homepage/settingsButton.png');
    this.load.image('homepage-car', 'sprites/Homepage/Default Homepage/car.png');
    this.load.image('homepage-credits', 'sprites/Homepage/Default Homepage/creditsButton.png');
    this.load.image('homepage-anleitung', 'sprites/Homepage/Default Homepage/anleitungButton.png');
    this.load.image('homepage-barrierefreiheit','sprites/Homepage/Default Homepage/barrierefreiheitButton.png');
  }

  // Create scene
  create() {

    console.log("PHASER.VERSION: " + Phaser.VERSION);

    // Create InputManager instance and initialize it
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    const footer_btn_y = this.scale.height / 1.17;

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    this.add
      .image(this.scale.width / 2, this.scale.height / 1.08, 'WeCreateCXChampions')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5);

    const play_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 2.2, 'homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.30)
      .setInteractive({ useHandCursor: true });

    const playButtonOriginX = play_button.x;
    const twoPlayerButton = this.add
      .image(playButtonOriginX, play_button.y, 'homepage-2player')
      .setOrigin(0.5)
      .setScale(0.278)
      .setVisible(false)
      .disableInteractive();

    const hitAreaPadding = 12;
    const twoPlayerHitbox = this.add
      .rectangle(
        playButtonOriginX,
        play_button.y,
        twoPlayerButton.displayWidth + hitAreaPadding * 2,
        twoPlayerButton.displayHeight + hitAreaPadding * 2,
        0x000000,
        0,
      )
      .setOrigin(0.5)
      .setVisible(false)
      .disableInteractive();

    const revealTwoPlayerButton = () => {
      if (!twoPlayerButton.visible) {
        twoPlayerButton.setVisible(true);
        twoPlayerButton.setInteractive({ useHandCursor: true });
        twoPlayerHitbox.setVisible(true);
        twoPlayerHitbox.setInteractive();
      }

      this.tweens.add({
        targets: [twoPlayerButton, twoPlayerHitbox],
        x: playButtonOriginX + 350,
        duration: 150,
      });
    };

    const hideTwoPlayerButton = () => {
      this.tweens.add({
        targets: [twoPlayerButton, twoPlayerHitbox],
        x: playButtonOriginX,
        duration: 150,
        onComplete: () => {
          twoPlayerButton.setVisible(false);
          twoPlayerButton.disableInteractive();
          twoPlayerHitbox.setVisible(false);
          twoPlayerHitbox.disableInteractive();
        },
      });
    };

    let isTwoPlayerHovered = false;

    play_button.on('pointerover', () => {

      revealTwoPlayerButton();
    });

    play_button.on('pointerout', () => {
      if (!isTwoPlayerHovered) {
       this.tweens.add({
        targets: play_button,
        scaleX: 0.30,
        scaleY: 0.30,
        y: playOriginalY,
        duration: 100,
        });
        hideTwoPlayerButton();
      }
    });

    twoPlayerButton.on('pointerover', () => {
      isTwoPlayerHovered = true;
    });

    twoPlayerButton.on('pointerout', () => {
      isTwoPlayerHovered = false;
      hideTwoPlayerButton();
    });

    twoPlayerHitbox.on('pointerover', () => {
      isTwoPlayerHovered = true;
    });

    twoPlayerHitbox.on('pointerout', () => {
      isTwoPlayerHovered = false;
      hideTwoPlayerButton();
    });

    twoPlayerButton.on('pointerdown', () => {
      this.registry.set('gameMode', 'multiplayer');
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });

    twoPlayerHitbox.on('pointerdown', () => {
      this.registry.set('gameMode', 'multiplayer');
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.8, 'homepage-settings')
      .setOrigin(0.5)
      .setScale(0.30)
      .setInteractive({ useHandCursor: true });

    const creditsButton = this.add
      .image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.30)
      .setInteractive({ useHandCursor: true });

    const AnleitungsButton = this.add
      .image(this.scale.width / 8, footer_btn_y, 'homepage-anleitung')
      .setOrigin(0.5)
      .setScale(0.30)
      .setInteractive({ useHandCursor: true });

    this.add
      .image(this.scale.width, this.scale.height / 1.5, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

    const playOriginalY = play_button.y;
    const settingsOriginalY = settings_button.y;
    const creditsOriginalY = creditsButton.y;
    const AnleitungsOriginalY = AnleitungsButton.y;

    settings_button.on('pointerover', () => {
      this.tweens.add({
        targets: settings_button,
        scaleX: 0.32,
        scaleY: 0.32,
        y: settingsOriginalY - 5,
        duration: 100,
      });
    });

    creditsButton.on('pointerover', () => {
      this.tweens.add({
        targets: creditsButton,
        scaleX: 0.32,
        scaleY: 0.32,
        y: creditsOriginalY - 5,
        duration: 100,
      });
    });

    settings_button.on('pointerout', () => {
      this.tweens.add({
        targets: settings_button,
        scaleX: 0.30,
        scaleY: 0.30,
        y: settingsOriginalY,
        duration: 100,
      });
    });

    creditsButton.on('pointerout', () => {
      this.tweens.add({
        targets: creditsButton,
        scaleX: 0.30,
        scaleY: 0.30,
        y: creditsOriginalY,
        duration: 100,
      });
    });

    AnleitungsButton.on('pointerover', () => {
      this.tweens.add({
        targets: AnleitungsButton,
        scaleX: 0.32,
        scaleY: 0.32,
        y: AnleitungsOriginalY - 5,
        duration: 100,
      });
    });

    AnleitungsButton.on('pointerout', () => {
      this.tweens.add({
        targets: AnleitungsButton,
        scaleX: 0.30,
        scaleY: 0.30,
        duration: 100,
        y: AnleitungsOriginalY,
      });
    });

    play_button.on('pointerdown', () => {
      this.registry.set('gameMode', 'standard');
      this.scene.start('LoadingScene', { isMultiplayer: false });
    });

    settings_button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
    });

    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });
  }
}
