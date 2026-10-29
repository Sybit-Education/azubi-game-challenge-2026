import Phaser from 'phaser';

import Obstacle from './Obstacle.js';

export default class RandomObstacle extends Obstacle {
  constructor(scene, x, y, lane) {
    const scaleFactor = Math.min(scene.scale.width / 1920, scene.scale.height / 1080);
    let randomInt;
    if (scene.registry.get('gameMode') === 'christmas') {
      randomInt = Phaser.Math.Between(5, 7);
    } else {
      randomInt = Phaser.Math.Between(1, 4);
    }

    const texture = `random-object${randomInt}`;

    super(scene, x, y, texture, lane);

    this.isDuck = randomInt === 2;
    this.isBarrier = randomInt === 4;
    this.isDeer = randomInt === 5;
    this.isGnome = randomInt === 6;
    this.isSleigh = randomInt === 7;

    if (this.isBarrier) {
      this.setScale(0.37 * scaleFactor);
    } else if (this.isDeer) {
      this.setScale(1.4 * scaleFactor);
    } else if (this.isGnome) {
      this.setScale(2.2 * scaleFactor);
    } else if (this.isSleigh) {
      this.setScale(0.4 * scaleFactor);
    } else {
      this.setScale(scene.scale.height / 10000);
    }
    this.duckSoundPlayed = false;
  }
}
