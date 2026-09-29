/* global Phaser */

export default class GameoverScene extends Phaser.Scene {
  constructor() {
    super('GameoverScene');
  }

  init(data) {
    this.distance = data.distance;
    this.score = data.score;
  }
  create() {
    this.width = this.scale.width;
    this.height = this.scale.height;

    this.add
      .image(this.width / 2, this.height / 2, 'gameover-hintergrund')
      .setDisplaySize(this.width, this.height);

    const buttonStyle = {
      fontSize: '32px',
      color: '#ffffff',
      padding: {
        x: 10,
        y: 5,
      },
    };

    const gameOverStyle = {
      ...buttonStyle,
      fontSize: '130px',
    };

    const statsStyle = {
      ...buttonStyle,
      fontSize: '30px',
    };

    this.add
      .image(this.width / 2, this.height / 3, 'gameover-title')
      .setOrigin(0.5)
      .setScale(0.6);

    this.add
      .image(this.width / 1.9, this.height / 2.2, 'gameover-distance-text')
      .setOrigin(0.5)
      .setScale(0.4);
    this.add.text(this.width / 1.67, this.height / 2.2, ` ${1000000}`, statsStyle).setOrigin(0.5);

    this.add
      .image(this.width / 2.7, this.height / 2.2, 'gameover-score-text')
      .setOrigin(0.5)
      .setScale(0.4);
    this.add.text(this.width / 2.31, this.height / 2.2, `${this.score}`, statsStyle).setOrigin(0.5);

    const playAgainButton = this.add
      .image(this.width / 2, this.height / 1.8, 'gameover-play-again')
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.4);

    const lobbyButton = this.add
      .image(this.width / 2, this.height / 1.5, 'gameover-menu-btn')
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.4);

    playAgainButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    lobbyButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
