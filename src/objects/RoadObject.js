/* global Phaser */

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

  move(time, delta) {
    this.speed = Math.min(1500, 600 + time * 0.005);

    this.y += (this.speed * delta) / 1000;

    const buffer = 100;

    const bottomLimit = this.gameScene.scale.height + this.displayHeight / 2 + buffer;

    if (this.y >= bottomLimit) {
      this.destroy();
    }
  }
}
