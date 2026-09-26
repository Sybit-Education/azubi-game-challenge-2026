/* global Phaser */

export default class Border extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'border');

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.scale = this.scene.scale.height / this.height;
    this.speed = 5;
    this.setScale(this.scale);
    this.setDepth(-1);
    this.setOrigin(0.5, 0);

    this.setImmovable(true);
  }

  move(delta) {
    this.y += (this.speed * delta) / 1000;

    if (this.y >= this.scene.scale.height) {
      this.y -= this.displayHeight * 2;
    }
  }
}
