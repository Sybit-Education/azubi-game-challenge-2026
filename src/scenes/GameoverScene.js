import Phaser from 'phaser';

import InputManager from '../objects/InputManager.js';
import { positionAccessibleControls } from '../accessibility/positionControls.js';
import { parseLeaderboard } from './LeaderboardScene.js';

export default class GameoverScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('GameoverScene');
  }

  // On init
  init(data) {
    this.distance = data.distance;
    this.score = data.score;
    this.distance2 = data.distance2; //added player 2 score and distance
    this.score2 = data.score2;
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  // Pre load scene
  preload() {
    this.load.image('gameover-title', 'assets/images/gameover-scene-assets/game-over.png');
    this.load.image(
      'gameover-play-again',
      'assets/images/gameover-scene-assets/nochmal-spielen.png',
    );
    this.load.image('p1-won-logo', 'assets/images/gameover-scene-assets/player-1-won.png')
    this.load.image('p2-won-logo', 'assets/images/gameover-scene-assets/player-2-won.png')
    this.load.image('gameover-menu-btn', 'assets/images/gameover-scene-assets/hauptmenu-1.png');
    this.load.image('gameover-score-text', 'assets/images/gameover-scene-assets/score.png');
    this.load.image('gameover-distance-text', 'assets/images/gameover-scene-assets/distanz.png');
    this.load.image(
      'gameover-hintergrund',
      'assets/images/gameover-scene-assets/game-over-hintergrund.png',
    );
  }

  // On create
  create() {
    // Parse leaderboard
    const leaderboard = parseLeaderboard();

    const savePlayerBest = (name, distance) => {
      const playerKey = name.trim();
      const existingEntry = leaderboard.find((entry) => entry.name.trim() === playerKey);

      if (existingEntry) {
        existingEntry.distance = Math.max(existingEntry.distance, Number(distance));
      } else {
        leaderboard.push({ name, distance: Number(distance) });
      }
    };

    savePlayerBest(localStorage.getItem('Playername') || 'Unknown', this.distance);
    if (this.isMultiplayer) {
      savePlayerBest(localStorage.getItem('Playername2') || 'Unknown', this.distance2);
    }

    // Sorts leaderboard
    leaderboard.sort((a, b) => b.distance - a.distance);

    // Saves each player's best distance; the leaderboard scene displays only the top 10.
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Debug log leader
    console.debug(leaderboard);

    // Wrapper variables
    this.width = this.scale.width;
    this.height = this.scale.height;

    // Create input manager
    this.InputManager = new InputManager(this);

    // Setup input manager
    this.InputManager.create();

    // Gets elements by id
    const gameOverUi = document.getElementById('game-over-ui');
    const finalScore = document.getElementById('final-score');
    const distance = document.getElementById('final-distance');
    const retryGame = document.getElementById('retry');
    const backToHomeScreen = document.getElementById('back-to-home');

    // Makes ui visable
    gameOverUi.hidden = false;

    // Fill in data
    finalScore.textContent = this.score;
    distance.textContent = this.distance;
    if (this.isMultiplayer) {
      finalScore.textContent = `player 1: ${this.score}, player 2: ${this.score2}`;
      distance.textContent = `player 1: ${this.distance}, player 2: ${this.distance2}`;
    }

    // Retry function
    const retryFunction = () => {
      this.scene.start('GameScene', {
        isMultiplayer: this.isMultiplayer,
      });
    };

    // Back to home function
    const backToHomeFunction = () => {
      this.scene.start(
        this.registry.get('gameMode') === 'christmas' ? 'ChristmasScene' : 'MenuScene',
      );
    };

    // Register listener
    retryGame.addEventListener('click', retryFunction);
    backToHomeScreen.addEventListener('click', backToHomeFunction);

    // Auto focus retry button
    retryGame.focus();

    // Shutdown listener
    this.events.once('shutdown', () => {
      retryGame.removeEventListener('click', retryFunction);
      backToHomeScreen.removeEventListener('click', backToHomeFunction);

      // Hides ui
      gameOverUi.hidden = true;
    });

    // Wrapper variables
    this.width = this.scale.width;
    this.height = this.scale.height;

    // Background
    this.add
      .image(this.width / 2, this.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    // Style for stats
    const statsStyle = {
      fontSize: '30px',
    };

    // Header

    let winner = 0;

    if (this.isMultiplayer) {
      if (this.score > this.score2) {
        winner = 1;
      }

      else if (this.distance > this.distance2) {
        winner = 1
      } 

      else if (this.score2 > this.score) {
        winner = 2
      }

      else if (this.distance2 > this.distance) {
        winner = 2
      } 

      if (winner === 1) {
        this.add.image(this.width / 2, this.height / 3, "p1-won-logo")
      }

      else {
        this.add.image(this.width / 2, this.height / 3, "p2-won-logo")
      }
    }

    // Distance text
    this.add
      .image(this.width / 1.9, this.height / 2.2, 'gameover-distance-text')
      .setOrigin(0.5)
      .setScale(0.4);

    // Distance display
    this.add
      .text(this.width / 1.67, this.height / 2.2, ` ${this.distance} Km`, statsStyle)
      .setOrigin(0.5);

    // Score text
    this.add
      .image(this.width / 2.7, this.height / 2.2, 'gameover-score-text')
      .setOrigin(0.5)
      .setScale(0.4);

    // Score display
    this.add
      .text(this.width / 2.31, this.height / 2.2, `${this.score} Pts`, statsStyle)
      .setOrigin(0.5);

    //in multiplayer: top line is player 1, below is player 2
    if (this.isMultiplayer) {
      this.add.text(this.width / 4, this.height / 2.2, 'P1', statsStyle).setOrigin(0.5);
      this.add.text(this.width / 4, this.height / 2.2 + 40, 'P2', statsStyle).setOrigin(0.5);

      // Points text
      this.add
        .text(this.width / 2.31, this.height / 2.2 + 40, `${this.score2} Pts`, statsStyle)
        .setOrigin(0.5);

      // Distance text
      this.add
        .text(this.width / 1.67, this.height / 2.2 + 40, ` ${this.distance2} Km`, statsStyle)
        .setOrigin(0.5);
    }

    // Play again button
    const playAgainButton = this.add
      .image(this.width / 2, this.height / 1.8, 'gameover-play-again')
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.4);

    // Home page button
    const lobbyButton = this.add
      .image(this.width / 2, this.height / 1.5, 'gameover-menu-btn')
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.4);

    // Creates html hovers
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

  // On every frame
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
