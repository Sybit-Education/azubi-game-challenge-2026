import Collectable from './Collectable.js';

export default class CoinMultiplier extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'coinMultiplier', lane, 50);

    this.setScale(0.075);
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);
    this.scene.time.delayedCall(0, () => {
      this.body.setSize(300 * this.scaleFactor, 300 * this.scaleFactor);
      this.body.setOffset(0, 0);
    });

    this.value = 50;
  }
}
