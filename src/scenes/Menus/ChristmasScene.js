/* global Phaser */

export default class ChristmasScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('ChristmasScene');
  }

  // Pre load images
  preload() {
    this.load.image('christmas-homepage-2player', 'sprites/Homepage/2Multiplayer.png');
    //this.load.image('playButton', 'sprites/buttonTemplate.png');
    this.load.image(
      'christmas-homepage-hintergrund',
      'sprites/Homepage/Default Homepage/background.png',
    );
    this.load.image(
      'christmas-homepage-resonanz',
      'sprites/Homepage/Default Homepage/Resonanz.png',
    );
    this.load.image(
      'christmas-homepage-title',
      'sprites/Homepage/Weihnachts Homepage/Sybit Kart Weihnachtsthema.png',
    );
    this.load.image(
      'christmas-homepage-lights',
      'sprites/Homepage/Weihnachts Homepage/Die Lichterkette.png',
    );
    this.load.image(
      'christmas-homepage-play-btn',
      'sprites/Homepage/Default Homepage/playButton.png',
    );
    this.load.image(
      'christmas-homepage-settings',
      'sprites/Homepage/Default Homepage/settingsButton.png',
    );
    this.load.image(
      'christmas-homepage-trees',
      'sprites/Homepage/Weihnachts Homepage/biggerTrees.png',
    );
    this.load.image('christmas-homepage-car', 'sprites/Homepage/Default Homepage/car.png');
    this.load.image(
      'christmas-homepage-credits',
      'sprites/Homepage/Default Homepage/creditsButton.png',
    );
    this.load.image(
      'christmas-homepage-barrierefreiheit',
      'sprites/Homepage/Default Homepage/barrierefreiheitButton.png',
    );
  }

  // Create scene
  create() {
    const footer_btn_y = this.scale.height / 1.17;
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'christmas-homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(-100);

    this.add
      .image(this.scale.width / 2, this.scale.height / 3, 'christmas-homepage-title')
      .setOrigin(0.5)
      .setScale(0.5);

    this.add
      .image(this.scale.width / 2, this.scale.height / 6, 'christmas-homepage-lights')
      .setOrigin(0.5)
      .setScale(0.5);

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.55, 'christmas-homepage-settings')
      .setOrigin(0.5)
      .setScale(0.33)
      .setInteractive();

    const play_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'christmas-homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.33)
      .setInteractive();

    const twoPlayerButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'christmas-homepage-2player')
      .setOrigin(0.5)
      .setScale(0.278)
      .setDepth(-1);

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
    const creditsButton = this.add
      .image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.4)
      .setInteractive();
    creditsButton.setDepth(3);

    this.add
      .image(this.scale.width / 1.3, footer_btn_y * 1.1, 'christmas-homepage-resonanz')
      .setOrigin(0.5)
      .setScale(0.4);

    this.add
      .image(this.scale.width / 3, this.scale.height * 0.84, 'christmas-homepage-trees')
      .setOrigin(0.5)
      .setScale(0.33);

    this.add
      .image(this.scale.width / 2, footer_btn_y, 'homepage-barrierefreiheit')
      .setOrigin(0.5)
      .setScale(0.4);
    this.add
      .image(this.scale.width, this.scale.height / 1.5, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

    play_button.on('pointerdown', () => {
      this.registry.set('gameMode', 'christmas');
      this.scene.start('LoadingScene', { isMultiplayer: false });
    });

    settings_button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
      this.scene.bringToTop('PopUpScene');
    });

    hitboxVisual.on('pointerdown', () => {
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });
    //logik um multiplayer zu starten
    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });
  }
}
