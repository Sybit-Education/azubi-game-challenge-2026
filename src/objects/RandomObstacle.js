import Phaser from 'phaser';

import Obstacle from './Obstacle.js';

export default class RandomObstacle extends Obstacle {
  constructor(scene, x, y, lane) {
    const randomInt = Phaser.Math.Between(1, 4);
    const texture = `random-object${randomInt}`;

    super(scene, x, y, texture, lane);

    this.isDuck = randomInt === 2;
    this.isBarrier = randomInt === 4;
    if (this.isBarrier) {
      this.setScale(0.37);
    } else {
      this.setScale(scene.scale.height / 10000);
    }
    this.duckSoundPlayed = false;
  }
}
