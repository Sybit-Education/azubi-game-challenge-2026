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
        .setScale(0.35)
        .setInteractive();

      const text = this.add.text(x, y, label, {
        fontFamily: "Tiny5",
        fontSize: "62px",
        color: "#464646",
      })
      .setOrigin(0.5)
      .setInteractive()

      return {button, text};
    }

    const centerX = this.cameras.main.centerX 
    const centerY = this.cameras.main.centerY
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    this.cameras.main.setBackgroundColor('#6f3198');

    this.add.text(centerX, 125, 'SYBIT KART', {
    fontFamily: 'Tiny5',
    fontSize: '150px',
    color: '#ffffff'
    })
    .setOrigin(0.5);

    this.add.text(width - 50, height - 30, "v0.1", {
      fontFamily: 'Tiny5', 
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffffff',
      padding: {
        x: 10,
        y: 5,
        },
    })
    .setOrigin(0.5);

      const playButton = createButton(centerX, centerY - 100, "PLAY")

      const settingsButton = createButton(centerX, centerY + 100, "SETTINGS")

      const creditsButton = createButton(centerX, centerY + 300, "CREDITS")

      const creditsButtonY = creditsButton.y;

    playButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    playButton.on('pointerover', () => {
      this.tweens.add({
        targets: playButton,
        y: playButton.y - 5,
        scale: 0.27,
        duration: 100
      });

    });

    playButton.on('pointerout', () => {
    this.tweens.add({
      targets: playButton,
      y: playButtonY,
      scale: 0.25,
      duration: 100
    })
    });

    settingsButton.on('pointerover', () => {
      this.tweens.add({
        targets: settingsButton,
        y: settingsButtonY - 5,
        scale: 0.27,
        duration: 100
      });
    });

    settingsButton.on('pointerout', () => {
    this.tweens.add({
      targets: settingsButton,
      y: settingsButtonY,
      scale: 0.25,
      duration: 100
    })
    });

    creditsButton.on('pointerover', () => {
      this.tweens.add({
        targets: creditsButton,
        scale: 0.27,
        y: creditsButtonY - 5,
        duration: 100
      });
    });

    creditsButton.on('pointerout', () => {
    this.tweens.add({
      targets: creditsButton,
      scale: 0.25,
      y: creditsButtonY,
      duration: 100
    })
    });
  }
}
