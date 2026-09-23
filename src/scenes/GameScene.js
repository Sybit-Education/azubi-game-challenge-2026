/* global Phaser */

import Car from '../objects/Car.js';
import Track from '../objects/Track.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('car', 'sprites/race_car.png');
    this.load.image('track', 'sprites/race_track.png');
  }

  create() {
    this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);

    this.add
      .text(this.scale.width - 20, 20, `Score: ${this.car.value}`, {
        fontSize: '30px',
      })
      .setOrigin(1, 0);
  }

  update() {
    this.car.move();
    this.track1.move();
    this.track2.move();
  }
}
