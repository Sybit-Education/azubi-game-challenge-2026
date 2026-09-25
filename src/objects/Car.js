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
    this.setAngle(0); //reset car angle when not moving
    //car move left
    if (this.keys.A.isDown) {
      this.setVelocityX(-500);
      this.setAngle(-3); //angled to the left
    }
    //car move right
    if (this.keys.D.isDown) {
      this.setVelocityX(500);
      this.setAngle(3); //angled to the right
    }
  }

  startAnim() {
    //hier gegebenenfalls sounds einfügen (z.b motor zündstart etc.)

    this.scene.time.delayedCall(2500, () => {
      //delayed start um 2500 ms (2.5 sekunden)
      let speed = 0; //auto startet bei 0

      const accelerate = () => {
        //funktion. die den speed variable senkt (negativ = positiv, weil -y ist oben und +y ist unten frag nicht wieso)
        this.setVelocityY(speed);

        if (speed <= -500) {
          //wenn die geschwidnigkeit -500 erreicht wird, bleibt sie konstant
          return;
        }
        //speed variable wird um 25 gesenkt
        speed = speed - 25;
        this.scene.time.delayedCall(50, accelerate);
      };

      accelerate();
    });
  }

  increase_score(points) {
    return (this.score += points);
  }

  decrease_score(points) {
    return (this.score -= points);
  }

  //stop can be used for collisions
  stop() {
    this.setVelocityX(0);
  }

  //increase meters while the game is running
  update_meters() {
    this.meters += 1;
  }

  calculate_km() {
    return (this.meters / 1000).toFixed(2);
  }
}
