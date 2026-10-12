import Phaser from 'phaser';

export default class StartingLine extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'startingLine');
    scene.add.existing(this);
  }
}
