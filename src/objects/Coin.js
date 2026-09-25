import Collectable from './Collectable.js';

export default class Coin extends Collectable {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');
    this.setScale(2);
  }
}