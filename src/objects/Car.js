import Phaser from 'phaser';

// Texture keys for the blinkers and brake lights, per car skin.
const LIGHT_TEXTURES = {
  car: { left: 'blinkLeft', right: 'blinkRight', brake: 'brakeLights' },
  car2: { left: 'blinkLeft2', right: 'blinkRight2', brake: 'brakeLights2' },
  'winter-car': { left: 'winterBlinkLeft', right: 'winterBlinkRight', brake: 'winterBrakeLights' },
  'winter-car2': {
    left: 'winterBlinkLeft2',
    right: 'winterBlinkRight2',
    brake: 'winterBrakeLights2',
  },
};

const CAR_TEXTURES = {
  car: { base: 'car', christmas: 'winter-car' },
  car2: { base: 'car2', christmas: 'winter-car2' },
};

export default class Car extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, texture, startinglane = 1) {
    const carType = texture;
    const isChristmas = scene.registry.get('gameMode') === 'christmas';
    console.log('carType: ', carType);
    console.log('CAR_TEXTURES entry:', CAR_TEXTURES[carType]);

    if (isChristmas) {
      texture = CAR_TEXTURES[carType].christmas;
    } else {
      texture = CAR_TEXTURES[carType].base;
    }

    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.score = 0;
    this.dead = false; //in multiplayer one car can be dead while the other keeps driving
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
        // shrinks from 0.7 to 0.3 like before, but also follows the car's size
        scale: {
          onEmit: () => 0.08 * this.getSizeFactor(),
          onUpdate: (_particle, _key, lifeProgress) => {
            const particleScale = Phaser.Math.Linear(0.08, 0.05, lifeProgress);
            return particleScale * this.getSizeFactor();
          },
        },
        alpha: { start: 1, end: 0 },
        frequency: 70,
        emitting: false,
        quantity: 5,
      })
      .setDepth(11);
    this.setScale(0.66 * (scene.scale.height / 1200)); //scale fix
    this.normalScale = this.scale; // used to size the boundary particles when the car grows/shrinks
    this.body.setSize(this.width, this.height);
    this.setDepth(10); // Set depth to 10 to ensure it is above other objects
    this.coinMultiplier = 1;
    this.iceTriggered = false;
    this.oilTriggered = false;
    this.currentLane = startinglane;
    this.laneCooldown = 0;
    this.inputLocked = false;
    this.touchingWall = null; // 'left' / 'right' while stuck at the wall after bumpWall
    this.baseTexture = texture;
    this.lights = LIGHT_TEXTURES[texture]; // undefined for skins without light sprites
  }

  // Swap to a light texture, but never over the shield texture.
  setLight(name) {
    if (!this.active) return;
    if (!this.lights) return;

    const key = this.texture.key;
    if (key !== this.baseTexture && !Object.values(this.lights).includes(key)) return;

    this.setTexture(this.lights[name]);
  }

  clearLight(name) {
    if (!this.active) return;
    if (this.lights && this.texture.key === this.lights[name]) {
      this.setTexture(this.baseTexture);
    }
  }

  move(controls) {
    if (this.inputLocked) {
      return;
    }
    this.setVelocityX(0);
    this.setVelocityY(0);
    const maxY = this.scene.scale.height + this.displayHeight / 4;
    const maxX = this.displayHeight / 2 - this.displayHeight / 4;
    const roadLeft = this.scene.scale.width / 2 - this.scene.track1.displayWidth / 2;
    const roadRight = this.scene.scale.width / 2 + this.scene.track1.displayWidth / 2;
    const roadWidth = roadRight - roadLeft;
    this.leftLimit = roadLeft + this.displayWidth / 2 - 27.5;
    this.rightLimit = roadRight - this.displayWidth / 2 + 27.5;

    this.x = Phaser.Math.Clamp(this.x, this.leftLimit, this.rightLimit);
    this.y = Phaser.Math.Clamp(this.y, maxX, maxY);

    this.lanes = [
      roadLeft + roadWidth * 0.125,
      roadLeft + roadWidth * 0.375,
      roadLeft + roadWidth * 0.625,
      roadLeft + roadWidth * 0.875,
    ];

    if (this.laneCooldown > 0) {
      this.laneCooldown--;
    }
    if (controls.left) {
      if (controls.left && this.laneCooldown <= 0 && this.currentLane > 0) {
        this.currentLane--;

        this.setLight('left');
        this.scene.time.delayedCall(300, () => this.clearLight('left'));

        this.setAngle(-4);

        this.scene.tweens.add({
          targets: this,
          x: this.lanes[this.currentLane],
          duration: 300,
          ease: 'Sine.easeOut',
        });

        this.scene.tweens.add({
          targets: this,
          angle: 0,
          duration: 150,
          delay: 100,
          ease: 'Sine.easeInOut',
        });
        this.laneCooldown = 20;
      } else if (this.laneCooldown <= 0 && this.currentLane === 0) {
        this.bumpWall('left');
      }
    }

    if (controls.right) {
      if (controls.right && this.laneCooldown <= 0 && this.currentLane < this.lanes.length - 1) {
        this.currentLane++;

        this.setLight('right');
        this.scene.time.delayedCall(300, () => this.clearLight('right'));

        this.setAngle(4);

        this.scene.tweens.add({
          targets: this,
          x: this.lanes[this.currentLane],
          duration: 300,
          ease: 'Sine.easeOut',
        });

        this.scene.tweens.add({
          targets: this,
          angle: 0,
          duration: 150,
          delay: 100,
          ease: 'Sine.easeInOut',
        });
        this.laneCooldown = 20;
      } else if (this.laneCooldown <= 0 && this.currentLane === this.lanes.length - 1) {
        this.bumpWall('right');
      }
    }

    if (controls.accelerate) {
      this.setVelocityY(-300);
    }

    if (controls.brake) {
      this.setVelocityY(500);
      // Don't override a running blinker.
      if (this.texture.key === this.baseTexture) this.setLight('brake');
    } else {
      this.clearLight('brake');
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

  // crash into the wall on the outer lanes, then go back to the same lane
  // uses the same tween values as a lane switch
  bumpWall(side) {
    const wallX = side === 'left' ? this.leftLimit : this.rightLimit;
    const dir = side === 'left' ? -1 : 1;
    const laneX = this.lanes[this.currentLane];
    const stuckTime = 400; // how long the car stays at the wall as punishment

    // stop a lane switch that is still running (e.g. hitting ice mid lane switch),
    // otherwise both tweens fight over x. Only x/angle, so shield blinking etc. keeps running
    for (const tween of this.scene.tweens.getTweensOf(this)) {
      if (tween.data?.some((data) => data.key === 'x' || data.key === 'angle')) {
        tween.stop();
      }
    }

    // drive into the wall
    this.setAngle(4 * dir);

    this.scene.tweens.add({
      targets: this,
      x: wallX,
      duration: 150,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // car touches the wall here, sparks run until it leaves
        this.touchingWall = side;

        this.scene.time.delayedCall(stuckTime, () => {
          this.touchingWall = null;

          // drive back to the lane
          this.setAngle(-4 * dir);

          this.scene.tweens.add({
            targets: this,
            x: laneX,
            duration: 150,
            ease: 'Sine.easeOut',
            // free the controls as soon as the car is back in its lane
            onComplete: () => (this.laneCooldown = 0),
          });

          this.scene.tweens.add({
            targets: this,
            angle: 0,
            duration: 150,
            delay: 100,
            ease: 'Sine.easeInOut',
          });
        });
      },
    });

    this.scene.tweens.add({
      targets: this,
      angle: 0,
      duration: 150,
      delay: 100,
      ease: 'Sine.easeInOut',
    });

    // no lane changes while the car is on the wall
    this.laneCooldown = Infinity;
  }

  // 1 normally, 0.5 when shrunk, 1.5 when grown
  getSizeFactor() {
    return this.scale / this.normalScale;
  }

  update_boundary_particles() {
    const size = this.getSizeFactor();

    // touchingWall is set by bumpWall, because the tween can end a tiny bit off the exact limit
    if (this.x === this.leftLimit || this.touchingWall === 'left') {
      this.boundaryParticles.setPosition(
        this.x - this.displayWidth / 2 + 15 * size,
        this.y - 95 * size,
      );
      this.boundaryParticles.emitting = true;
    } else if (this.x === this.rightLimit || this.touchingWall === 'right') {
      this.boundaryParticles.setPosition(
        this.x + this.displayWidth / 2 - 15 * size,
        this.y - 95 * size,
      );
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
      this.setVelocityY(speed * (this.scene.scale.height / 1200)); // speeds are tuned for 1200px height

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
