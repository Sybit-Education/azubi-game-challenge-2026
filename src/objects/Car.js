/* global Phaser */

export default class Car extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, controls = 'A,D') {
    //If multiplayer clicked, controls will equal "LEFT, RIGHT". Ref: GameScenes.js ("this.secondCar = new Car(this, this.scale.width / 2 + 120, this.scale.height / 1.25, 'LEFT,RIGHT');")
    super(scene, x, y, 'car');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const [leftKey, rightKey] = controls.split(','); //splits the string "A,D" and if player 2 "LEFT, RIGHT" to two seperate strings

    this.leftKey = leftKey;
    this.rightKey = rightKey;
    this.keys = scene.input.keyboard.addKeys(controls);

    this.score = 0;
    this.value = 10;
    this.meters = 0;
    this.setScale(0.5);
    this.body.setSize(this.displayWidth, this.displayHeight);
    this.setDepth(10); // Set depth to 10 to ensure it is above other objects
  }

  move() {
    this.setVelocityX(0);
    this.setAngle(0);

    if (this.keys[this.leftKey]?.isDown) {
      //der fragezeichen ist dazu da, dass das game nicht abstürzw enn er die keys nicht findet
      this.setVelocityX(-500);
      this.setAngle(-3);
    }

    if (this.keys[this.rightKey]?.isDown) {
      this.setVelocityX(500);
      this.setAngle(3);
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
  update_meters(currentSpeed, delta) {
    this.meters += (currentSpeed * delta) / 30000;
  }

  calculate_km() {
    return (this.meters / 1000).toFixed(2);
  }
}
