import Phaser from 'phaser';

import Obstacle from './Obstacle.js';

export default class RandomObstacle extends Obstacle {
  constructor(scene, x, y, lane) {
    const randomInt = Phaser.Math.Between(1, 3);
    const texture = `random-object${randomInt}`;

    super(scene, x, y, texture, lane);

    this.setScale(scene.scale.height / 10000);
  }
}
