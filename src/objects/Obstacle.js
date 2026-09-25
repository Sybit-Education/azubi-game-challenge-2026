/* global Phaser */
export default class Obstacle extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.gameScene = scene;
    scene.add.existing(this);
    this.setScale(0.5);
    this.setOrigin(0.5, 0.5);
  }
  //obstacle bewegt sich nach unten, ändere den speed variable, um die geschwindigkeit anzupassen (z.b je höher der km stand, desto schneller)
  move(delta) {
    this.speed = Math.min(1500, 300 + this.gameScene.car.meters * 0.1);
    console.log(this.speed);
    this.y += (this.speed * delta) / 1000;

    const buffer = 100;
    const bottomLimit = this.gameScene.scale.height + this.displayHeight / 2 + buffer;

    //wenn ende erreicht und auserhalb sichtweite, delete obstacle
    if (this.y >= bottomLimit) {
      this.destroy();
    }
  }
}
