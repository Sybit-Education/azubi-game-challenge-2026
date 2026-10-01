/* global Phaser */

export default class MenuScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('MenuScene');
  }

  // Pre load images
  preload() {
    //this.load.image('playButton', 'sprites/buttonTemplate.png');
    this.load.image('homepage-hintergrund', 'sprites/Homepage/Default Homepage/background.png');
    this.load.image('homepage-resonanz-label','sprites/Homepage/Default Homepage/Resonanz im Spiel 2.png');
    this.load.image('homepage-title', 'sprites/Homepage/Default Homepage/SYBIT KART.png');
    this.load.image('homepage-play-btn', 'sprites/Homepage/Default Homepage/playButton.png');
    this.load.image('homepage-settings', 'sprites/Homepage/Default Homepage/settingsButton.png');
    this.load.image('homepage-anleitung', 'sprites/Homepage/Default Homepage/anleitungButton.png');
    this.load.image('homepage-car', 'sprites/Homepage/Default Homepage/car.png');
    this.load.image('homepage-credits', 'sprites/Homepage/Default Homepage/creditsButton.png');
    this.load.image('homepage-barrierefreiheit','sprites/Homepage/Default Homepage/barrierefreiheitButton.png');
  }

  // Create scene
  create() {

    const footer_btn_y = this.scale.height / 1.17;

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    this.add
      .image(this.scale.width / 2, this.scale.height / 10, 'homepage-resonanz-label')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5);

    const play_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.33)
      .setInteractive();

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.55, 'homepage-settings')
      .setOrigin(0.5)
      .setScale(0.33)
      .setInteractive();

    const creditsButton = this.add
      .image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.27)
      .setInteractive();

    this.add
      .image(this.scale.width / 8, footer_btn_y, 'homepage-anleitung')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add
      .image(this.scale.width / 2, footer_btn_y, 'homepage-barrierefreiheit')
      .setOrigin(0.5)
      .setScale(0.3);
    this.add
      .image(this.scale.width, this.scale.height / 1.5, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

    play_button.on('pointerdown', () => {
      this.scene.start('LoadingScene');
    });

    settings_button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
    });

    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });
  }
}
