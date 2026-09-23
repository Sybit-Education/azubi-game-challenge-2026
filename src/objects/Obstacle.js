/* global Phaser */
export default class Obstacle extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    let obstacleImage;

    //nimmt eine random zahl
    let randomInt = Math.round(Math.random() * 3);
    console.log(randomInt);

    //die random zahl entscheided welche sprite geladen wird
    if (randomInt == 1) {
      obstacleImage = 'placeholder1';
    } else if (randomInt == 2) {
      obstacleImage = 'placeholder2';
    } else {
      obstacleImage = 'placeholder3';
    }

    super(scene, x, y, obstacleImage);

    //objekt wird erstellt
    scene.add.existing(this);

    this.speed = 200;
    this.setScale(0.2);
  }

  move(delta) {
    this.y += (this.speed * delta) / 1000;
  }
}
