import Collectable from './Collectable.js';

export default class Item extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'item', lane);

    this.setScale(2);
  }
}