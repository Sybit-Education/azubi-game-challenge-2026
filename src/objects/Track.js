/* global Phaser */

export default class Track extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'track');

    scene.add.existing(this);
    this.scale = this.scene.scale.height / this.height;
    this.speed = 5;
    this.setScale(this.scale);
    this.setDepth(-1);
    this.setOrigin(0.5, 0);
  }

  move(delta) {
    this.y += (this.speed * delta) / 1000;

    if (this.y >= this.scene.scale.height) {
      this.y -= this.displayHeight * 2;
    }
  }
}

export class Track_right extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'trackRight');

    scene.add.existing(this);
    this.scale = this.scene.scale.height / this.height;
    this.speed = 5;
    this.setScale(this.scale);
    this.setDepth(-1);
    this.setOrigin(0, 0);
  }

  move(delta) {
    this.y += (this.speed * delta) / 1000;

    if (this.y >= this.scene.scale.height) {
      this.y -= this.displayHeight * 2;
    }
  }
}

export class Track_left extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'trackLeft');

    scene.add.existing(this);
    this.scale = this.scene.scale.height / this.height;
    this.speed = 5;
    this.setScale(this.scale);
    this.setDepth(-1);
    this.setOrigin(1, 0);
  }

  move(delta) {
    this.y += (this.speed * delta) / 1000;

    if (this.y >= this.scene.scale.height) {
      this.y -= this.displayHeight * 2;
    }
  }
}
