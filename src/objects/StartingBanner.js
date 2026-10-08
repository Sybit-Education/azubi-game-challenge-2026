/* global Phaser */

export default class StartingBanner extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'starting_Banner');
    scene.add.existing(this);
  }
}
