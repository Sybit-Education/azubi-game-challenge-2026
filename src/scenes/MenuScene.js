/* global Phaser */

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const button = this.add
      .text(400, 300, 'Start Game', {
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
  }
}
