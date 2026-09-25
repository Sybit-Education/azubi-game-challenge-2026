//hier kein phaser importieren solange es nicht genutzt wird!!! sonst tweaked lint

import RoadObject from './RoadObject.js';

export default class Obstacle extends RoadObject {
  constructor(scene, x, y, texture, lane) {
    super(scene, x, y, texture, lane);

    this.setScale(0.5);
  }
}
