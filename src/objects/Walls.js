/* global Phaser */

// limit car on left side but not on right
//distance is not in km
//code needs to be cleaner

export default class Borders extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, color) {
    super(scene, x, y, width, height, color);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body
    this.body.setSize(width, height);
  }
}
