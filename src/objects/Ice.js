import Collectable from './Collectable.js';

export default class Ice extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'ice-obstacle', lane, 0);

    this.setScale(0.4);
  }
}
