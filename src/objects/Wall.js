/* global Phaser */

export default class Border extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'border');

    scene.add.existing(this);
    this.speed = 5;
    this.setScale(scene.scale.height / this.height);
    this.setDepth(-1);
    this.setOrigin(0.5, 0);
  }

  move(delta) {
    this.y += (this.speed * delta) / 1000;

    if (this.y >= this.scene.scale.height) {
      this.y -= this.displayHeight * 2;
    }
  }
}
