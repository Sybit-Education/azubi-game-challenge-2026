/* global Phaser */

export default class MenuScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('MenuScene');
  }

  // Pre load images
  preload() {
    this.load.image('playButton', 'sprites/buttonTemplate.png');
    this.load.image('homepage-hintergrund', 'sprites/Homepage/hINTERGRUND 2.png');
    this.load.image('homepage-logo', 'sprites/Homepage/LOGO 2.png');
    this.load.image('homepage-resonanz-label', 'sprites/Homepage/Resonanz im Spiel 2.png');
    this.load.image('homepage-title', 'sprites/Homepage/SYBIT KART.png');
    this.load.image('homepage-play-btn', 'sprites/Homepage/Frame 1.png');
    this.load.image('homepage-settings', 'sprites/Homepage/Frame 2.png');
    this.load.image('homepage-line', 'sprites/Homepage/Group 17.png');
    this.load.image('homepage-anleitung', 'sprites/Homepage/Group 27.png');
    this.load.image('homepage-car', 'sprites/Homepage/Group 25.png');
    this.load.image('homepage-credits', 'sprites/Homepage/Group 28.png');
    this.load.image('homepage-barrierefreiheit', 'sprites/Homepage/Group 29.png');
  }

  // Create scene
  create() {
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    this.add
      .image(this.scale.width / 6.7, this.scale.height / 10, 'homepage-logo')
      .setOrigin(0.5)
      .setScale(0.3);
    this.add
      .image(this.scale.width / 2, this.scale.height / 10, 'homepage-resonanz-label')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.3);

    const play_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.27)
      .setInteractive();

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.6, 'homepage-settings')
      .setOrigin(0.5)
      .setScale(0.27)
      .setInteractive();
    
    const creditsButton = this.add
      .image(this.scale.width / 1.15, this.scale.height / 1.15, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.27)
      .setInteractive();

    this.add
      .image(this.scale.width / 2.1, this.scale.height / 1.1, 'homepage-line')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add
      .image(this.scale.width / 5.8, this.scale.height / 1.15, 'homepage-anleitung')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add
      .image(this.scale.width / 2, this.scale.height / 1.15, 'homepage-barrierefreiheit')
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

    //Den Rest hier lasse ich Erstmal, weil ich nichts gelesen habe und vielleicht braucht man was davon später (Beim Optimieren kann man eventuell den Rest löschen)
    /*
    // Button genator wrapper
    const createButton = (x, y, label) => {
      const button = this.add
        .image(x, y, 'playButton')
        .setScale(0.37 * uiScale)
        .setInteractive();

      const text = this.add
        .text(x, y, label, {
          fontFamily: 'Tiny5',
          fontSize: `${62 * uiScale}px`,
          color: '#464646',
        })
        .setOrigin(0.5);

      return { button, text };
    };

    // Variables for orientation, positioning and scaling (if you read this, you're cool :))
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const uiScale = Math.min(width / 1920, height / 1080);
    const spacing = 180 * uiScale;
    //let selectedIndex = 0;

    // Sets background color
  

    // SYBIT KART Logo placeholder
 

    

    // Version tracker
    this.add
      .text(width * 0.97, height * 0.97, 'v0.5', {
        fontFamily: 'Tiny5',
        fontSize: `${32 * uiScale}px`,
        fontStyle: 'bold',
        color: '#ffffff',
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5);

    // Buttons + Text (function defined above)
    const playButton = createButton(centerX, centerY - spacing * 1, 'START');
    const settingsButton = createButton(centerX, centerY * 1.05, 'SETTINGS');
    const creditsButton = createButton(centerX, centerY + spacing * 1.3, 'CREDITS');

    //const buttons = [playButton, settingsButton, createButton];

    // List of useful button-specific variables
    const playButtonY = playButton.button.y;
    const settingsButtonY = settingsButton.button.y;

    // Navigation with TAB
    this.input.keyboard.on('keydown-TAB', () => {});

    // Hover and unhover conditions
    playButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [playButton.button, playButton.text],
        y: playButton.button.y - 5 * uiScale,
        duration: 100,
      });
    });

    playButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [playButton.button, playButton.text],
        y: playButtonY,
        duration: 100,
      });
    });

    settingsButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [settingsButton.button, settingsButton.text],
        y: settingsButton.button.y - 5,
        duration: 100,
      });
    });

    settingsButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [settingsButton.button, settingsButton.text],
        y: settingsButtonY,
        duration: 100,
      });
    });

    creditsButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [creditsButton.button, creditsButton.text],
        y: creditsButton.button.y - 5,
        duration: 100,
      });
    });

    creditsButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [creditsButton.button, creditsButton.text],
        y: creditsButtonY,
        duration: 100,
      });
    });

    // Click events
    playButton.button.on('pointerdown', () => {
      this.scene.start('LoadingScene');
    });

    settingsButton.button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
    });
  }
}*/}}