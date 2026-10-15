import Phaser from 'phaser';

export default class StartingBanner extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'starting-banner');
    scene.add.existing(this);
  }
}
