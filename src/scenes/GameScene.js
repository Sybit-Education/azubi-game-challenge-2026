/* global Phaser */

import Car from '../objects/Car.js';
import Obstacle from '../objects/Obstacle.js';
import Track from '../objects/Track.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  //Bilder laden
  preload() {
    this.load.image('car', 'sprites/race_car.png');
    this.load.image('placeholder1', 'sprites/placeholder1.png');
    this.load.image('placeholder2', 'sprites/placeholder2.png');
    this.load.image('placeholder3', 'sprites/placeholder3.png');
    this.load.image('track', 'sprites/race_track1.png');
  }

  //Alle Objekte in der Szene initialisieren
  create() {
    //array mit allen obstacles
    this.obstacles = [];

    this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);

    //funktion, die die Hinderniss logik beginnt
    const obstacleGameLoop = () => {
      //straßenbreite
      const roadWidth = this.scale.width * 0.3;
      const laneWidth = roadWidth / 2;
      const leftLane = this.scale.width / 2 - laneWidth / 2;
      const rightLane = this.scale.width / 2 + laneWidth / 2;

      //es wird entschieden für jeweiligen obstacle, ob links oder rechts zu spawnen
      const x = Math.random() < 0.5 ? leftLane : rightLane;

      const obstacle = new Obstacle(this, x, -100, laneWidth);

      this.obstacles.push(obstacle);

      //zufälliger delay der spawnrate
      const delay = Math.random() * 3000 + 1000;
      console.log(delay);

      this.time.delayedCall(delay, () => {
        obstacleGameLoop();
      });
    };

    obstacleGameLoop();

    this.add.text(this.scale.width - 20, 20, `Score: ${this.car.value}`, {
      fontSize: '30px',
    });
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);

    this.add.text(this.scale.width - 20, 20, `Score: ${this.car.value}`, {
      fontSize: '30px',
    });

    //Highscoreanzeige
    this.distancetext = this.add
      .text(this.scale.width - 300, 20, `Distance: ${this.car.distance}`, { fontSize: '30px' })
      .setOrigin(1, 0);

    //Scoreanzeige
    this.scoretext = this.add
      .text(this.scale.width - 20, 20, `Score: ${this.car.score}`, { fontSize: '30px' })
      .setOrigin(1, 0);

    //Score um 100 reduzieren als Beispiel
    this.car.decrease_score(100);

    //Score mit 50 addieren als Beispiel
    this.car.increase_score(50);
    //Score aktualisieren
    this.scoretext.setText(`Score: ${this.car.score}`);
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
    this.distancetext.setText(`Distance: ${(this.car.distance / 1000).toFixed(2)} km`);
    this.track1.move();
    this.track2.move();
  }
}
