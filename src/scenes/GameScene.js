import Phaser from 'phaser';

import Car from '../objects/Car.js';
import EnemyCar from '../objects/EnemyCar.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';
import HUD from '../objects/HUD.js';
import Coin from '../objects/Coin.js';
import CoinMultiplier from '../objects/CoinMultiplier.js';
import { preloadGameplaySounds } from '../../audio/sounds.js';
import CarSensor, { nearestCar } from '../../audio/CarSensor.js';
import CarPassBy from '../../audio/CarPassBy.js';
import Item from '../objects/Item.js';
import Ice from '../objects/Ice.js';
import ExtraLife from '../objects/ExtraLife.js';
import ItemManager from '../objects/ItemManager.js';
import InputManager from '../objects/InputManager.js';
import RandomObstacle from '../objects/RandomObstacle.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
    this.isChristmas = data?.isChristmas ?? false;
  }

  //Load images.
  preload() {
    preloadGameplaySounds(this);
    this.load.image('car', 'assets/images/entities/player-skins/sybit-kart-player-1.png');
    this.load.image('car2', 'assets/images/entities/player-skins/sybit-kart-player-2.png');
    this.load.image('winter-car', 'assets/images/entities/player-skins/winter-car-P1.png');
    this.load.image('winter-car2', 'assets/images/entities/player-skins/winter-car-P2.png');

    this.load.image('track', 'assets/images/race-track-assets/road.png');
    this.load.image('border', 'assets/images/race-track-assets/border.png');

    this.load.image('enemy-car1', 'assets/images/entities/obstacles/enemy-car-1.png');
    this.load.image('enemy-car2', 'assets/images/entities/obstacles/enemy-car-2.png');
    this.load.image('enemy-car3', 'assets/images/entities/obstacles/enemy-car-3.png');

    this.load.image('coin', 'assets/images/entities/coin.png');
    this.load.image('coinMultiplier', 'assets/images/entities/coin-multiplier.png');
    this.load.image('item', 'assets/images/entities/mystery-box.png');
    this.load.image('ice', 'assets/images/entities/obstacles/ice.png');
    this.load.image('extraLife', 'assets/images/entities/extra-life.png');
    this.load.image('random-object1', 'assets/images/entities/obstacles/random-object-1.png');
    this.load.image('random-object2', 'assets/images/entities/obstacles/random-object-2.png');
    this.load.image('random-object3', 'assets/images/entities/obstacles/random-object-3.png');

    this.load.image('boundary-particle', 'assets/images/particles/image-001.png');

    this.load.image('background', 'assets/images/map-skins/background-sybit-city.png');
    this.load.image('background-winter', 'assets/images/map-skins/background-winter-map.png');

    this.load.image('carShield', 'assets/images/entities/player-skins/car-shield.png');
    this.load.image('carShield2', 'assets/images/entities/player-skins/car-shield-2.png');
  }

  // BootScene loads the font; initialize synchronously before Phaser starts update().
  create() {
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    this.secondCar = null;

    this.elapsedTime = 0;
    this.roadObjects = [];
    this.currentLaneDanger = null;
    this.createPlayer();
    this.ItemManager = new ItemManager(this);
    this.createTrack();
    this.createWalls();
    this.roadEdgeScrape = this.sound.add('road-edge-scrape', {
      volume: 0.2,
      loop: true,
    });
    this.iceWarning = this.sound.add('ice-warning', { volume: 0.3 });
    this.warnedIce = new WeakMap();

    // Each player car gets its own proximity sensor.
    this.carSensors = [new CarSensor(this, this.car)];
    if (this.secondCar) this.carSensors.push(new CarSensor(this, this.secondCar, 300));
    this.carPassBy = new CarPassBy(this, [this.car, this.secondCar].filter(Boolean));
    this.createRoadObject('enemy-car');
    this.createRoadObject('coin');
    this.createRoadObject('coinMultiplier');
    this.createRoadObject('item');
    this.createRoadObject('ice');
    this.createRoadObject('extraLife');
    this.createRoadObject('random-obstacle');
    this.createHud();
    this.setBackground(
      this.registry.get('gameMode') === 'christmas' ? 'background-winter' : 'background',
    );
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.separateOverlappingCars, this);

    const canvas = this.game.canvas;
    const accessibilityEnabled = this.registry.get('accessibility enabled') ?? false;
    canvas.setAttribute('tabindex', '0');

    if (accessibilityEnabled) {
      canvas.setAttribute('role', 'application');
    }
    canvas.focus();

    this.events.once('shutdown', () => {
      canvas.removeAttribute('role');
      canvas.removeAttribute('aria-label');
      canvas.removeAttribute('tabindex');
      this.roadEdgeScrape.destroy();
      this.iceWarning.destroy();
    });
  }

  setBackground(img) {
    const background = this.add.image(0, 0, img).setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
    background.setDepth(-10); // Set depth to -10 to ensure it is behind other objects
  }

  //Separate overlapping player cars after the physics update.
  separateOverlappingCars() {
    if (!this.secondCar || this.car.dead || this.secondCar.dead) return;

    const firstBody = this.car.body;
    const secondBody = this.secondCar.body;

    //Calculate the overlap and identify which car is moving into the other.
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

      this.secondCar = new Car(this, this.scale.width / 2 + 90, this.scale.height / 1.25, 'car2');
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
    this.lastPlayerLane = this.getPlayerLane(this.car);
    this.gameStatus = document.getElementById('game-status');
    this.gameStatus.textContent = '';
    this.lastPlayerRoadEdge = null;
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
        this.physics.add.overlap(
          this.car,
          roadObject,
          () => {
            this.ItemManager.coinBudgetPlus1(this.car.coinMultiplier);
          },
          undefined,
          this,
        );
        this.physics.add.overlap(this.car, roadObject, this.collectCoin, undefined, this);

        if (this.secondCar) {
          this.physics.add.overlap(
            this.secondCar,
            roadObject,
            () => {
              this.ItemManager.coinBudgetPlus2(this.secondCar.coinMultiplier);
            },
            undefined,
            this,
          );
          this.physics.add.overlap(this.secondCar, roadObject, this.collectCoin, undefined, this);
        }
      } else if (type === 'coinMultiplier') {
        roadObject = new CoinMultiplier(this, roadObjectX, spawnY, lane);

        this.physics.add.overlap(
          this.car,
          roadObject,
          this.ItemManager.multiplyCoins1,
          undefined,
          this.ItemManager,
        );

        if (this.secondCar) {
          this.physics.add.overlap(
            this.secondCar,
            roadObject,
            this.ItemManager.multiplyCoins2,
            undefined,
            this.ItemManager,
          );
        }
      } else if (type === 'item') {
        roadObject = new Item(this, roadObjectX, spawnY, lane);
        roadObject.setScale(0.1);
        this.physics.add.overlap(this.car, roadObject, this.collectItem, undefined, this);
        if (this.secondCar) {
          this.physics.add.overlap(this.secondCar, roadObject, this.collectItem, undefined, this);
        }
      } else if (type === 'extraLife') {
        roadObject = new ExtraLife(this, roadObjectX, spawnY, lane);
        roadObject.setTexture('extraLife');
        roadObject.setScale(0.08);
        this.physics.add.overlap(this.car, roadObject, this.collectExtraLife, undefined, this);

        if (this.secondCar) {
          this.physics.add.overlap(
            this.secondCar,
            roadObject,
            this.collectExtraLife,
            undefined,
            this,
          );
        }
      } else if (type === 'enemy-car') {
        roadObject = new EnemyCar(this, roadObjectX, spawnY, lane);
        roadObject.body.setSize(roadObject.width, roadObject.height); //scal- you know the drill
        roadObject.body.setImmovable(true);
        this.physics.add.collider(
          this.car,
          roadObject,
          this.ItemManager.lebenCheckCar1,
          undefined,
          this.ItemManager,
        );

        //this.physics.add.collider(this.car, roadObject, this.gameOver, undefined, this);
        if (this.secondCar) {
          this.physics.add.collider(
            this.secondCar,
            roadObject,
            this.ItemManager.lebenCheckCar2,
            undefined,
            this.ItemManager,
          );
        }
      } else if (type === 'ice') {
        roadObject = new Ice(this, roadObjectX, spawnY, lane);
        this.physics.add.overlap(
          this.car,
          roadObject,
          this.ItemManager.iceEffect,
          undefined,
          this.ItemManager,
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
          this.ItemManager.lebenCheckCar1,
          undefined,
          this.ItemManager,
        );
        if (this.secondCar) {
          this.physics.add.collider(
            this.secondCar,
            roadObject,
            this.ItemManager.lebenCheckCar2,
            undefined,
            this.ItemManager,
          );
        }
      }
      this.roadObjects.push(roadObject);
    }

    // Spawn intervals.
    let delay;
    if (type === 'coin') {
      delay = Phaser.Math.Between(500, 2000);
    } else if (type === 'item') {
      delay = Phaser.Math.Between(5000, 10000);
    } else if (type === 'enemy-car') {
      delay = Phaser.Math.Between(2000, 4000);
    } else if (type === 'ice') {
      delay = Phaser.Math.Between(6000, 12000);
    } else if (type === 'coinMultiplier') {
      delay = Phaser.Math.Between(10000, 20000);
    } else if (type === 'extraLife') {
      delay = Phaser.Math.Between(15000, 30000);
    } else if (type === 'random-obstacle') {
      delay = Phaser.Math.Between(1500, 9000);
    }

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
    if (!coin.active) return;

    const value = coin.value * car.coinMultiplier;
    this.sound.play('collect-coin', { volume: 0.3 });
    coin.destroy();
    car.increase_score(value);
  }

  collectExtraLife(car, item) {
    if (!item.active) return;

    item.destroy();
    this.sound.play('collect-extra-life', { volume: 0.3 });
    if (car === this.car) {
      this.ItemManager.itemExtraLifeCar1();
    } else if (car === this.secondCar) {
      this.ItemManager.itemExtraLifeCar2();
    }
  }

  collectItem(car, item) {
    if (!item.active) return;

    item.destroy();
    if (car === this.car) {
      this.ItemManager.itemRandom1();
    } else if (car === this.secondCar) {
      this.ItemManager.itemRandom2();
    }
  }

  // Handle game over when the player collides with an enemy car
  gameOver(car) {
    if (car.dead) return; //already dead, do not run again

    //only the car that got hit dies
    car.dead = true;
    this.sound.play('collision-hit', { volume: 0.3 });
    this.sound.play('collision-bang', { volume: 0.3 });
    this.sound.play('collision-impact', { volume: 0.3 });
    car.boundaryParticles.emitting = false;
    car.disableBody(true, true); //hides the dead car

    //in multiplayer only game over when both are dead
    if (this.secondCar && !(this.car.dead && this.secondCar.dead)) {
      return;
    }
    this.walls.forEach((wall) => wall.destroy());
    this.walls = [];
    this.scene.start('GameoverScene', {
      distance: this.car.calculate_km(),
      score: this.car.score,
      distance2: this.secondCar ? this.secondCar.calculate_km() : null,
      score2: this.secondCar ? this.secondCar.score : null,
      isMultiplayer: this.isMultiplayer,
    }); // Change to DeathScene once there is one
  }

  getCarsForAudio() {
    // Coins, items and ice patches do not trigger car sounds.
    return [
      ...this.roadObjects.filter((object) => object instanceof EnemyCar),
      this.car,
      this.secondCar,
    ];
  }

  getNearestCarDistance(player) {
    return nearestCar(player, this.getCarsForAudio())?.distance ?? Infinity;
  }

  //a function to get carlocation
  getPlayerLane(car) {
    const laneCount = 4;
    const roadWidth = this.track1.displayWidth;
    const roadLeft = this.track1.x - roadWidth / 2;
    const laneWidth = roadWidth / laneCount;

    const positionOnRoad = car.x - roadLeft;
    const laneIndex = Math.floor(positionOnRoad / laneWidth);

    return Phaser.Math.Clamp(laneIndex, 0, laneCount - 1);
  }
  getObstaclesInLane(lane) {
    return this.roadObjects.filter((object) => {
      const isObstacle = object instanceof EnemyCar || object instanceof RandomObstacle;

      return object.active && isObstacle && object.lane === lane;
    });
  }

  getObstaclesAhead(car, lane) {
    const obstacles = this.getObstaclesInLane(lane);

    return obstacles.filter((obstacle) => {
      return obstacle.body.bottom <= car.body.top;
    });
  }

  getNearestObstacleAhead(car, lane) {
    const obstacles = this.getObstaclesAhead(car, lane);
    let nearest = null;

    for (const obstacle of obstacles) {
      const distance = car.body.top - obstacle.body.bottom;

      if (nearest === null || distance < nearest.distance) {
        nearest = {
          obstacle,
          distance,
        };
      }
    }

    return nearest;
  }

  getTimeUntilObstacle(car, obstacle) {
    if (!Number.isFinite(obstacle.speed)) return Infinity;

    const distance = car.body.top - obstacle.body.bottom;
    const heightFactor = this.scale.height / 1200;
    const obstacleSpeed = obstacle.speed * heightFactor;
    const playerSpeed = car.body.velocity.y;
    const closingSpeed = obstacleSpeed - playerSpeed;

    if (closingSpeed <= 0) return Infinity;

    return Math.max(0, distance) / closingSpeed;
  }
  getSoonestObstacleAhead(car, lane) {
    const obstacles = this.getObstaclesAhead(car, lane);
    let soonest = null;

    for (const obstacle of obstacles) {
      const seconds = this.getTimeUntilObstacle(car, obstacle);
      if (!Number.isFinite(seconds)) continue;

      if (soonest === null || seconds < soonest.seconds) {
        soonest = {
          obstacle,
          seconds,
        };
      }
    }
    return soonest;
  }

  updateLaneDanger() {
    this.currentLaneDanger = null;

    if (this.car.dead) return;

    const lane = this.getPlayerLane(this.car);
    const soonest = this.getSoonestObstacleAhead(this.car, lane);
    const warningSeconds = 4;

    if (soonest !== null && soonest.seconds <= warningSeconds) {
      this.currentLaneDanger = {
        obstacle: soonest.obstacle,
        seconds: soonest.seconds,
        lane,
      };
    }
  }

  updateIceWarning() {
    if (!this.registry.get('accessibility enabled')) {
      if (this.iceWarning.isPlaying) this.iceWarning.stop();
      return;
    }

    // Keep spoken warnings from overlapping; retry pending warnings next frame.
    if (this.sound.locked || this.iceWarning.isPlaying) return;

    const warningSeconds = 3;
    let nextWarning = null;

    for (const car of [this.car, this.secondCar]) {
      if (!car || !car.active || car.dead || !car.body?.enable) continue;

      let warned = this.warnedIce.get(car);
      if (!warned) {
        warned = new WeakSet();
        this.warnedIce.set(car, warned);
      }

      const lane = this.getPlayerLane(car);
      for (const ice of this.roadObjects) {
        if (!(ice instanceof Ice) || !ice.active || !ice.body?.enable) continue;
        if (ice.lane !== lane || warned.has(ice)) continue;
        if (ice.body.bottom > car.body.top) continue;

        const seconds = this.getTimeUntilObstacle(car, ice);
        if (!Number.isFinite(seconds) || seconds > warningSeconds) continue;

        if (nextWarning === null || seconds < nextWarning.seconds) {
          nextWarning = { car, ice, seconds, warned };
        }
      }
    }

    if (nextWarning === null) return;

    const pan = Phaser.Math.Clamp(
      (nextWarning.ice.x - nextWarning.car.x) / (this.track1.displayWidth / 2),
      -1,
      1,
    );

    if (this.iceWarning.play({ pan })) {
      // Mark only successful playback, once per ice patch and player.
      nextWarning.warned.add(nextWarning.ice);
    }
  }

  updateRoadEdgeScrape() {
    if (this.car.dead) {
      this.roadEdgeScrape.stop();
      return;
    }

    const controls = this.InputManager.getControlsP1;
    const edge = this.lastPlayerRoadEdge;
    const pushingLeft = edge === 'left' && controls.left && !controls.right;
    const pushingRight = edge === 'right' && controls.right && !controls.left;

    if (pushingLeft || pushingRight) {
      this.roadEdgeScrape.setPan(pushingLeft ? -1 : 1);

      if (!this.roadEdgeScrape.isPlaying && !this.sound.locked) {
        this.roadEdgeScrape.play();
      }
    } else {
      this.roadEdgeScrape.stop();
    }
  }
  // Update the game state every frame
  update(_, delta) {
    this.InputManager.update();

    this.elapsedTime += delta;
    if (!this.car.dead) {
      this.car.move(this.InputManager.getControlsP1);
      const currentLane = this.getPlayerLane(this.car);

      let currentRoadEdge = null;

      if (this.car.x <= this.car.leftLimit) {
        currentRoadEdge = 'left';
      } else if (this.car.x >= this.car.rightLimit) {
        currentRoadEdge = 'right';
      }

      const laneChanged = currentLane !== this.lastPlayerLane;
      const edgeChanged = currentRoadEdge !== this.lastPlayerRoadEdge;

      if (this.registry.get('accessibility enabled')) {
        if (edgeChanged && currentRoadEdge !== null) {
          this.gameStatus.textContent = `${currentRoadEdge} road edge`;

          const pan = currentRoadEdge === 'left' ? -1 : 1;

          this.sound.play('road-edge-hit', { volume: 0.25, pan });
          this.sound.play('collision-hit', { volume: 0.15, pan });
        } else if (laneChanged) {
          this.gameStatus.textContent = `Lane ${currentLane + 1}`;
        }
      }

      this.lastPlayerLane = currentLane;
      this.lastPlayerRoadEdge = currentRoadEdge;
      this.car.update_boundary_particles();
      this.car.intendedXVelocity = this.car.body.velocity.x;
    }

    this.updateRoadEdgeScrape();

    if (this.secondCar && !this.secondCar.dead) {
      this.secondCar.move(this.InputManager.getControlsP2);
      this.secondCar.update_boundary_particles();
      this.secondCar.intendedXVelocity = this.secondCar.body.velocity.x;
    }

    this.roadObjects = this.roadObjects.filter((roadObject) => {
      roadObject.move(this.elapsedTime, delta);
      return roadObject.active;
    });

    this.updateLaneDanger();
    this.updateIceWarning();

    // Check after movement so sounds use the current car positions.
    const carsForAudio = this.getCarsForAudio();
    for (const sensor of this.carSensors) sensor.update(delta, carsForAudio);
    this.carPassBy.update(carsForAudio);

    const targetTrackSpeed = Math.min(1600, 700 + this.elapsedTime * 0.005);
    this.track1.speed = targetTrackSpeed;
    this.track2.speed = targetTrackSpeed;
    //dead cars do not collect distance anymore
    if (!this.car.dead) {
      this.car.update_meters(targetTrackSpeed, delta);
    }
    if (this.secondCar && !this.secondCar.dead) {
      this.secondCar.update_meters(targetTrackSpeed, delta);
    }

    for (const wall of this.walls) {
      wall.speed = targetTrackSpeed;
      wall.move(delta);
    }

    this.track1.move(delta);
    this.track2.move(delta);
    this.hud.update();

    this.ItemManager.itemShop();
  }
}
