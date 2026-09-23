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
    this.obstacles = [];

    this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);

    const obstacleGameLoop = () => {
      const obstacle = new Obstacle(this, this.scale.width / 2, 0);

      this.obstacles.push(obstacle);

      const delay = Math.random() * 3000 + 1000;
      console.log(delay);

      this.time.delayedCall(delay, () => {
        obstacleGameLoop();
      });
    };

    obstacleGameLoop();

    this.add
      .text(this.scale.width - 20, 20, `Score: ${this.car.value}`, {
        fontSize: '30px',
      })
    this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);

    this.add.text(this.scale.width - 20, 20, `Score: ${this.car.value}`, {
      fontSize: '30px',
    });

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
    this.obstacles.forEach((Obstacle) => {
      Obstacle.move(delta);
    });
    this.track1.move();
    this.track2.move();
  }
}
