/* global Phaser */

import Obstacle from './Obstacle.js';

export default class EnemyCar extends Obstacle {
  constructor(scene, x, y, lane) {
    const randomInt = Phaser.Math.Between(1, 3);
    const texture = `enemy-car${randomInt}`;

    super(scene, x, y, texture, lane);
  }
}