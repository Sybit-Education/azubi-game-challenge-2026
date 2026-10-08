/* global Phaser */

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  preload() {
    this.load.image('SYBIT KART', 'sprites/Homepage/Default Homepage/SYBIT KART.png');
    this.load.image('Message1', 'sprites/LoadingPage/Message1.png');
    this.load.image('Message2', 'sprites/LoadingPage/Message2.png');
    this.load.image('Message3', 'sprites/LoadingPage/Message3.png');
    this.load.image('Message4', 'sprites/LoadingPage/Message4.png');
    this.load.image('LoadingText', 'sprites/LoadingPage/Loading....png');
    this.load.image('Press SPACE to skip', 'sprites/LoadingPage/Press ‘SPACE’ to skip.png');
    this.load.image(
      'WeCreateCXChampions',
      'sprites/Homepage/Default Homepage/WeCreateCXChampions.png',
    );
  }

  create() {
    this.cameras.main.setBackgroundColor('#6f3198');

    // Navigation, orientation, progress and scaling variables
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const barWidth = width / 2.5;
    const height = this.cameras.main.height;
    const barHeight = 45;
    const spacing = height * 0.15;

    // Background image
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    // SYBIT KART Logo placeholder
    this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5);

    // Loading bar

    const loadingText = this.add;
    this.add
      .image(centerX, centerY - spacing / 4, 'LoadingText')
      .setOrigin(0.5)
      .setScale(0.3);

    const loadingBar = this.add.rectangle(
      centerX,
      centerY + spacing / 4,
      barWidth,
      barHeight,
      0x000000,
    );
    this.add.rectangle(centerX, centerY + spacing / 4, barWidth, barHeight, 0x000000);

    const fillBar = this.add.rectangle(
      centerX - barWidth / 2,
      centerY + spacing / 4,
      1,
      barHeight - 4,
      0xcbfc2a,
    );
    fillBar.setOrigin(0, 0.5);

    this.tweens.add({
      targets: fillBar,
      width: barWidth,
      duration: 3000,

      onComplete: () => {
        if (this.isMultiplayer) {
          this.scene.start('StartScene', { isMultiplayer: true });
        } else {
          this.scene.start('StartScene', { isMultiplayer: false });
        }
      },
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.isMultiplayer) {
        this.scene.start('StartScene', { isMultiplayer: true });
      } else {
        this.scene.start('StartScene', { isMultiplayer: false });
      }
    });

    this.add
      .image(centerX, centerY + spacing * 2, 'Press SPACE to skip')
      .setOrigin(0.5)
      .setScale(0.5);

    this.add
      .image(this.scale.width / 2, this.scale.height / 1.08, 'WeCreateCXChampions')
      .setOrigin(0.5)
      .setScale(0.3);

    // Funny comment, randomly selected
    const funnyComments = ['Message1', 'Message2', 'Message3', 'Message4'];
    const randomComment = funnyComments[Math.floor(Math.random() * funnyComments.length)];

    this.add
      .image(centerX, centerY + spacing * 1.4, randomComment)
      .setScale(0.8)
      .setOrigin(0.5);
  }
}
