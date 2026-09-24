/* global Phaser */
export default class Obstacle extends Phaser.GameObjects.Image {
  constructor(scene, x, y, laneWidth) {
    let obstacleImage;

    //nimmt eine random zahl
    const randomInt = Math.floor(Math.random() * 3) + 1;

    //die random zahl entscheided welche sprite geladen wird
    //PLACEHOLDER ÄNDERN FÜR ANDERE SPRITES
    if (randomInt == 1) {
      obstacleImage = 'placeholder1';
    } else if (randomInt == 2) {
      obstacleImage = 'placeholder2';
    } else {
      obstacleImage = 'placeholder3';
    }
    //super ist hier und kann hier bleiben (wenn es funktioniert, lieber nicht anfassen lol :))
    //(sonst laden die bilder nicht bzw obstacleImage wird kein bild zugewiesen)
    super(scene, x, y, obstacleImage);

    this.gameScene = scene;
    //objekt wird erstellt
    scene.add.existing(this);
    const targetWidth = laneWidth * 0.75;
    const aspectRatio = this.height / this.width;

    this.setDisplaySize(targetWidth, targetWidth * aspectRatio);
  }
  //obstacle bewegt sich nach unten, ändere den speed variable, um die geschwindigkeit anzupassen (z.b je höher der km stand, desto schneller)
  move(delta) {
    this.speed = Math.min(1500, 600 + this.gameScene.car.meters * 0.1);
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
