/* global Phaser */
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LoadingScene from './scenes/LoadingScene.js';
import PopUpScene from './scenes/PopUpScene.js';
import StartScene from './scenes/StartScene.js';
import GameoverScene from './scenes/GameoverScene.js';
import CreditsScene from './scenes/CreditsScene.js';

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
      debug: false,
    },
  },
  scene: [MenuScene, LoadingScene, StartScene, GameScene, PopUpScene, GameoverScene, CreditsScene],
};

// Create game
new Phaser.Game(config);
