/* global Phaser */

import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },

  backgroundColor: '#000000',

  scene: [
    MenuScene,
    GameScene,
  ],
};

new Phaser.Game(config);