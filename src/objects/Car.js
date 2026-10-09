/* global Phaser */

export default class Car extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, controls = 'W,A,S,D') {
    //If multiplayer clicked, controls will equal "LEFT, RIGHT". Ref: GameScenes.js ("this.secondCar = new Car(this, this.scale.width / 2 + 120, this.scale.height / 1.25, 'LEFT,RIGHT');")
    super(scene, x, y, 'car');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const [upKey, leftKey, downKey, rightKey] = controls.split(','); //splits the string "A,D" and if player 2 "LEFT, RIGHT" to two seperate strings

    this.leftKey = leftKey;
    this.rightKey = rightKey;
    this.upKey = upKey;
    this.downKey = downKey;
    this.keys = scene.input.keyboard.addKeys(controls);

    this.score = 0;
    this.value = 10;
    this.meters = 0;
    this.boundaryParticles = scene.add
      .particles(x, y, 'boundary-particle', {
        speed: { min: 500, max: 850 },
        angle: () => {
          const isLeftSide = this.x < this.scene.scale.width / 2;
          return Phaser.Math.FloatBetween(isLeftSide ? 90 : 85, isLeftSide ? 95 : 90);
        },
        rotate: () => (this.x < this.scene.scale.width / 2 ? 17 : 0),
        lifespan: 500,
        scale: { start: 0.7, end: 0.3 },
        alpha: { start: 1, end: 0 },
        frequency: 70,
        emitting: false,
        quantity: 5,
      })
      .setDepth(11);
    this.setScale(0.66 * (scene.scale.height / 1200)); //scale fix
    this.body.setSize(this.width, this.height);
    this.setDepth(10); // Set depth to 10 to ensure it is above other objects
  }

  move() {
    this.setVelocityX(0);
    this.setVelocityY(0);
    this.setAngle(0);
    const maxY = this.scene.scale.height + this.displayHeight / 4;
    const maxX = this.displayHeight / 2 - this.displayHeight / 4;
    const roadLeft = this.scene.scale.width / 2 - this.scene.track1.displayWidth / 2;
    const roadRight = this.scene.scale.width / 2 + this.scene.track1.displayWidth / 2;
    this.leftLimit = roadLeft + this.displayWidth / 2 - 27.5;
    this.rightLimit = roadRight - this.displayWidth / 2 + 27.5;

    this.x = Phaser.Math.Clamp(this.x, this.leftLimit, this.rightLimit);
    this.y = Phaser.Math.Clamp(this.y, maxX, maxY);

    if (this.keys[this.leftKey]?.isDown) {
      //der fragezeichen ist dazu da, dass das game nicht abstürzw enn er die keys nicht findet
      this.setVelocityX(-500);
      if (this.x !== this.leftLimit && !this.keys[this.rightKey]?.isDown) {
        this.setAngle(-3);
      }
    }

    if (this.keys[this.rightKey]?.isDown) {
      this.setVelocityX(500);
      if (this.x !== this.rightLimit && !this.keys[this.leftKey]?.isDown) {
        this.setAngle(3);
      }
    }

    if (this.keys[this.upKey]?.isDown) {
      this.setVelocityY(-300);
    }

    if (this.keys[this.downKey]?.isDown) {
      this.setVelocityY(500);
    }

    //constraint the cars downward and upward movement to not go out of bounds

    if (
      (this.x <= this.leftLimit && this.body.velocity.x < 0) ||
      (this.x >= this.rightLimit && this.body.velocity.x > 0)
    ) {
      this.setVelocityX(0);
    }

    if (
      (this.y <= maxX && this.body.velocity.y < 0) ||
      (this.y >= maxY && this.body.velocity.y > 0)
    ) {
      this.setVelocityY(0);
    }
  }

  update_boundary_particles() {
    if (this.x === this.leftLimit) {
      this.boundaryParticles.setPosition(this.x - this.displayWidth / 2 + 15, this.y - 95);
      this.boundaryParticles.emitting = true;
    } else if (this.x === this.rightLimit) {
      this.boundaryParticles.setPosition(this.x + this.displayWidth / 2 - 15, this.y - 95);
      this.boundaryParticles.emitting = true;
    } else {
      this.boundaryParticles.emitting = false;
    }
  }

  startAnim() {
    //hier gegebenenfalls sounds einfügen (z.b motor zündstart etc.)
    //this.scene.time.delayedCall(1250, () => {
    //delayed start um 2500 ms (1.25 sekunden)
    let speed = 60; //auto startet bei 60, bisschen nach hinten um start zu simulieren
    const accelerate = () => {
      //funktion. die den speed variable senkt (negativ = positiv, weil -y ist oben und +y ist unten frag nicht wieso)
      this.setVelocityY(speed);

      if (speed <= -800) {
        //wenn die geschwidnigkeit -800 erreicht wird, bleibt sie konstant
        return;
      }
      //speed variable wird um 30 gesenkt
      speed = speed - 30;
      this.scene.time.delayedCall(50, accelerate);
    };

    accelerate();
    // });
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
