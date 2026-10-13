import Phaser from 'phaser';

import { ROAD_LATERAL_SCALE, SPRITE_GROUND_SQUASH } from './PerspectiveRoad.js';

export default class RoadObject extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, lane) {
    super(scene, x, y, texture);

    this.gameScene = scene;
    this.lane = lane;
    this.speed = 600;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5);
  }

  // Hitbox matches the drawn footprint: narrower in x, squashed in y.
  fitHitbox() {
    this.body.setSize(this.width / ROAD_LATERAL_SCALE, this.height * SPRITE_GROUND_SQUASH);
  }

  speedScale() {
    const { height } = this.gameScene.scale;
    return this.gameScene.perspectiveRoad.roadSpeedScale(this.y, height);
  }

  move(time, delta) {
    this.speed = Math.min(1500, 600 + time * 0.005);

    this.y += (this.speed * this.speedScale() * delta) / 1000;

    const buffer = 100;

    const bottomLimit = this.gameScene.scale.height + this.displayHeight / 2 + buffer;

    if (this.y >= bottomLimit) {
      this.destroy();
    }
  }
}
