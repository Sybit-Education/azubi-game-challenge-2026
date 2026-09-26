/* global Phaser */

import Car from '../objects/Car.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  preload() {
    this.load.image('car', 'sprites/Sybit Kart Player car 1.png');
    this.load.image('track', 'sprites/road.png');
    this.load.image('border', 'sprites/border.png');
  }

  create() {
    const button = this.add
      .text(1300, 600, 'Skip', {
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
      this.scene.start('GameScene');
    });
    this.createPlayer();
    this.createTrack();
    this.createWalls();
  }

  createPlayer() {
    this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
    this.car.startAnim();
  }

  createTrack() {
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);
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

    this.physics.add.collider(this.car, this.walls);
  }

  update() {
    if (this.car.y <= -300) {
      this.scene.start('GameScene');
    }
  }
}
