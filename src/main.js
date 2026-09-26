/* global Phaser */

import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import StartScene from './scenes/StartScene.js';

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },

  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    aracde: {
      debug: true,
    },
  },
  scene: [MenuScene, StartScene, GameScene],
};

new Phaser.Game(config);
