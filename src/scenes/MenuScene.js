/* global Phaser */

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const button = this.add
      .text(this.scale.width / 2, this.scale.height / 2, 'Start Game', {
        fontSize: '32px',
        backgroundColor: '#000000',
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setInteractive();

    button.on('pointerdown', () => {
      this.scene.start('StartScene');
    });

    const tut_button = this.add
      .text(this.scale.width / 2, this.scale.height / 1.5, 'tutorial', {
        fontSize: '32px',
        backgroundColor: '#000000',
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setInteractive();

    tut_button.on('pointerdown', () => {
      pass;
    });
  }
}
