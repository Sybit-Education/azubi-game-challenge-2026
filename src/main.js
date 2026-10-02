/* global Phaser */
import MenuScene from './scenes/Menus/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LoadingScene from './scenes/LoadingScene.js';
import PopUpScene from './scenes/Menus/PopUpScene.js';
import StartScene from './scenes/StartScene.js';
import GameoverScene from './scenes/GameoverScene.js';
import CreditsScene from './scenes/CreditsScene.js';
import ChristmasScene from './scenes/Menus/ChristmasScene.js';

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

  input: {
    gamepad: true,
  },

  scene: [
    MenuScene,
    LoadingScene,
    StartScene,
    GameScene,
    PopUpScene,
    GameoverScene,
    CreditsScene,
    ChristmasScene,
  ],
};

// Create game
new Phaser.Game(config);
