/* global Phaser */

import Car from '../objects/Car.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';
import StartingLine from '../objects/StartingLine.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  preload() {
    this.load.image('car', 'sprites/Entities/Player Skins/Sybit Kart Player car 1.png');
    this.load.image('track', 'sprites/Race Track Assets/road.png');
    this.load.image('border', 'sprites/Race Track Assets/border.png');
    this.load.image('background', 'sprites/Map Skins/Hintergrund.png');
    this.load.image('startingline', 'sprites/Race Track Assets/starting_line.png');

    this.load.image('start-count-3', 'sprites/Race Track Assets/countdown3.png');
    this.load.image('start-count-2', 'sprites/Race Track Assets/countdown2.png');
    this.load.image('start-count-1', 'sprites/Race Track Assets/countdown1.png');
    this.load.image('start-go', 'sprites/Race Track Assets/goLabel.png');
    this.load.audio('countdown', 'audio/sfx/countdown.mp3');
  }

  create() {
    this.leaving = false;
    this.secondCar = null;
    this.number = null;

    const skipButton = this.add
      .text(this.scale.width - 80, this.scale.height - 50, 'Skip', {
        fontSize: '32px',
        backgroundColor: '#000000',
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setInteractive();

    skipButton.on('pointerdown', () => {
      this.goToGame();
    });
    this.createPlayer();
    this.createTrack();
    this.createWalls();
    this.setBackground('background');
    this.spawnStartingline();

    //countdown
    this.showNumber('start-count-3');
    this.sound.play('countdown');
    this.time.delayedCall(900, () => this.showNumber('start-count-2'));
    this.time.delayedCall(1800, () => this.showNumber('start-count-1'));
    this.time.delayedCall(2700, () => {
      this.showNumber('start-go');
      this.car.startAnim();
      if (this.secondCar) {
        this.secondCar.startAnim();
      }
    });
    this.time.delayedCall(4000, () => this.number.destroy());
  }

  setBackground(img) {
    const background = this.add.image(0, 0, img).setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
    background.setDepth(-10); // Set depth to -10 to ensure it is behind other objects
  }

  createPlayer() {
    if (this.isMultiplayer) {
      this.car = new Car(this, this.scale.width / 2 - 90, this.scale.height / 1.25);
      this.car.body.setSize(this.car.displayWidth * 1.25, this.car.displayHeight * 1.25);

      this.secondCar = new Car(
        this,
        this.scale.width / 2 + 90,
        this.scale.height / 1.25,
        'LEFT,RIGHT',
      );
      this.secondCar.body.setSize(
        this.secondCar.displayWidth * 1.25,
        this.secondCar.displayHeight * 1.25,
      );
    } else {
      this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
      this.car.body.setSize(this.car.displayWidth * 1.25, this.car.displayHeight * 1.25);
    }
  }

  createTrack() {
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);
  }

  spawnStartingline() {
    const startingLine = new StartingLine(
      this,
      this.track1.x,
      this.track1.y + this.track1.displayHeight / 2 + 120,
    );
    startingLine.setScale(0.75);
    startingLine.setDepth(21);
  }

  createWalls() {
    const screenCenterX = this.scale.width / 2;
    const roadHalfWidth = this.track1.displayWidth / 2;

    const wall1 = new Border(this, 0, 0);
    const wall2 = new Border(this, 0, 0);
    const wall3 = new Border(this, 0, -this.scale.height);
    const wall4 = new Border(this, 0, -this.scale.height);
    const wallHalfWidth = wall1.displayWidth / 2;

    wall1.x = screenCenterX - roadHalfWidth - wallHalfWidth;
    wall2.x = screenCenterX + roadHalfWidth + wallHalfWidth;
    wall3.x = screenCenterX - roadHalfWidth - wallHalfWidth;
    wall4.x = screenCenterX + roadHalfWidth + wallHalfWidth;

    wall2.setFlipX(true);
    wall4.setFlipX(true);

    this.walls = [wall1, wall2, wall3, wall4];
  }

  showNumber(key) {
    if (this.number) {
      this.number.destroy();
    }
    this.number = this.add.image(this.scale.width / 2, this.scale.height * 0.4, key);
    this.number.setScale(0.8);
    this.number.setDepth(22);
  }

  goToGame() {
    if (this.leaving) {
      return;
    }
    this.leaving = true;
    this.scene.start('GameScene', {
      isMultiplayer: this.isMultiplayer,
    });
  }

  update() {
    if (this.car.y <= -300) {
      this.goToGame();
    }
  }
}
