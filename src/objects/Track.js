/* global Phaser */

export default class Track extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'track');

    scene.add.existing(this);
    this.scale = this.scene.scale.height / this.height;
    this.speed = 5;
    this.setScale(this.scale);
    this.setDepth(-1);
    this.setOrigin(0.5, 0);
  }

  move() {
    this.y += this.speed;
    if (this.y >= this.scene.scale.height) {
      this.y = -this.scene.scale.height;
    }
  }
}
