/* global Phaser */
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LoadingScene from './scenes/LoadingScene.js';
import PopUpScene from './scenes/PopUpScene.js';
// Global phaser config
const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
  },

  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },
  scene: [MenuScene, GameScene, LoadingScene, PopUpScene],
};

// Create game
new Phaser.Game(config);
