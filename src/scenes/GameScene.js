import Phaser from 'phaser';

import Car from '../objects/Car.js';
import EnemyCar from '../objects/EnemyCar.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';
import HUD from '../objects/HUD.js';
import { preloadGameplaySounds } from '../../audio/sounds.js';
import CarSensor, { nearestCar } from '../../audio/CarSensor.js';
import CarPassBy from '../../audio/CarPassBy.js';
import ItemManager from '../objects/ItemManager.js';
import { updateGameScene } from './GameSceneFrame.js';
import { createRoadObject } from './GameSceneRoadObjects.js';
import RandomObstacle from '../objects/RandomObstacle.js';
import CoinAnnouncements from '../accessibility/CoinAnnouncements.js';
import LaneAnnouncements from '../../audio/LaneAnnouncements.js';
import GameSpeech from '../../audio/GameSpeech.js';
import Flickereffect from '../scenes/FlickerEffect.js';

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
    this.load.image(
      'car',
      'assets/images/entities/player-skins/player-sprites/sybit-kart-player-1.png',
    );
    this.load.image(
      'car2',
      'assets/images/entities/player-skins/player-sprites/sybit-kart-player-2.png',
    );
    this.load.image(
      'winter-car',
      'assets/images/entities/player-skins/player-sprites/winter-car-P1.png',
    );
    this.load.image(
      'winter-car2',
      'assets/images/entities/player-skins/player-sprites/winter-car-P2.png',
    );

    this.load.image('track', 'assets/images/race-track-assets/road.png');
    this.load.image('border', 'assets/images/race-track-assets/border.png');

    this.load.image('enemy-car1', 'assets/images/entities/obstacles/enemy-car-1.png');
    this.load.image('enemy-car2', 'assets/images/entities/obstacles/enemy-car-2.png');
    this.load.image('enemy-car3', 'assets/images/entities/obstacles/enemy-car-3.png');

    this.load.image('coin', 'assets/images/entities/coin.png');
    this.load.image('coinMultiplier', 'assets/images/entities/coin-multiplier.png');
    this.load.image('item', 'assets/images/entities/mystery-box.png');
    this.load.image('ice-obstacle', 'assets/images/entities/obstacles/ice-obstacle.png');
    this.load.image('oil-obstacle', 'assets/images/entities/obstacles/oil-obstacle.png');
    this.load.image('extraLife', 'assets/images/entities/extra-life.png');
    this.load.image('random-object1', 'assets/images/entities/obstacles/random-object-1.png');
    this.load.image('random-object2', 'assets/images/entities/obstacles/random-object-2.png');
    this.load.image('random-object3', 'assets/images/entities/obstacles/random-object-3.png');
    this.load.image('random-object4', 'assets/images/entities/obstacles/random-object-4.png');

    this.load.image('boundary-particle', 'assets/images/particles/image-001.png');

    this.load.image('background', 'assets/images/map-skins/background-sybit-city.png');
    this.load.image('background-flash', 'assets/images/map-skins/background-sybit-city-off.png');
    this.load.image('background-winter', 'assets/images/map-skins/background-winter-map.png');

    this.load.image(
      'carShield',
      'assets/images/entities/player-skins/player-states/car-shield.png',
    );
    this.load.image(
      'carShield2',
      'assets/images/entities/player-skins/player-states/car-shield-2.png',
    );

    this.load.image(
      'blinkLeft',
      'assets/images/entities/player-skins/player-states/sybit-kart-player-1-blink-left.png',
    );
    this.load.image(
      'blinkRight',
      'assets/images/entities/player-skins/player-states/sybit-kart-player-1-blink-right.png',
    );
    this.load.image(
      'blinkLeft2',
      'assets/images/entities/player-skins/player-states/sybit-player-2-blink-left.png',
    );
    this.load.image(
      'blinkRight2',
      'assets/images/entities/player-skins/player-states/sybit-player-2-blink-right.png',
    );
    this.load.image(
      'brakeLights',
      'assets/images/entities/player-skins/player-states/sybit-player-1-brakelights.png',
    );
    this.load.image(
      'brakeLights2',
      'assets/images/entities/player-skins/player-states/sybit-player-2-brakelights.png',
    );

    this.load.image('hotbar', 'assets/images/race-track-assets/hotbar.png');
    this.load.image('hotbarMultiplayer', 'assets/images/race-track-assets/hotbarMultiplayer.png');
    this.load.image('hotbar-coin', 'assets/images/race-track-assets/hotbar-coin.png');
    this.load.image('shield', 'assets/images/hud-icons/shield.png');
    this.load.image('shrink', 'assets/images/hud-icons/shrink.png');
    this.load.image('grow', 'assets/images/hud-icons/grow.png');
    this.load.image('stats-background', 'assets/images/hud-icons/stats-background.png');
    this.load.image('magnet', 'assets/images/hud-icons/magnet.png');
  }

  // BootScene loads the font; initialize synchronously before Phaser starts update().
  create() {
    const scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);

    this.secondCar = null;

    this.elapsedTime = 0;
    this.roadObjects = [];
    this.currentLaneDanger = null;
    this.createPlayer();
    this.ItemManager = new ItemManager(this);
    this.speech = new GameSpeech();
    const silenceSpeech = () => this.speech.silence();
    this.events.on('pause', silenceSpeech);
    this.events.on('sleep', silenceSpeech);
    this.events.once('shutdown', () => {
      this.events.off('pause', silenceSpeech);
      this.events.off('sleep', silenceSpeech);
      this.speech.destroy();
    });
    this.coinAnnouncements = new CoinAnnouncements(this);
    this.laneAnnouncements = new LaneAnnouncements(this);
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
    createRoadObject(this, 'enemy-car');
    createRoadObject(this, 'coin');
    createRoadObject(this, 'coinMultiplier');
    createRoadObject(this, 'item');
    if (
      this.registry.get('gameMode') === 'christmas'
        ? createRoadObject(this, 'ice')
        : createRoadObject(this, 'oil')
    );
    createRoadObject(this, 'extraLife');
    createRoadObject(this, 'random-obstacle');
    this.createHud();

    const backgroundkey =
      this.registry.get('gameMode') === 'christmas' ? 'background-winter' : 'background';
    this.backgroundNormal = this.setBackground(backgroundkey);
    if (backgroundkey === 'background') {
      this.backgroundFlash = this.add.image(0, 0, 'background-flash').setOrigin(0, 0);
      this.backgroundFlash.setDisplaySize(this.scale.width, this.scale.height);
      this.backgroundFlash.setDepth(-9);
      this.backgroundFlash.setVisible(false);
      this.flickerEffect = new Flickereffect(this, this.backgroundNormal, this.backgroundFlash);
      this.flickerEffect.start();
    }

    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.separateOverlappingCars, this);

    this.hotbar = this.add
      .image(
        this.hud.statsBackground.x * scaleFactor,
        this.hud.statsBackground.displayHeight + 30 * scaleFactor,
        this.isMultiplayer ? 'hotbarMultiplayer' : 'hotbar',
      )
      .setOrigin(0, 0)
      .setDepth(1000)
      .setScrollFactor(0)
      .setScale(0.5 * scaleFactor);

    this.hotbarCoin = this.add
      .image(this.hotbar.displayWidth * 1.1, this.hotbar.y * 1.1, 'hotbar-coin')
      .setScale(0.7 * scaleFactor)
      .setOrigin(0, 0)
      .setDepth(1000)
      .setScrollFactor(0);

    this.coinText1 = this.add
      .text(this.hotbarCoin.x * 1.33, this.hotbarCoin.y, this.ItemManager.coinBudgetPlayer1, {
        fontSize: `${50 * scaleFactor}px`,
        color: '#ffffff',
        fontFamily: 'Silkscreen',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0, 0)
      .setDepth(1000)
      .setScrollFactor(0);

    if (this.isMultiplayer) {
      this.hotbar2 = this.add
        .image(this.scale.width - this.hotbar.displayWidth, this.hotbar.y, 'hotbarMultiplayer')
        .setOrigin(0, 0)
        .setDepth(1000)
        .setScrollFactor(0)
        .setScale(0.5 * scaleFactor);

      // Coin Icon Player 2
      this.hotbarCoin2 = this.add
        .image(
          this.scale.width - this.hotbar2.displayWidth * 1.2 - this.hotbarCoin.displayWidth,
          this.hotbar.y * 1.1,
          'hotbar-coin',
        )
        .setScale(0.7 * scaleFactor)
        .setOrigin(0, 0)
        .setDepth(1000)
        .setScrollFactor(0);

      // Coin Number Player 2
      this.coinText2 = this.add
        .text(
          this.hotbarCoin2.x + this.hotbarCoin2.displayWidth,
          this.hotbarCoin2.y,
          this.ItemManager.coinBudgetPlayer2,
          {
            fontSize: `${50 * scaleFactor}px`,
            color: '#ffffff',
            fontFamily: 'Silkscreen',
            stroke: '#000000',
            strokeThickness: 2,
          },
        )
        .setOrigin(0, 0)
        .setDepth(1000)
        .setScrollFactor(0);
    }

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
    return background;
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
      this.car = new Car(this, this.scale.width / 2 - 130, this.scale.height / 1.25);
      this.car.body.setSize(this.car.width * 0.8, this.car.height * 0.9); //scale fix (hitbox slightly smaller to be more forgiving, else, game too hard)

      this.secondCar = new Car(
        this,
        this.scale.width / 2 + 140,
        this.scale.height / 1.25,
        'car2',
        2,
      );
      this.secondCar.body.setSize(this.secondCar.width * 0.8, this.secondCar.height * 0.9); //scale fix
      //this.physics.add.collider(this.car, this.secondCar);
    } else {
      this.car = new Car(this, this.scale.width / 2 - 130, this.scale.height / 1.25);
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
    this.hud.greyOut(car === this.car ? 1 : 2);

    this.sound.play('collision-hit', { volume: 0.3 });
    this.sound.play('collision-bang', { volume: 0.3 });
    this.sound.play('collision-impact', { volume: 0.3 });
    car.boundaryParticles.emitting = false;
    car.destroy();

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

  getObstaclesForAudio() {
    return [
      ...this.roadObjects.filter(
        (object) =>
          !object.isDuck && (object instanceof EnemyCar || object instanceof RandomObstacle),
      ),
      this.car,
      this.secondCar,
    ];
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
  update(_, delta) {
    updateGameScene(this, delta);
  }
}
