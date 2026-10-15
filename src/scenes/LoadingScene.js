import Phaser from 'phaser';
import InputManager from '../objects/InputManager.js';

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  preload() {
    this.load.image('SYBIT KART', 'assets/images/homepage/default-homepage/sybit-kart.png');
    this.load.image('Message1', 'assets/images/loading-page/message-1.png');
    this.load.image('Message2', 'assets/images/loading-page/message-2.png');
    this.load.image('Message3', 'assets/images/loading-page/message-3.png');
    this.load.image('Message4', 'assets/images/loading-page/message-4.png');
    this.load.image('LoadingText', 'assets/images/loading-page/loading.png');
    this.load.image('Press SPACE to skip', 'assets/images/loading-page/press-space-to-skip.png');
    this.load.image(
      'WeCreateCXChampions',
      'assets/images/homepage/default-homepage/we-create-cx-champions.png',
    );
  }

  create() {
    this.inputManager = new InputManager(this);
    this.inputManager.create();

    this.cameras.main.setBackgroundColor('#6f3198');

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const barWidth = width / 2.5;
    const height = this.cameras.main.height;
    const barHeight = 45;
    const spacing = height * 0.15;

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5);

    this.add
      .image(centerX, centerY - spacing / 4, 'LoadingText')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add.rectangle(centerX, centerY + spacing / 4, barWidth, barHeight, 0x000000);
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

    // Show a randomly selected message while the loading animation runs
    const funnyComments = ['Message1', 'Message2', 'Message3', 'Message4'];
    const randomComment = funnyComments[Math.floor(Math.random() * funnyComments.length)];

    this.add
      .image(centerX, centerY + spacing * 1.4, randomComment)
      .setScale(0.8)
      .setOrigin(0.5);
  }

  update() {
    this.inputManager.update();
    if (
      this.inputManager.getControlsP1.button4 ||
      this.inputManager.getControlsP1.button2 ||
      this.inputManager.getControlsP2.button4 ||
      this.inputManager.getControlsP2.button2
    ) {
      if (this.isMultiplayer) {
        this.scene.start('StartScene', { isMultiplayer: true });
      } else {
        this.scene.start('StartScene', { isMultiplayer: false });
      }
    }
  }
}
