import Collectable from './Collectable.js';

export default class CoinMultiplier extends Collectable {
  constructor(scene, x, y, lane) {
    super(scene, x, y, 'coinMultiplier', lane, 50);

    this.setScale(0.075);
    this.scaleFactor = Math.min(scene.scale.width / 1920, scene.scale.height / 1080) * 3;
    this.scene.time.delayedCall(0, () => {
      this.body.setSize(300 * this.scaleFactor, 300 * this.scaleFactor);
      this.body.setOffset(scene.scale.width / 13, scene.scale.width / 9);
    });

    this.value = 50;
  }
}
