/* global Phaser */

import Obstacle from './Obstacle.js';

export default class EnemyCar extends Obstacle {
  constructor(scene, x, y, lane) {
    const randomInt = Phaser.Math.Between(1, 3);
    const texture = `enemy-car${randomInt}`;

    super(scene, x, y, texture, lane);
  }

  move(delta) {
    this.speed = Math.min(1500, 300 + this.gameScene.car.meters * 0.1);

    this.y += (this.speed * delta) / 1000;

    const buffer = 100;

    const bottomLimit = this.gameScene.scale.height + this.displayHeight / 2 + buffer;

    if (this.y >= bottomLimit) {
      this.destroy();
    }
  }
}
