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
      fontSize: '20px',
    };

    const gameover = this.add
      .text(this.width / 2, this.height / 3, 'GAMEOVER', gameOverStyle)
      .setOrigin(0.5);

    const totalDistance = this.add
      .text(this.width / 2, this.height / 15, `Total Distance: ${this.distance}`, statsStyle)
      .setOrigin(0.5);

    const highScore = this.add
      .text(this.width / 2, this.height / 10, `High Score: ${this.score}`, statsStyle)
      .setOrigin(0.5);

    const playAgainButton = this.add
      .text(this.width / 2, this.height / 2, 'Nochmal Spielen', buttonStyle)
      .setOrigin(0.5)
      .setInteractive();

    const lobbyButton = this.add
      .text(this.width / 2, this.height / 1.5, 'Hauptmenü', buttonStyle)
      .setOrigin(0.5)
      .setInteractive();

    playAgainButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    lobbyButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
