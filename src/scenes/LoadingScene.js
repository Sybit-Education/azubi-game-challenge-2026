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
    this.load.image(
      'homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );

    this.load.image('homepage-title', 'assets/images/homepage/default-homepage/sybit-kart.png');

    this.load.image(
      'WeCreateCXChampions',
      'assets/images/homepage/default-homepage/we-create-cx-champions.png',
    );

    this.load.image('Message1', 'assets/images/loading-page/message-1.png');
    this.load.image('Message2', 'assets/images/loading-page/message-2.png');
    this.load.image('Message3', 'assets/images/loading-page/message-3.png');
    this.load.image('Message4', 'assets/images/loading-page/message-4.png');

    this.load.image('LoadingText', 'assets/images/loading-page/loading.png');

    this.load.image('Press SPACE to skip', 'assets/images/loading-page/press-space-to-skip.png');
  }

  create() {
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    this.cameras.main.setBackgroundColor('#6f3198');

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Background
    this.background = this.add.image(centerX, centerY, 'homepage-hintergrund');

    // Title
    this.title = this.add.image(centerX, this.scale.height / 4, 'homepage-title').setOrigin(0.5);

    // Loading text
    this.loadingText = this.add.image(centerX, centerY, 'LoadingText').setOrigin(0.5);

    // Loading bar
    this.loadingBarBg = this.add.rectangle(centerX, centerY, 100, 40, 0x000000);

    this.fillBar = this.add.rectangle(centerX, centerY, 1, 40, 0xcbfc2a);

    this.fillBar.setOrigin(0, 0.5);

    // Skip text
    this.skipText = this.add.image(centerX, centerY, 'Press SPACE to skip').setOrigin(0.5);

    // Motto
    this.motto = this.add
      .image(centerX, this.scale.height / 1.08, 'WeCreateCXChampions')
      .setOrigin(0.5);

    // Random comment
    const funnyComments = ['Message1', 'Message2', 'Message3', 'Message4'];

    const randomComment = funnyComments[Math.floor(Math.random() * funnyComments.length)];

    this.randomComment = this.add.image(centerX, centerY, randomComment).setOrigin(0.5);

    this.scale.on('resize', this.resize, this);
    this.resize({
      width: this.scale.width,
      height: this.scale.height,
    });

    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
    });

    const barWidth = this.scale.width / 2.5;

    this.tweens.add({
      targets: this.fillBar,
      width: barWidth,
      duration: 3000,
      onComplete: () => {

        this.scene.start('StartScene', {
          isMultiplayer: this.isMultiplayer,
        });
      },
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('StartScene', {
        isMultiplayer: this.isMultiplayer,
      });
    });
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    const scaleFactor = Math.min(width / 1920, height / 1080);

    const centerX = width / 2;
    const centerY = height / 2;

    const spacing = height * 0.15;

    const barWidth = width / 2.5;
    const barHeight = 45 * scaleFactor;

    // Background
    this.background.setPosition(centerX, centerY).setDisplaySize(width, height);

    // Title
    this.title.setPosition(centerX, height / 4).setScale(0.5 * scaleFactor);

    // Loading text
    this.loadingText.setPosition(centerX, centerY - spacing / 4).setScale(0.3 * scaleFactor);

    // Loading bar background
    this.loadingBarBg.setPosition(centerX, centerY + spacing / 4).setSize(barWidth, barHeight);

    // Loading bar fill
    this.fillBar
      .setPosition(centerX - barWidth / 2, centerY + spacing / 4)
      .setSize(Math.min(this.fillBar.width, barWidth), Math.max(barHeight - 4, 4));

    // Skip text
    this.skipText.setPosition(centerX, centerY + spacing * 2).setScale(0.5 * scaleFactor);

    // Motto
    this.motto.setPosition(centerX, height / 1.08).setScale(0.3 * scaleFactor);

    // Random message
    this.randomComment.setPosition(centerX, centerY + spacing * 1.4).setScale(0.8 * scaleFactor);
  }

  update() {
    this.InputManager.update();

    if (
      this.InputManager.getControlsP1.button4 ||
      this.InputManager.getControlsP1.button2 ||
      this.InputManager.getControlsP2.button4 ||
      this.InputManager.getControlsP2.button2
    ) {
      this.scene.start('StartScene', {
        isMultiplayer: this.isMultiplayer,
      });
    }
  }
}
