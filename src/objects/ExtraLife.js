import Collectable from './Collectable.js';

export default class ExtraLife extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'extraLife', lane, 0);

    this.setScale(2);
  }
}
