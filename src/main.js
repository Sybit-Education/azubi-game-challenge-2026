/* global Phaser */
import MenuScene from './scenes/Menus/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import LoadingScene from './scenes/LoadingScene.js';
import PopUpScene from './scenes/Menus/PopUpScene.js';
import StartScene from './scenes/StartScene.js';
import GameoverScene from './scenes/GameoverScene.js';
import CreditsScene from './scenes/CreditsScene.js';
import ChristmasScene from './scenes/Menus/ChristmasScene.js';
import LeaderboardScene from './scenes/LeaderboardScene.js'
import NameInputScene from './scenes/Menus/NameInputScene.js';

// Phaser 3's stopListeners assumes the gamepad array has no empty slots.
const stopGamepadListeners = Phaser.Input.Gamepad.GamepadPlugin.prototype.stopListeners;
Phaser.Input.Gamepad.GamepadPlugin.prototype.stopListeners = function () {
  const gamepads = this.gamepads;
  const connectedGamepads = gamepads.filter(Boolean);

  if (connectedGamepads.length === gamepads.length) {
    return stopGamepadListeners.call(this);
  }

  this.gamepads = connectedGamepads;
  try {
    return stopGamepadListeners.call(this);
  } finally {
    this.gamepads = gamepads;
  }
};

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

  input: {
    gamepad: true,
  },

  scene: [
    MenuScene,
    LoadingScene,
    NameInputScene,
    StartScene,
    GameScene,
    PopUpScene,
    GameoverScene,
    CreditsScene,
    ChristmasScene,
    LeaderboardScene,
  ],

  loader: {
    baseURL: window.location.pathname,
  },
};

// Create game
new Phaser.Game(config);
