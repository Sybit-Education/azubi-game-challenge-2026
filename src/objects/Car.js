/* global Phaser */

export default class Car extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'car');

    scene.add.existing(this);

    this.keys = scene.input.keyboard.addKeys('A,D');

    this.speed = 5;
    this.value = 10;

    this.setScale(0.5);
  }

  move() {
    if (this.keys.A.isDown) {
      this.x -= this.speed;
    }

    if (this.keys.D.isDown) {
      this.x += this.speed;
    }
  }
}
