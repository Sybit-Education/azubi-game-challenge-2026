import Collectable from './Collectable.js';

export default class Item extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'item', lane, 0);

    this.setScale(2);
  }
}
