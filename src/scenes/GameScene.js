/* global Phaser */

import Car from '../objects/Car.js';
import EnemyCar from '../objects/EnemyCar.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';
import HUD from '../objects/HUD.js';
import Coin from '../objects/Coin.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  //Bilder laden
  preload() {
    this.load.image('car', 'sprites/Entities/Player Skins/SybitKartPlayer1.png');
    this.load.image('track', 'sprites/Race Track Assets/road.png');
    this.load.image('border', 'sprites/Race Track Assets/border.png');

    this.load.image('enemy-car1', 'sprites/Entities/Obstacles/EnemyCar1.png');
    this.load.image('enemy-car2', 'sprites/Entities/Obstacles/EnemyCar2.png');
    this.load.image('enemy-car3', 'sprites/Entities/Obstacles/EnemyCar3.png');

    this.load.image('coin', 'sprites/Entities/coin.png');
    this.load.image('boundary-particle', 'sprites/Particles/image001.png');

    this.load.image('background', 'sprites/Map Skins/Background Sybit-City.png');
  }

  //Alle Objekte in der Szene initialisieren
  create() {
    this.secondCar = null;
    this.elapsedTime = 0;
    this.roadObjects = [];
    this.createPlayer();
    this.createTrack();
    this.createWalls();
    this.createRoadObject('obstacle');
    this.createRoadObject('coin');
    this.createHud();
    this.setBackground('background');
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.separateOverlappingCars, this);
  }

  setBackground(img) {
    const background = this.add.image(0, 0, img).setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
    background.setDepth(-10); // Set depth to -10 to ensure it is behind other objects
  }

  //funktion die checkt, ob die autos ineinander gebugged sind (passiert oft bei dieser vercrackten phaser physik)
  separateOverlappingCars() {
    if (!this.secondCar) return;

    const firstBody = this.car.body;
    const secondBody = this.secondCar.body;

    //sehr viel mathe ig checke selber nicht aber es klappt halbwegs
    const overlapX =
      Math.min(firstBody.right, secondBody.right) - Math.max(firstBody.left, secondBody.left);
    const overlapY =
      Math.min(firstBody.bottom, secondBody.bottom) - Math.max(firstBody.top, secondBody.top);

    if (overlapX <= 0 || overlapY <= 0) return;

    const firstIsLeft = firstBody.center.x < secondBody.center.x;
    const firstMovesIntoSecond = firstIsLeft
      ? this.car.intendedXVelocity > 0
      : this.car.intendedXVelocity < 0;
    const secondMovesIntoFirst = firstIsLeft
      ? this.secondCar.intendedXVelocity < 0
      : this.secondCar.intendedXVelocity > 0;

    if (firstMovesIntoSecond && secondMovesIntoFirst) {
      this.car.x += firstIsLeft ? -overlapX / 2 : overlapX / 2;
      this.secondCar.x += firstIsLeft ? overlapX / 2 : -overlapX / 2;
      this.car.body.updateFromGameObject();
      this.secondCar.body.updateFromGameObject();
    } else {
      const carToMove = firstMovesIntoSecond
        ? this.car
        : secondMovesIntoFirst
          ? this.secondCar
          : null;

      if (!carToMove) return;

      const direction = carToMove === this.car ? (firstIsLeft ? -1 : 1) : firstIsLeft ? 1 : -1;

      carToMove.x += direction * (overlapX + 1);
      carToMove.body.updateFromGameObject();
    }
  }

  createPlayer() {
    if (this.isMultiplayer) {
      this.car = new Car(this, this.scale.width / 2 - 90, this.scale.height / 1.25);
      this.car.body.setSize(this.car.width * 0.8, this.car.height * 0.9); //scale fix (hitbox slightly smaller to be more forgiving, else, game too hard)

      this.secondCar = new Car(
        this,
        this.scale.width / 2 + 90,
        this.scale.height / 1.25,
        'UP,LEFT,DOWN,RIGHT',
      );
      this.secondCar.body.setSize(this.secondCar.width * 0.8, this.secondCar.height * 0.9); //scale fix
      this.physics.add.collider(this.car, this.secondCar);
    } else {
      this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
      this.car.body.setSize(this.car.width * 0.8, this.car.height * 0.9); //scale fix
    }
  }

  createTrack() {
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);
  }

  createWalls() {
    const screenCenterX = this.scale.width / 2;
    const roadHalfWidth = this.track1.displayWidth / 2;

    const wall1 = new Border(this, 0, 0);
    const wall2 = new Border(this, 0, 0);
    const wall3 = new Border(this, 0, -this.scale.height);
    const wall4 = new Border(this, 0, -this.scale.height);
    const wallHalfWidth = wall1.displayWidth / 2;

    wall1.x = screenCenterX - roadHalfWidth - wallHalfWidth;
    wall2.x = screenCenterX + roadHalfWidth + wallHalfWidth;
    wall3.x = screenCenterX - roadHalfWidth - wallHalfWidth;
    wall4.x = screenCenterX + roadHalfWidth + wallHalfWidth;

    wall2.setFlipX(true);
    wall4.setFlipX(true);

    this.walls = [wall1, wall2, wall3, wall4];
  }

  createHud() {
    this.hud = new HUD(this, this.car);
  }

  // road objects are obstacles and coins
  createRoadObject(type) {
    const laneCount = 4;
    const laneWidth = this.track1.displayWidth / laneCount;
    const roadLeftEdge = this.scale.width / 2 - this.track1.displayWidth / 2;
    const lane = Phaser.Math.Between(0, laneCount - 1);
    const roadObjectX = roadLeftEdge + lane * laneWidth + laneWidth / 2;
    const spawnY = -200;

    if (this.positionFree(lane, spawnY)) {
      let roadObject;

      if (type === 'coin') {
        roadObject = new Coin(this, roadObjectX, spawnY, lane);
        roadObject.body.setOffset(0, 5);
        this.physics.add.overlap(this.car, roadObject, this.collectCoin, undefined, this);
        if (this.secondCar) {
          this.physics.add.overlap(this.secondCar, roadObject, this.collectCoin, undefined, this);
        }
      } else {
        roadObject = new EnemyCar(this, roadObjectX, spawnY, lane);
        roadObject.body.setSize(roadObject.width, roadObject.height); //scal- you know the drill
        this.physics.add.collider(this.car, roadObject, this.gameOver, undefined, this);
        if (this.secondCar) {
          this.physics.add.collider(this.secondCar, roadObject, this.gameOver, undefined, this);
        }
      }

      this.roadObjects.push(roadObject);
    }

    const delay = Phaser.Math.Between(500, 2000);
    this.time.delayedCall(delay, () => this.createRoadObject(type));
  }

  // Checks if the lane is free for spawning a new road object
  positionFree(lane, spawnY) {
    const minimumDistance = 500; // Minimum distance between road objects

    return this.roadObjects.every((roadObject) => {
      if (roadObject.lane !== lane) {
        return true;
      }

      const distance = Math.abs(roadObject.y - spawnY);

      return distance >= minimumDistance;
    });
  }

  collectCoin(car, coin) {
    coin.destroy();
    car.increase_score(coin.value);
  }

  // Handle game over when the player collides with an enemy car
  gameOver() {
    this.scene.start('GameoverScene', {
      distance: this.car.calculate_km(),
      score: this.car.score,
      isMultiplayer: this.isMultiplayer,
    }); // Change to DeathScene once there is one
  }

  // Update the game state every frame
  update(_, delta) {
    this.elapsedTime += delta;
    this.car.move();
    this.car.update_boundary_particles();
    this.car.intendedXVelocity = this.car.body.velocity.x;
    if (this.secondCar) {
      this.secondCar.move();
      this.secondCar.update_boundary_particles();
      this.secondCar.intendedXVelocity = this.secondCar.body.velocity.x;
    }

    this.roadObjects = this.roadObjects.filter((roadObject) => {
      roadObject.move(this.elapsedTime, delta);
      return roadObject.active;
    });

    const targetTrackSpeed = Math.min(1500, 600 + this.elapsedTime * 0.005);
    this.track1.speed = targetTrackSpeed;
    this.track2.speed = targetTrackSpeed;
    this.car.update_meters(targetTrackSpeed, delta);
    if (this.secondCar) {
      this.secondCar.update_meters(targetTrackSpeed, delta);
    }

    for (const wall of this.walls) {
      wall.speed = targetTrackSpeed;
      wall.move(delta);
    }

    this.track1.move(delta);
    this.track2.move(delta);
    this.hud.update();
  }
}
