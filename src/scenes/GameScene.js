import Phaser from 'phaser';

import Car from '../objects/Car.js';
import EnemyCar from '../objects/EnemyCar.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';
import HUD from '../objects/HUD.js';
import Coin from '../objects/Coin.js';
import Item from '../objects/Item.js';
import Ice from '../objects/Ice.js';
import ItemManager from '../objects/ItemManager.js';
import InputManager from '../objects/InputManager.js';
import RandomObstacle from '../objects/RandomObstacle.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  preload() {
    this.load.image('car', 'assets/images/entities/player-skins/sybit-kart-player-1.png');
    this.load.image('car2', 'assets/images/entities/player-skins/sybit-kart-player-2.png');
    this.load.image('track', 'assets/images/race-track-assets/road.png');
    this.load.image('border', 'assets/images/race-track-assets/border.png');

    this.load.image('enemy-car1', 'assets/images/entities/obstacles/enemy-car-1.png');
    this.load.image('enemy-car2', 'assets/images/entities/obstacles/enemy-car-2.png');
    this.load.image('enemy-car3', 'assets/images/entities/obstacles/enemy-car-3.png');

    this.load.image('coin', 'assets/images/entities/coin.png');
    this.load.image('item', 'assets/images/entities/item.png');
    this.load.image('ice', 'assets/images/entities/obstacles/ice.png');
    this.load.image('random-object1', 'assets/images/entities/obstacles/random-object-1.png');
    this.load.image('random-object2', 'assets/images/entities/obstacles/random-object-2.png');
    this.load.image('random-object3', 'assets/images/entities/obstacles/random-object-3.png');

    this.load.image('boundary-particle', 'assets/images/particles/image-001.png');

    this.load.image('background', 'assets/images/map-skins/background-sybit-city.png');
    this.load.image('background-winter', 'assets/images/map-skins/background-winter-map.png');

    this.load.image('carShield', 'assets/images/entities/player-skins/car-shield.png');
    this.load.image('carShield2', 'assets/images/entities/player-skins/car-shield-2.png');
  }

  //Alle Objekte in der Szene initialisieren
  async create() {
    await document.fonts.load('32px Tiny5');
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    this.secondCar = null;
    this.elapsedTime = 0;
    this.roadObjects = [];
    this.createPlayer();
    this.itemManager = new ItemManager(this);
    this.createTrack();
    this.createWalls();
    this.createRoadObject('enemy-car');
    this.createRoadObject('coin');
    this.createRoadObject('item');
    this.createRoadObject('ice');
    this.createRoadObject('random-obstacle');
    this.createHud();
    this.setBackground(
      this.registry.get('gameMode') === 'christmas' ? 'background-winter' : 'background',
    );
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.separateOverlappingCars, this);
  }

  setBackground(img) {
    const background = this.add.image(0, 0, img).setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
    background.setDepth(-10);
  }

  separateOverlappingCars() {
    if (!this.secondCar || this.car.dead || this.secondCar.dead) return;

    const firstBody = this.car.body;
    const secondBody = this.secondCar.body;

    // Only separate the cars when their physics bodies overlap on both axes
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

    // Split the correction when both cars drove into each other; otherwise move only the car
    // whose input caused the overlap
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
      // Slightly shrink the hitbox so collisions are more forgiving than the visible sprites
      this.car.body.setSize(this.car.width * 0.8, this.car.height * 0.9);

      this.secondCar = new Car(this, this.scale.width / 2 + 90, this.scale.height / 1.25, 'car2');
      this.secondCar.body.setSize(this.secondCar.width * 0.8, this.secondCar.height * 0.9);
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
    this.hud = new HUD(this, this.car, this.secondCar);
  }

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
        this.physics.add.overlap(
          this.car,
          roadObject,
          this.itemManager.addCoinToPlayer1Budget,
          undefined,
          this.itemManager,
        );
        this.physics.add.overlap(this.car, roadObject, this.collectCoin, undefined, this);
        if (this.secondCar) {
          this.physics.add.overlap(
            this.secondCar,
            roadObject,
            this.itemManager.addCoinToPlayer2Budget,
            undefined,
            this.itemManager,
          );
          this.physics.add.overlap(this.secondCar, roadObject, this.collectCoin, undefined, this);
        }
      } else if (type === 'item') {
        roadObject = new Item(this, roadObjectX, spawnY, lane);
        this.physics.add.overlap(
          this.car,
          roadObject,
          this.itemManager.applyRandomItemToPlayer1,
          undefined,
          this.itemManager,
        );
        this.physics.add.overlap(this.car, roadObject, this.collectCoin, undefined, this);

        if (this.secondCar) {
          this.physics.add.overlap(
            this.secondCar,
            roadObject,
            this.itemManager.applyRandomItemToPlayer2,
            undefined,
            this.itemManager,
          );
          this.physics.add.overlap(this.secondCar, roadObject, this.collectCoin, undefined, this);
        }
      } else if (type === 'enemy-car') {
        roadObject = new EnemyCar(this, roadObjectX, spawnY, lane);
        roadObject.body.setSize(roadObject.width, roadObject.height);
        roadObject.body.setImmovable(true);
        this.physics.add.collider(
          this.car,
          roadObject,
          this.itemManager.handlePlayer1Collision,
          undefined,
          this.itemManager,
        );

        if (this.secondCar) {
          this.physics.add.collider(
            this.secondCar,
            roadObject,
            this.itemManager.handlePlayer2Collision,
            undefined,
            this.itemManager,
          );
        }
      } else if (type === 'ice') {
        roadObject = new Ice(this, roadObjectX, spawnY, lane);
        this.physics.add.overlap(
          this.car,
          roadObject,
          this.itemManager.applyIceEffect,
          undefined,
          this.itemManager,
        );
        if (this.secondCar) {
          this.physics.add.overlap(
            this.secondCar,
            roadObject,
            this.ItemManager.iceEffect,
            undefined,
            this.ItemManager,
          );
        }
      } else if (type === 'random-obstacle') {
        roadObject = new RandomObstacle(this, roadObjectX, spawnY, lane);
        roadObject.body.setSize(roadObject.width, roadObject.height);
        roadObject.body.setImmovable(true);
        this.physics.add.collider(
          this.car,
          roadObject,
          this.itemManager.handlePlayer1Collision,
          undefined,
          this.itemManager,
        );
        if (this.secondCar) {
          this.physics.add.collider(
            this.secondCar,
            roadObject,
            this.itemManager.handlePlayer2Collision,
            undefined,
            this.itemManager,
          );
        }
      }
      this.roadObjects.push(roadObject);
    }

    let delay;
    if (type === 'coin') {
      delay = Phaser.Math.Between(500, 2000);
    } else if (type === 'item') {
      delay = Phaser.Math.Between(5000, 10000);
    } else if (type === 'enemy-car') {
      delay = Phaser.Math.Between(2000, 4000);
    } else if (type === 'ice') {
      delay = Phaser.Math.Between(6000, 12000);
    } else if (type === 'random-obstacle') {
      delay = Phaser.Math.Between(1500, 9000);
    }

    this.time.delayedCall(delay, () => this.createRoadObject(type));
  }

  positionFree(lane, spawnY) {
    const minimumDistance = 500;

    return this.roadObjects.every((roadObject) => {
      if (roadObject.lane !== lane) {
        return true;
      }

      const distance = Math.abs(roadObject.y - spawnY);

      return distance >= minimumDistance;
    });
  }

  collectCoin(car, coin) {
    if (!coin.active) return; // Prevent collecting the same coin multiple times

    car.increase_score(coin.value);
    coin.destroy();
  }

  gameOver(car) {
    if (car.dead) return;

    car.dead = true;
    car.boundaryParticles.emitting = false;
    car.disableBody(true, true);

    // In multiplayer, keep the round active until both players have been eliminated
    if (this.secondCar && !(this.car.dead && this.secondCar.dead)) {
      return;
    }
    this.walls.forEach((wall) => wall.destroy());
    this.walls = [];
    this.scene.start('GameoverScene', {
      distance: this.car.calculateKilometers(),
      score: this.car.score,
      distance2: this.secondCar ? this.secondCar.calculateKilometers() : null,
      score2: this.secondCar ? this.secondCar.score : null,
      isMultiplayer: this.isMultiplayer,
    });
  }

  update(_, delta) {
    this.inputManager.update();

    this.elapsedTime += delta;
    if (!this.car.dead) {
      this.car.move(this.inputManager.getControlsP1);
      this.car.updateBoundaryParticles();
      this.car.intendedXVelocity = this.car.body.velocity.x;
    }
    if (this.secondCar && !this.secondCar.dead) {
      this.secondCar.move(this.inputManager.getControlsP2);
      this.secondCar.updateBoundaryParticles();
      this.secondCar.intendedXVelocity = this.secondCar.body.velocity.x;
    }

    this.roadObjects = this.roadObjects.filter((roadObject) => {
      roadObject.move(this.elapsedTime, delta);
      return roadObject.active;
    });

    const targetTrackSpeed = Math.min(1600, 700 + this.elapsedTime * 0.005);
    this.track1.speed = targetTrackSpeed;
    this.track2.speed = targetTrackSpeed;
    // A player who has been eliminated no longer accumulates distance
    if (!this.car.dead) {
      this.car.updateMeters(targetTrackSpeed, delta);
    }
    if (this.secondCar && !this.secondCar.dead) {
      this.secondCar.updateMeters(targetTrackSpeed, delta);
    }

    for (const wall of this.walls) {
      wall.speed = targetTrackSpeed;
      wall.move(delta);
    }

    this.track1.move(delta);
    this.track2.move(delta);
    this.hud.update();

    this.itemManager.updateItemShop();
  }
}
