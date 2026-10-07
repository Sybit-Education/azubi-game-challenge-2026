/* global Phaser */

export default class GameoverScene extends Phaser.Scene {
  constructor() {
    super('GameoverScene');
  }

  init(data) {
    this.distance = data.distance;
    this.score = data.score;
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  preload() {
    this.load.image('gameover-title', 'sprites/Gameover Scene Assets/GAME OVER.png');
    this.load.image('gameover-play-again', 'sprites/Gameover Scene Assets/Nochmal spielen.png');
    this.load.image('gameover-menu-btn', 'sprites/Gameover Scene Assets/Hauptmenü 1.png');
    this.load.image('gameover-score-text', 'sprites/Gameover Scene Assets/score_.png');
    this.load.image('gameover-distance-text', 'sprites/Gameover Scene Assets/Distanz_.png');
    this.load.image(
      'gameover-hintergrund',
      'sprites/Gameover Scene Assets/GAME OVER Hintergrund.png',
    );
  }
  create() {
    this.width = this.scale.width;
    this.height = this.scale.height;

    this.add
      .image(this.width / 2, this.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    const statsStyle = {
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
    this.add
      .text(this.width / 1.67, this.height / 2.2, ` ${this.distance} Km`, statsStyle)
      .setOrigin(0.5);

    this.add
      .image(this.width / 2.7, this.height / 2.2, 'gameover-score-text')
      .setOrigin(0.5)
      .setScale(0.4);
    this.add
      .text(this.width / 2.31, this.height / 2.2, `${this.score} Pts`, statsStyle)
      .setOrigin(0.5);

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
    // Hover state for buttons

    playAgainButton.on('pointerover', () => {
      this.tweens.add({
        targets: playAgainButton,
        scale: 0.45,
        duration: 100,
      });
    });

    playAgainButton.on('pointerout', () => {
      this.tweens.add({
        targets: playAgainButton,
        scale: 0.4,
        duration: 100,
      });
    });

    lobbyButton.on('pointerover', () => {
      this.tweens.add({
        targets: lobbyButton,
        scale: 0.45,
        duration: 100,
      });
    });

    lobbyButton.on('pointerout', () => {
      this.tweens.add({
        targets: lobbyButton,
        scale: 0.4,
        duration: 100,
      });
    });

    // Click events
    playAgainButton.on('pointerdown', () => {
      this.scene.start('GameScene', {
        isMultiplayer: this.isMultiplayer,
      });
    });

    lobbyButton.on('pointerdown', () => {
      const gameMode = this.registry.get('gameMode');

      if (gameMode === 'christmas') {
        this.scene.start('ChristmasScene');
      } else {
        this.scene.start('MenuScene');
      }
    });
  }
}