/* global Phaser */

import Car from '../objects/Car.js';
import EnemyCar from '../objects/EnemyCar.js';
import Track from '../objects/Track.js';
import Borders from '../objects/Walls.js';
import HUD from '../objects/HUD.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  //Bilder laden
  preload() {
    this.load.image('car', 'sprites/Sybit Kart Player car 1.png');
    this.load.image('track', 'sprites/road.png');

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
    this.walls = [
      new Borders(this, 500, 700, 2, 600, 0x0000),
      new Borders(this, 1020 + 387, 700, 2, 600, 0x0000),
    ];

    this.physics.add.collider(this.car, this.walls);
  }

  createHud() {
    this.hud = new HUD(this, this.car);
    this.car.decrease_score(100);
    this.car.increase_score(50);
  }

    createObstacle() {
      const laneCount = 4;
      const boaderWidth = 100;
      const roadWidth = this.track1.displayWidth - (boaderWidth * 2);
      const laneWidth = roadWidth / laneCount;
      const roadLeftEdge = this.scale.width / 2 - roadWidth / 2;
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

    this.track1.move(delta);
    this.track2.move(delta);
    this.hud.update();
  }
}
