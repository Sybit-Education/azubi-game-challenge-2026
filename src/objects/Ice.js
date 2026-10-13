import Collectable from './Collectable.js';

export default class Ice extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'ice', lane, 0);

    this.setScale(2.5);
  }  
}
