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

  //Bilder laden
  preload() {
    this.load.image('car', 'sprites/sybit-kart.png');
    this.load.image('track', 'sprites/road.png');
    this.load.image('border', 'sprites/border.png');

    this.load.image('enemy-car1', 'sprites/enemy-car1.png');
    this.load.image('enemy-car2', 'sprites/enemy-car2.png');
    this.load.image('enemy-car3', 'sprites/enemy-car3.png');

    this.load.image('coin', 'sprites/coin.png');
  }

  //Alle Objekte in der Szene initialisieren
  create() {
    this.roadObjects = [];
    this.createPlayer();
    this.createTrack();
    this.createWalls();
    this.createRoadObject('obstacle');
    this.createRoadObject('coin');
    this.createHud();
  }

  createPlayer() {
    this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
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

    this.physics.add.collider(this.car, this.walls);
  }

  createHud() {
    this.hud = new HUD(this, this.car);
    this.car.decrease_score(100);
    this.car.increase_score(50);
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
        this.physics.add.overlap(this.car, roadObject, this.collectCoin, undefined, this);
      } else {
        roadObject = new EnemyCar(this, roadObjectX, spawnY, lane);
      }

      this.roadObjects.push(roadObject);
    }

    const delay = Phaser.Math.Between(500, 3000);
    this.time.delayedCall(delay, () => this.createRoadObject(type));
  }

  // Checks if the lane is free for spawning a new road object
  positionFree(lane, spawnY) {
    const minimumDistance = 200; // Minimum distance between road objects

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

  // Update the game state every frame
  update(_, delta) {
    this.car.move();

    this.roadObjects = this.roadObjects.filter((roadObject) => {
      roadObject.move(delta);
      return roadObject.active;
    });
    
    this.car.update_meters();
    const targetTrackSpeed = Math.min(1500, 600 + this.car.meters * 0.1);
    this.track1.speed = targetTrackSpeed;
    this.track2.speed = targetTrackSpeed;

    for (const wall of this.walls) {
      wall.speed = targetTrackSpeed;
      wall.move(delta);
    }

    this.track1.move(delta);
    this.track2.move(delta);
    this.hud.update();
  }
}
