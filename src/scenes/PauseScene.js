import Phaser from 'phaser';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.55).setOrigin(0);
    this.add.text(width / 2, height / 2 - 30, 'Pause', { fontSize: '48px' }).setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 30, 'ESC zum Fortsetzen', { fontSize: '24px' })
      .setOrigin(0.5);

    this.onEscape = (event) => {
      if (event.key === 'Escape') this.resumeGame();
    };
    window.addEventListener('keydown', this.onEscape);
    this.events.once('shutdown', () => window.removeEventListener('keydown', this.onEscape));
  }

  resumeGame() {
    const gameScene = this.scene.get('GameScene');
    gameScene.InputManager?.resetButtonStates();
    this.scene.stop();
    this.scene.resume('GameScene');
  }
}
