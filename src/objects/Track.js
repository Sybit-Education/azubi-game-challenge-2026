import Phaser from 'phaser';

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

  move(delta) {
    if (!this.scene?.scale) {
      return;
    }
    const heightFactor = this.scene.scale.height / 1200; // speeds are tuned for 1200px height
    this.y += (this.speed * heightFactor * delta) / 1000;

    if (this.y >= this.scene.scale.height) {
      this.y -= this.displayHeight * 2;
    }
  }
}
