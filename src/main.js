/* global Phaser */
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

// Global phaser config
const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.RESIZE,
  },

  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    aracde: {
      debug: true,
    },
  },
  scene: [MenuScene, GameScene],
};

// Create game
new Phaser.Game(config);
