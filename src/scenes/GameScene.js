/* global Phaser */

import Car from '../objects/Car.js';
import Track from '../objects/Track.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  //Bilder laden
  preload() {
    this.load.image('car', 'sprites/race_car.png');
    this.load.image('track', 'sprites/race_track1.png');
  }

  //Alle Objekte in der Szene initialisieren
  create() {
    this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
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

  update() {
    this.car.move();
    this.car.update_meters();
    this.distancetext.setText(`Distance: ${(this.car.distance / 1000).toFixed(2)} km`);
    this.track1.move();
    this.track2.move();
  }
}
