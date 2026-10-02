/* global Phaser */

export default class StartingLine extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'startingline');
    scene.add.existing(this);
  }
}
