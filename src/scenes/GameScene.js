/* global Phaser */

import Car from '../objects/Car.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('car', 'sprites/race_car.png');
  }

  create() {
    this.car = new Car(
      this,
      this.scale.width / 2,
      this.scale.height / 1.25
    );

    this.add
      .text(
        this.scale.width - 20,
        20,
        `Score: ${this.car.value}`,
        {
          fontSize: '30px',
        }
      )
      .setOrigin(1, 0);
  }

  update() {
    this.car.move();
  }
}