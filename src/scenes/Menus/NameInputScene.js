/* global Phaser */

export default class NameInputScene extends Phaser.Scene {
  constructor() {
    super('NameInputScene');
  }

  create() {
    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'Name Input Scene'
    )
    .setOrigin(0.5);
  }
}