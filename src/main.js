/* global Phaser */

import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LoadingScene from './scenes/LoadingScene.js';

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
  scene: [MenuScene, GameScene, LoadingScene],
};

new Phaser.Game(config);
