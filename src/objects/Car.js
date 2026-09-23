/* global Phaser */

export default class Car extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'car');

    scene.add.existing(this);

    this.keys = scene.input.keyboard.addKeys('A,D');
    this.score = 100000; //Score = 100000 Als Beispiel (Beim Start des Spiels ist Score = 0)
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

  increase_score(points = 5) {
    return (this.score += points);
  }

  decrease_score(points) {
    return (this.score -= points);
  }
}
