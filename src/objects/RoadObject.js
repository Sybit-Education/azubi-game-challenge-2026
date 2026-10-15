import Phaser from 'phaser';

export default class RoadObject extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, lane) {
    super(scene, x, y, texture);

    this.gameScene = scene;
    this.lane = lane;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5);
  }

  move(time, delta) {
    this.speed = Math.min(1600, 700 + time * 0.005);

    const heightFactor = this.gameScene.scale.height / 1200; // speeds are tuned for 1200px height
    this.y += (this.speed * heightFactor * delta) / 1000;

    const buffer = 100;

    const bottomLimit = this.gameScene.scale.height + this.displayHeight / 2 + buffer;

    if (this.y >= bottomLimit) {
      this.destroy();
    }
  }
}
