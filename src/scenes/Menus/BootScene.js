import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  async create() {
    await document.fonts.load('1em Tiny5');
    this.scene.start('MenuScene');
  }
}
