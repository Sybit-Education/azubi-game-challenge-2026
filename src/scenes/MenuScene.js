/* global Phaser */

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    this.cameras.main.setBackgroundColor('#000056')

    this.add.text(centerX, 100, 'SYBIT KART', {
    fontFamily: 'Tiny5',
    fontSize: '96px',
    color: '#ffffff'
    })
    .setOrigin(0.5);

    this.add.text(1600, 1250, "v0.1", {
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

    let button0 = this.add
      .text(centerX, 300, 'Start Game', {
        backgroundColor: "#C1C3E9",
        fontSize: '32px',
        fontFamily: 'Tiny5',
        fontStyle: 'bold',
        color: '#000000',
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setInteractive();
      const originalY0 = button0.y;

      const button1 = this.add
      .text(centerX, 380, 'Settings', {
        fontSize: '32px',
        fontFamily: 'Tiny5',
        fontStyle: 'bold',
        backgroundColor: "#C1C3E9",
        color: '#000000',
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setInteractive();

      const originalY1 = button1.y;

      const button2 = this.add
        .text(centerX, 460, 'Credits', {
        fontSize: '32px',
        backgroundColor: "#C1C3E9",
        fontFamily: 'Tiny5',
        fontStyle: 'bold',
        color: '#000000',
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setInteractive();

      const originalY2 = button2.y;

    button0.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    button0.on('pointerover', () => {
      this.tweens.add({
        targets: button0,
        y: originalY0 - 5,
        scale: 1.1,
        duration: 100
      });
    });

    button0.on('pointerout', () => {
    this.tweens.add({
      targets: button0,
      y: originalY0,
      scale: 1.0,
      duration: 100
    })
    });

    button1.on('pointerover', () => {
      this.tweens.add({
        targets: button1,
        y: originalY1 - 5,
        scale: 1.1,
        duration: 100
      });
    });

    button1.on('pointerout', () => {
    this.tweens.add({
      targets: button1,
      y: originalY1,
      scale: 1.0,
      duration: 100
    })
    });

    button2.on('pointerover', () => {
      this.tweens.add({
        targets: button2,
        scale: 1.1,
        y: originalY2 - 5,
        duration: 100
      });
    });

    button2.on('pointerout', () => {
    this.tweens.add({
      targets: button2,
      scale: 1.0,
      y: originalY2,
      duration: 100
    })
    });
  }
}
