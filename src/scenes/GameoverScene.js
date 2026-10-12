/* global Phaser */

import InputManager from '../objects/InputManager.js';
import { positionAccessibleControls } from '../accessibility/positionControls.js';

export default class GameoverScene extends Phaser.Scene {
  constructor() {
    super('GameoverScene');
  }

  init(data) {
    this.distance = data.distance;
    this.score = data.score;
    this.distance2 = data.distance2; //added player 2 score and distance
    this.score2 = data.score2;
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  preload() {
    this.load.image('gameover-title', 'assets/images/gameover-scene-assets/game-over.png');
    this.load.image(
      'gameover-play-again',
      'assets/images/gameover-scene-assets/nochmal-spielen.png',
    );
    this.load.image('gameover-menu-btn', 'assets/images/gameover-scene-assets/hauptmenu-1.png');
    this.load.image('gameover-score-text', 'assets/images/gameover-scene-assets/score.png');
    this.load.image('gameover-distance-text', 'assets/images/gameover-scene-assets/distanz.png');
    this.load.image(
      'gameover-hintergrund',
      'assets/images/gameover-scene-assets/game-over-hintergrund.png',
    );
  }
  create() {
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    const gameOverUi = document.getElementById('game-over-ui');
    const finalScore = document.getElementById('final-score');
    const distance = document.getElementById('final-distance');
    const retryGame = document.getElementById('retry');
    const backToHomeScreen = document.getElementById('back-to-home');
    gameOverUi.hidden = false;

    finalScore.textContent = this.score;
    distance.textContent = this.distance;
    if (this.isMultiplayer) {
      finalScore.textContent = `player 1: ${this.score}, player 2: ${this.score2}`;
      distance.textContent = `player 1: ${this.distance}, player 2: ${this.distance2}`;
    }
    const retryFunction = () => {
      this.scene.start('GameScene', {
        isMultiplayer: this.isMultiplayer,
      });
    };

    const backToHomeFunction = () => {
      this.scene.start(
        this.registry.get('gameMode') === 'christmas' ? 'ChristmasScene' : 'MenuScene',
      );
    };

    retryGame.addEventListener('click', retryFunction);
    retryGame.focus();
    backToHomeScreen.addEventListener('click', backToHomeFunction);

    this.events.once('shutdown', () => {
      retryGame.removeEventListener('click', retryFunction);
      backToHomeScreen.removeEventListener('click', backToHomeFunction);
      gameOverUi.hidden = true;
    });

    this.width = this.scale.width;
    this.height = this.scale.height;

    this.add
      .image(this.width / 2, this.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    const statsStyle = {
      fontSize: '30px',
    };

    this.add
      .image(this.width / 2, this.height / 3, 'gameover-title')
      .setOrigin(0.5)
      .setScale(0.6);

    this.add
      .image(this.width / 1.9, this.height / 2.2, 'gameover-distance-text')
      .setOrigin(0.5)
      .setScale(0.4);
    this.add
      .text(this.width / 1.67, this.height / 2.2, ` ${this.distance} Km`, statsStyle)
      .setOrigin(0.5);

    this.add
      .image(this.width / 2.7, this.height / 2.2, 'gameover-score-text')
      .setOrigin(0.5)
      .setScale(0.4);
    this.add
      .text(this.width / 2.31, this.height / 2.2, `${this.score} Pts`, statsStyle)
      .setOrigin(0.5);

    //in multiplayer: top line is player 1, below is player 2
    if (this.isMultiplayer) {
      this.add.text(this.width / 4, this.height / 2.2, 'P1', statsStyle).setOrigin(0.5);
      this.add.text(this.width / 4, this.height / 2.2 + 40, 'P2', statsStyle).setOrigin(0.5);

      this.add
        .text(this.width / 2.31, this.height / 2.2 + 40, `${this.score2} Pts`, statsStyle)
        .setOrigin(0.5);
      this.add
        .text(this.width / 1.67, this.height / 2.2 + 40, ` ${this.distance2} Km`, statsStyle)
        .setOrigin(0.5);
    }

    const playAgainButton = this.add
      .image(this.width / 2, this.height / 1.8, 'gameover-play-again')
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.4);

    const lobbyButton = this.add
      .image(this.width / 2, this.height / 1.5, 'gameover-menu-btn')
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.4);
    positionAccessibleControls(this, [
      [retryGame, playAgainButton],
      [backToHomeScreen, lobbyButton],
    ]);

    // Hover state for buttons

    playAgainButton.on('pointerover', () => {
      this.selectButton(playAgainButton);
    });

    playAgainButton.on('pointerout', () => {
      this.deselectButton(playAgainButton);
    });

    lobbyButton.on('pointerover', () => {
      this.selectButton(lobbyButton);
    });

    lobbyButton.on('pointerout', () => {
      this.deselectButton(lobbyButton);
    });

    // Click events
    playAgainButton.on('pointerdown', () => {
      this.scene.start('GameScene', {
        isMultiplayer: this.isMultiplayer,
      });
    });

    lobbyButton.on('pointerdown', () => {
      const gameMode = this.registry.get('gameMode');

      if (gameMode === 'christmas') {
        this.scene.start('ChristmasScene');
      } else {
        this.scene.start('MenuScene');
      }
    });

    this.selectButton = (button) => {
      this.tweens.add({
        targets: button,
        scale: 0.45,
        duration: 100,
      });
    };

    this.deselectButton = (button) => {
      this.tweens.add({
        targets: button,
        scale: 0.4,
        duration: 100,
      });
    };

    // Menu button array and selected index
    this.Buttons = [
      {
        button: playAgainButton,
        action: () => this.scene.start('GameScene', { isMultiplayer: this.isMultiplayer }),
      },
      {
        button: lobbyButton,
        action: () => {
          const gameMode = this.registry.get('gameMode');
          if (gameMode === 'christmas') {
            this.scene.start('ChristmasScene');
          } else {
            this.scene.start('MenuScene');
          }
        },
      },
    ];

    this.selectedIndex = 0;

    this.selectButton(this.Buttons[0].button);
  }
  update() {
    this.InputManager.update();
    if (this.InputManager.getControlsP1.button1) {
      this.deselectButton(
        this.Buttons[this.selectedIndex].button,
        this.Buttons[this.selectedIndex].y,
      );

      this.selectedIndex--;

      if (this.selectedIndex < 0) {
        this.selectedIndex = this.Buttons.length - 1;
      }

      this.selectButton(
        this.Buttons[this.selectedIndex].button,
        this.Buttons[this.selectedIndex].y,
      );
    }
    if (this.InputManager.getControlsP1.button3) {
      this.deselectButton(
        this.Buttons[this.selectedIndex].button,
        this.Buttons[this.selectedIndex].y,
      );

      this.selectedIndex++;

      if (this.selectedIndex >= this.Buttons.length) {
        this.selectedIndex = 0;
      }

      this.selectButton(
        this.Buttons[this.selectedIndex].button,
        this.Buttons[this.selectedIndex].y,
      );
    }
    if (this.InputManager.getControlsP1.button2) {
      this.Buttons[this.selectedIndex].action?.();
    }
  }
}
