/* global Phaser */

import { GameData } from './Menus/GameDate.js';
import { positionAccessibleControls } from '../accessibility/positionControls.js';

export default class GameoverScene extends Phaser.Scene {
  constructor() {
    super('GameoverScene');
  }

  init(data) {
    this.distance = data.distance;
    this.score = data.score;
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  preload() {
    this.load.image('gameover-title', 'sprites/Gameover Scene Assets/GAME OVER.png');
    this.load.image('gameover-play-again', 'sprites/Gameover Scene Assets/Nochmal spielen.png');
    this.load.image('gameover-menu-btn', 'sprites/Gameover Scene Assets/Hauptmenü 1.png');
    this.load.image('gameover-score-text', 'sprites/Gameover Scene Assets/score_.png');
    this.load.image('gameover-distance-text', 'sprites/Gameover Scene Assets/Distanz_.png');
    this.load.image(
      'gameover-hintergrund',
      'sprites/Gameover Scene Assets/GAME OVER Hintergrund.png',
    );
  }
  //distance shit hier irgendwo
  create() {
  console.log('GameoverScene gestartet');

  const leaderboard = JSON.parse(
    localStorage.getItem('leaderboard') || '[]'
  ).map(entry => {
    if (typeof entry === 'string') {
      return {
        name: 'Unbekannt',
        distance: Number(entry)
      };
    }

    return {
      name: entry.name,
      distance: Number(entry.distance)
    };
  });

  leaderboard.push({
    name: GameData.playerName,
    distance: Number(this.distance),
  });

  leaderboard.sort((a, b) => b.distance - a.distance);

  localStorage.setItem(
    'leaderboard',
    JSON.stringify(leaderboard.slice(0, 10))
  );

  console.log(leaderboard);

  this.width = this.scale.width;
  this.height = this.scale.height; 
 }
  create() {
    const gameOverUi = document.getElementById('game-over-ui');
    const finalScore = document.getElementById('final-score');
    const distance = document.getElementById('final-distance');
    const retryGame = document.getElementById('retry');
    const backToHomeScreen = document.getElementById('back-to-home');
    gameOverUi.hidden = false;

    finalScore.textContent = this.score;
    distance.textContent = this.distance;
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
      this.tweens.add({
        targets: playAgainButton,
        scale: 0.45,
        duration: 100,
      });
    });

    playAgainButton.on('pointerout', () => {
      this.tweens.add({
        targets: playAgainButton,
        scale: 0.4,
        duration: 100,
      });
    });

    lobbyButton.on('pointerover', () => {
      this.tweens.add({
        targets: lobbyButton,
        scale: 0.45,
        duration: 100,
      });
    });

    lobbyButton.on('pointerout', () => {
      this.tweens.add({
        targets: lobbyButton,
        scale: 0.4,
        duration: 100,
      });
    });

    // Click events
   playAgainButton.on('pointerdown', () => {
  this.scene.start('NameInputScene', {
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
  }
}
  

