/* global Phaser */

import Car from '../objects/Car.js';
import EnemyCar from '../objects/EnemyCar.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';
import HUD from '../objects/HUD.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  //Bilder laden
  preload() {
    this.load.image('car', 'sprites/Sybit Kart Player car 1.png');
    this.load.image('track', 'sprites/road.png');
    this.load.image('border', 'sprites/border.png');

    this.load.image('enemy-car1', 'sprites/enemy-car1.png');
    this.load.image('enemy-car2', 'sprites/enemy-car2.png');
    this.load.image('enemy-car3', 'sprites/enemy-car3.png');
  }

  //Alle Objekte in der Szene initialisieren
  create() {
    this.obstacles = [];
    this.createPlayer();
    this.createTrack();
    this.createWalls();
    this.createObstacle();
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

  createObstacle() {
    const laneCount = 4;
    const laneWidth = this.track1.displayWidth / laneCount;
    const roadLeftEdge = this.scale.width / 2 - this.track1.displayWidth / 2;
    const lane = Phaser.Math.Between(0, laneCount - 1);
    const obstacleX = roadLeftEdge + lane * laneWidth + laneWidth / 2;
    const obstacle = new EnemyCar(this, obstacleX, -200);

    this.obstacles.push(obstacle);

    const delay = Phaser.Math.Between(500, 3000);
    this.time.delayedCall(delay, () => this.createObstacle());
  }

  update(_, delta) {
    this.car.move();

    //alle obstacles die noch active sind, werden in den array gepackt, alle anderen werden gefiltert,...
    // ...damit sie nicht unendlich mal .move() auführen, während sie deleted sind
    this.obstacles = this.obstacles.filter((obstacle) => {
      obstacle.move(delta);
      return obstacle.active;
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
