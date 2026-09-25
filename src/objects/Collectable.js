/* global Phaser */

export default class Collectable extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.GameScene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
  }

  move(delta) {
    this.speed = Math.min(1500, 600 + this.GameScene.car.meters * 0.1);
    console.log(this.speed);
    this.y += (this.speed * delta) / 1000;

    const buffer = 100;
    const bottomLimit = this.GameScene.scale.height + this.displayHeight / 2 + buffer;

    //wenn ende erreicht und auserhalb sichtweite, delete obstacle
    if (this.y >= bottomLimit) {
      this.destroy();
    }
  }
}
