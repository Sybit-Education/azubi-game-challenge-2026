/* global Phaser */

export default class Car extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'car');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.keys = scene.input.keyboard.addKeys('A,D');
    this.score = 1000000; //Score = 100000 Als Beispiel (Beim Start des Spiels ist Score = 0)dd
    this.value = 10;
    this.meters = 0;
    this.setScale(0.5);
    this.body.setSize(this.displayWidth, this.displayHeight);
  }

  move() {
    this.setVelocityX(0);
    if (this.keys.A.isDown) {
      this.setVelocityX(-300);
    }
    if (this.keys.D.isDown) {
      this.setVelocityX(300);
    }
  }

  increase_score(points) {
    return (this.score += points);
  }

  decrease_score(points) {
    return (this.score -= points);
  }

  //stop can be used for collisions
  stop() {
    this.speed = 0;
  }

  //increase meters by 1 every frame if car hasnt crashed or stopped
  update_meters() {
    if (this.body.velocity.x !== 0) {
      this.meters += 1;
      this.calculate_km();
    }
  }

  calculate_km() {
    return (this.meters / 1000).toFixed(2);
  }
}
