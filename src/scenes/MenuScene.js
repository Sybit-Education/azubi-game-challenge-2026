/* global Phaser */

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

preload() {
  this.load.image(
    "playButton",
    "sprites/buttonTemplate.png");
}

  create() {

    const createButton = (x, y, label) => {
      const button = this.add.image(x, y, "playButton")
        .setScale(0.37 * uiScale)
        .setInteractive();

      const text = this.add.text(x, y, label, {
        fontFamily: "Tiny5",
        fontSize: `${62 * uiScale}px`,
        color: "#464646",
      })
      .setOrigin(0.5);

      return {button, text};
    }

    // Variables for orientation, positioning and scaling (if you read this, you're cool :))
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const spacing = height * 0.15;
    const uiScale = Math.min(
      width / 1920,
      height / 1080
    );

    this.cameras.main.setBackgroundColor('#6f3198');

    // SYBIT KART Logo placeholder
    this.add.text(centerX, 125, 'SYBIT KART', {
      fontFamily: 'Tiny5',
      fontSize: `${150 * uiScale}px`,
      color: '#ffffff'
      })
      .setOrigin(0.5);

    // Version tracker
    this.add.text(width - 50, height - 30, "v0.1", {
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
      const playButton = createButton(centerX, centerY - spacing, "START")
      const settingsButton = createButton(centerX, centerY, "SETTINGS")
      const creditsButton = createButton(centerX, centerY + spacing, "CREDITS")

      // List of useful button-specific variables
      const playButtonY = playButton.button.y;
      const settingsButtonY = settingsButton.button.y;
      const creditsButtonY = creditsButton.button.y;

      // Hover and unhover conditions

    playButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [playButton.button, playButton.text],
        y: playButton.button.y - 5,
        duration: 100
      });

    });

    playButton.button.on('pointerout', () => {
    this.tweens.add({
      targets: [playButton.button, playButton.text],
      y: playButtonY,
      duration: 100
    })
    });

    settingsButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [settingsButton.button, settingsButton.text],
        y: settingsButton.button.y - 5,
        duration: 100
      });
    });

    settingsButton.button.on('pointerout', () => {
    this.tweens.add({
      targets: [settingsButton.button, settingsButton.text],
      y: settingsButtonY,
      duration: 100
    })
    });

    creditsButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [creditsButton.button, creditsButton.text],
        y: creditsButton.button.y - 5,
        duration: 100
      });
    });

    creditsButton.button.on('pointerout', () => {
    this.tweens.add({
      targets: [creditsButton.button, creditsButton.text],
      y: creditsButtonY,
      duration: 100
    })
    });

    // Click events 

      playButton.button.on('pointerdown', () => {
      this.scene.start('GameScene');

      });
  }
}

