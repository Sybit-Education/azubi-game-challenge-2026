import Phaser from 'phaser';

import Obstacle from './Obstacle.js';

export default class EnemyCar extends Obstacle {
  constructor(scene, x, y, lane) {
    const randomInt = Phaser.Math.Between(1, 3);
    const texture = `enemy-car${randomInt}`;

    super(scene, x, y, texture, lane);
  }

  move(time, delta) {
    this.speed = Math.min(1600, 400 + time * 0.005);

    const heightFactor = this.gameScene.scale.height / 1200; // speeds are tuned for 1200px height
    this.y += (this.speed * heightFactor * delta) / 1000;

    const buffer = 100;

    const bottomLimit = this.gameScene.scale.height + this.displayHeight / 2 + buffer;

    if (this.y >= bottomLimit) {
      this.destroy();
    }
  }
}
