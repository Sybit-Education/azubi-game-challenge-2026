import Phaser from 'phaser';

export default class ChristmasScene extends Phaser.Scene {
  constructor() {
    super('ChristmasScene');
  }

  preload() {
    this.load.image('christmas-homepage-2player', 'assets/images/homepage/2-multiplayer.png');
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
    this.load.image(
      'christmas-homepage-credits',
      'assets/images/homepage/default-homepage/credits-button.png',
    );
    this.load.image(
      'christmas-homepage-barrierefreiheit',
      'assets/images/homepage/default-homepage/barrierefreiheit-button.png',
    );
  }

  create() {
    const footerButtonY = this.scale.height / 1.17;
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

    const settingsButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.55, 'christmas-homepage-settings')
      .setOrigin(0.5)
      .setScale(0.33)
      .setInteractive();

    const playButton = this.add
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

    playButton.on('pointerover', () => {
      this.tweens.add({
        targets: [twoPlayerButton, hitboxVisual],
        x: playButton.x + 350,
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

    playButton.on('pointerout', () => {
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
      .image(this.scale.width / 1.14, footerButtonY, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.4)
      .setInteractive();
    creditsButton.setDepth(3);

    this.add
      .image(this.scale.width / 1.3, footerButtonY * 1.1, 'christmas-homepage-resonanz')
      .setOrigin(0.5)
      .setScale(0.4);

    this.add
      .image(this.scale.width / 3, this.scale.height * 0.84, 'christmas-homepage-trees')
      .setOrigin(0.5)
      .setScale(0.33);

    this.add
      .image(this.scale.width / 2, footerButtonY, 'homepage-barrierefreiheit')
      .setOrigin(0.5)
      .setScale(0.4);
    this.add
      .image(this.scale.width, this.scale.height / 1.5, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

    playButton.on('pointerdown', () => {
      this.registry.set('gameMode', 'christmas');
      this.scene.start('LoadingScene', { isMultiplayer: false });
    });

    settingsButton.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
      this.scene.bringToTop('PopUpScene');
    });

    hitboxVisual.on('pointerdown', () => {
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });
    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });
  }
}
