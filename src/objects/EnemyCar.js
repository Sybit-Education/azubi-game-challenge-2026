import Phaser from 'phaser';

import Obstacle from './Obstacle.js';
import { ROAD_LATERAL_SCALE } from './PerspectiveRoad.js';
import { REAR_ASPECT } from './RearVehicleSprites.js';

export default class EnemyCar extends Obstacle {
  constructor(scene, x, y, lane) {
    const randomInt = Phaser.Math.Between(1, 3);
    const texture = `enemy-car${randomInt}`;

    super(scene, x, y, texture, lane);
  }

  // Hitbox matches the drawn rear-view footprint, narrowed to the physics lane width.
  fitHitbox() {
    this.body.setSize(this.width / ROAD_LATERAL_SCALE, this.width * REAR_ASPECT);
  }

  move(time, delta) {
    this.speed = Math.min(1500, 300 + time * 0.005);

    this.y += (this.speed * this.speedScale() * delta) / 1000;

    const buffer = 100;

    const bottomLimit = this.gameScene.scale.height + this.displayHeight / 2 + buffer;

    if (this.y >= bottomLimit) {
      this.destroy();
    }
  }
}
