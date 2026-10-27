import Collectable from './Collectable.js';

export default class Oil extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'oil-obstacle', lane, 0);

    this.setScale(0.27);
  }
}
