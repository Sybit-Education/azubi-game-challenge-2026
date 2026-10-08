import Phaser from 'phaser';

import { positionAccessibleControls } from '../../accessibility/positionControls.js';

export default class ChristmasScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('ChristmasScene');
  }

  // Pre load images
  preload() {
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
      'christmas-homepage-barrierefreiheit',
      'assets/images/homepage/default-homepage/barrierefreiheit-button.png',
    );
  }

  // Create scene
  create(data) {
    //html Menus erneut für diesen Scene herholen.
    const menu = document.getElementById('accessible-ui');
    const playBtn = document.getElementById('start-game');
    const settingsBtn = document.getElementById('settings-btn');

    const startGame = () => {
      this.registry.set('gameMode', 'christmas');
      this.scene.start('LoadingScene', { isMultiplayer: false });
    };

    const openSettings = () => {
      this.scene.launch('PopUpScene');
      this.scene.bringToTop('PopUpScene');
    };

    playBtn.addEventListener('click', startGame);
    settingsBtn.addEventListener('click', openSettings);

    menu.hidden = false;
    const focusTarget = document.getElementById(data?.focusTarget ?? 'start-game');
    focusTarget.focus();

    this.events.once('shutdown', () => {
      playBtn.removeEventListener('click', startGame);
      settingsBtn.removeEventListener('click', openSettings);
      menu.hidden = true;
    });

    const footer_btn_y = this.scale.height / 1.17;
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
      .setScale(0.5);

    const lights = this.add
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

    const trees = this.add
      .image(this.scale.width / 3, this.scale.height * 0.84, 'christmas-homepage-trees')
      .setOrigin(0.5)
      .setScale(0.35);

    this.add
      .image(this.scale.width / 2, footer_btn_y, 'homepage-barrierefreiheit')
      .setOrigin(0.5)
      .setScale(0.4);
    const homepageCar = this.add
      .image(this.scale.width, this.scale.height / 1.45, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

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
        this.scale.height * 0.84 + (pointer.y - this.scale.height / 2) * 0.0225,
      );
    });

    positionAccessibleControls(this, [
      [playBtn, play_button],
      [settingsBtn, settings_button],
    ]);

    play_button.on('pointerdown', startGame);
    settings_button.on('pointerdown', openSettings);

    hitboxVisual.on('pointerdown', () => {
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });
    //logik um multiplayer zu starten
    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });
  }
}
