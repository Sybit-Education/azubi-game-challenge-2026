/* global Phaser */

import Car from '../objects/Car.js';
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
  }

  //Alle Objekte in der Szene initialisieren
  create() {
    this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);
    this.walls = [
      new Borders(this, 770, 700, 2, 600, 0x0000),
      new Borders(this, 1150, 700, 2, 600, 0x0000),
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

  update() {
    this.car.move();
    this.car.update_meters();
    this.track1.move();
    this.track2.move();
    this.hud.update();
  }
}
