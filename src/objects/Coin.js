import Collectable from './Collectable.js';

export default class Coin extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'coin', lane, 50);

    this.setScale(2);
  }
}