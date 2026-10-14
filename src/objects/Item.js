import Collectable from './Collectable.js';

export default class Item extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'item', lane, 0);

    this.setScale(2 * (scene.scale.height / 1200));
    this.body.setOffset(0, 5); //scale fix
  }
}
