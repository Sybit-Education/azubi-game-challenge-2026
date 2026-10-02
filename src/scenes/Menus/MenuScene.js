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

      const twoPlayerButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 2.2, 'homepage-2player')
      .setOrigin(0.5)
      .setScale(0.278)
      .setDepth(-1)
      .setInteractive({ useHandCursor: true });

    const hitAreaPadding = 12;
    const hitboxVisual = this.add
      .rectangle(
        twoPlayerButton.x,
        twoPlayerButton.y,
        twoPlayerButton.displayWidth + hitAreaPadding * 2,
        twoPlayerButton.displayHeight + hitAreaPadding * 2,
        0xff0000,
        0.5,
      )
      .setFillStyle(0xff0000, 0.5)
      .setOrigin(0.5)
      .setDepth(-2)
      .setInteractive();

    play_button.on('pointerover', () => {
      this.tweens.add({
        targets: [twoPlayerButton, hitboxVisual],
        x: play_button.x + 350,
        duration: 150,
      });
    });

    let isTwoPlayerHovered = false;

    hitboxVisual.on('pointerover', () => {
      isTwoPlayerHovered = true;
      console.log("HITBOX OVER");
    });

    hitboxVisual.on('pointerout', () => {
      isTwoPlayerHovered = false;
      this.tweens.add({
        targets: [twoPlayerButton, hitboxVisual],
        x: this.scale.width / 5.7,
        duration: 150,
      });
    });

    play_button.on('pointerout', () => {
      this.time.delayedCall(0, () => {
        if (!isTwoPlayerHovered) {
          this.tweens.add({
            targets: [twoPlayerButton, hitboxVisual],
            x: this.scale.width / 5.7,
            duration: 150,
          });
        }
      });
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

    play_button.on("pointerover", () => {
      this.tweens.add({
        targets: play_button,
        scaleX: 0.32,
        scaleY: 0.32,
        y: playOriginalY - 5,
        duration: 100
      });
    });

    settings_button.on("pointerover", () => {
      this.tweens.add({
        targets: settings_button,
        scaleX: 0.32,
        scaleY: 0.32,
        y: settingsOriginalY - 5,
        duration: 100
      });
    });

   creditsButton.on("pointerover", () => {
      this.tweens.add({
        targets: creditsButton,
        scaleX: 0.32,
        scaleY: 0.32,
        y: creditsOriginalY - 5,
        duration: 100
      });
    });

    play_button.on("pointerout", () => {
      this.tweens.add({
        targets: play_button,
        scaleX: 0.30,
        scaleY: 0.30,
        y: playOriginalY,
        duration: 100
      });
    });

    settings_button.on("pointerout", () => {
      this.tweens.add({
        targets: settings_button,
        scaleX: 0.30,
        scaleY: 0.30,
        y: settingsOriginalY,
        duration: 100
      });
    });

   creditsButton.on("pointerout", () => {
      this.tweens.add({
        targets: creditsButton,
        scaleX: 0.30,
        scaleY: 0.30,
        y: creditsOriginalY,
        duration: 100
      });
    });

    AnleitungsButton.on("pointerover", () => {
      this.tweens.add({
        targets: AnleitungsButton,
        scaleX: 0.32,
        scaleY: 0.32,
        y: AnleitungsOriginalY - 5,
        duration: 100
      });
    });

    AnleitungsButton.on("pointerout", () => {
      this.tweens.add({
        targets: AnleitungsButton,
        scaleX: 0.30,
        scaleY: 0.30,
        duration: 100,
        y: AnleitungsOriginalY
      });
    });

    // Click events

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


    play_button.on('pointerdown', () => {
      this.scene.start('LoadingScene');
    });

    settings_button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
    });

    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });
    play_button.on('pointerover', () => {
console.log("play hover");
});
 
play_button.on('pointerout', () => {
console.log("play out");
});
 
hitboxVisual.on('pointerover', () => {
console.log("hitbox hover");
});
 
hitboxVisual.on('pointerout', () => {
console.log("hitbox out");
});
  }
}
