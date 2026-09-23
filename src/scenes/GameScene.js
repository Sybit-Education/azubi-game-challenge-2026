/* global Phaser */

import Car from '../objects/Car.js';
import Obstacle from '../objects/Obstacle.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('car', 'sprites/race_car.png');
    this.load.image('placeholder1', 'sprites/placeholder1.png');
    this.load.image('placeholder2', 'sprites/placeholder2.png');
    this.load.image('placeholder3', 'sprites/placeholder3.png');
  }

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
      .setOrigin(1, 0);
  }

  update(time, delta) {
    this.car.move();
    this.obstacles.forEach((Obstacle) => {
      Obstacle.move(delta);
    });
  }
}
