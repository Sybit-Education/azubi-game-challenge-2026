import Phaser from 'phaser';
import { ROAD_LATERAL_SCALE } from './PerspectiveRoad.js';
import { REAR_ASPECT } from './RearVehicleSprites.js';

export default class Car extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y) {
    //If multiplayer clicked, controls will equal "LEFT, RIGHT". Ref: GameScenes.js ("this.secondCar = new Car(this, this.scale.width / 2 + 120, this.scale.height / 1.25, 'LEFT,RIGHT');")
    super(scene, x, y, 'car');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.score = 0;
    this.lean = 0; // -1 steering left, 1 steering right, smoothed in move()
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
        scale: { start: 0.7, end: 0.3 },
        alpha: { start: 1, end: 0 },
        frequency: 70,
        emitting: false,
        quantity: 5,
      })
      .setDepth(11);
    this.setScale(0.66 * (scene.scale.height / 1200)); //scale fix
    this.fitHitbox();
    this.setDepth(10); // Set depth to 10 to ensure it is above other objects
  }

  // Hitbox follows the drawn rear-view footprint. Lanes render ROAD_LATERAL_SCALE wider, so x is narrowed to match.
  fitHitbox() {
    const drawnHeight = this.width * REAR_ASPECT;
    this.body.setSize((this.width * 0.8) / ROAD_LATERAL_SCALE, drawnHeight * 0.9);
    // The drawn car sits on its ground contact, below the physics centre.
    this.body.offset.y += (this.height - drawnHeight) / 2;
  }

  // -1 at the left road edge, 0 at the centre, 1 at the right road edge.
  get lanePosition() {
    const halfRange = (this.rightLimit - this.leftLimit) / 2;
    if (!halfRange) return 0;
    const centre = (this.rightLimit + this.leftLimit) / 2;
    return Phaser.Math.Clamp((this.x - centre) / halfRange, -1, 1);
  }

  move(controls) {
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

    if (controls.left) {
      //der fragezeichen ist dazu da, dass das game nicht abstürzw enn er die keys nicht findet
      this.setVelocityX(-500);
      if (this.x !== this.leftLimit && !controls.right) {
        this.setAngle(-3);
      }
    }

    if (controls.right) {
      this.setVelocityX(500);
      if (this.x !== this.rightLimit && !controls.left) {
        this.setAngle(3);
      }
    }

    if (controls.accelerate) {
      this.setVelocityY(-300);
    }

    if (controls.brake) {
      this.setVelocityY(500);
    }

    const steer = Number(controls.right) - Number(controls.left);
    this.lean = Phaser.Math.Linear(this.lean, steer, 0.15);

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
