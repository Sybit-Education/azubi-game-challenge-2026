/* global Phaser */

import Car from '../objects/Car.js';
import Obstacle from '../objects/Obstacle.js';
import Track, { Track_right, Track_left } from '../objects/Track.js';
import Borders from '../objects/Walls.js';
import HUD from '../objects/HUD.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  //Bilder laden
  preload() {
    this.load.image('car', 'sprites/Sybit Kart Player car 1.png');
    this.load.image('track', 'sprites/road copy.png');
    this.load.image('trackLeft', 'sprites/roadLeft.png');
    this.load.image('trackRight', 'sprites/roadRight.png');
    this.load.image('placeholder1', 'sprites/placeholder1.png');
    this.load.image('placeholder2', 'sprites/placeholder2.png');
    this.load.image('placeholder3', 'sprites/placeholder3.png');
  }

  //Alle Objekte in der Szene initialisieren
  create() {
    //array mit allen obstacles
    this.obstacles = [];

    this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);

    //funktion, die die Hinderniss logik beginnt
    const obstacleGameLoop = () => {
      const roadWidth = this.scale.width * 0.7; //die breite wird später korrigiert
      const laneCount = 4;
      const laneWidth = roadWidth / laneCount; //die lane breite wird ausgerechnet aus der menge lanes

      const roadLeft = this.scale.width / 2 - roadWidth / 2; //die linke seite der road

      const laneCenters = Array.from({ length: laneCount }, (_, i) => {
        //die mitte der lane wird berechnet, und ins array getan
        return roadLeft + laneWidth * (i + 0.5);
      });

      const x = laneCenters[Math.floor(Math.random() * laneCenters.length)]; //ein random lane aus dem array wird gewählt zum spawnen

      const obstacle = new Obstacle(this, x, -100, laneWidth);

      this.obstacles.push(obstacle);

      //zufälliger delay der spawnrate
      const delay = Math.random() * 2500 + 500;

      this.time.delayedCall(delay, () => {
        obstacleGameLoop();
      });
    };

    obstacleGameLoop();

    //nur Straßenteil initialisieren
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);
    let left_edge = this.track1.x - this.track1.displayWidth / 2;
    let right_edge = this.track1.displayWidth + left_edge;

    //Leitplanken initialisieren
    this.track_left1 = new Track_left(this, left_edge, 0);
    this.track_left2 = new Track_left(this, left_edge, this.track_left1.displayHeight);

    this.track_right1 = new Track_right(this, right_edge, 0);
    this.track_right2 = new Track_right(this, right_edge, this.track_right1.displayHeight);

    //array für alle track teile
    this.tracks = [
      this.track1,
      this.track2,
      this.track_left1,
      this.track_left2,
      this.track_right1,
      this.track_right2,
    ];

    //Borders initialisieren
    this.walls = [
      new Borders(this, left_edge, 700, 2, 600, 0x0000),
      new Borders(this, right_edge, 700, 2, 600, 0x0000),
    ];

    //collision physics for car and walls to set movement limit
    this.physics.add.collider(this.car, this.walls);
    //Score- und Km-anzeigen initialisieren
    this.hud = new HUD(this, this.car);

    //Score um 100 reduzieren als Beispiel
    this.car.decrease_score(100);

    //Score mit 50 addieren als Beispiel
    this.car.increase_score(50);
  }

  update(time, delta) {
    this.car.move();

    //alle obstacles die noch active sind, werden in den array gepackt, alle anderen werden gefiltert,...
    // ...damit sie nicht unendlich mal .move() auführen, während sie deleted sind
    this.obstacles = this.obstacles.filter((obstacle) => {
      obstacle.move(delta);
      return obstacle.active;
    });
    this.car.update_meters();
    const targetTrackSpeed = Math.min(1500, 600 + this.car.meters * 0.1);//+ this.car.meters * 1
    //Die Leitplanken und die Straße Synchronisieren
    this.tracks.forEach((track) => {
      track.speed = targetTrackSpeed;
      track.move(delta);
    });
    this.hud.update();
  }
}
