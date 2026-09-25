import RoadObject from './RoadObject.js';

export default class Collectable extends RoadObject {
  constructor(scene, x, y, texture, lane, value) {
    super(scene, x, y, texture, lane);

    this.value = value;
  }

  collect() {
    this.destroy();
  }
}
