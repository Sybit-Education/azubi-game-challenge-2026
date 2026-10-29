import Phaser from 'phaser';

import InputManager from '../objects/InputManager.js';
import {
  preloadMenuSounds,
  preloadGameplaySounds,
  playMenuClick,
  bindMenuFocusSounds,
} from '../../audio/sounds.js';

import { positionAccessibleControls } from '../accessibility/positionControls.js';
import {
  signEntry,
  createSessionToken,
  loadLeaderboard,
  saveLeaderboard,
} from '../utils/leaderboardSecurity.js';

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
    preloadMenuSounds(this);
    preloadGameplaySounds(this);
    this.load.image('gameover-title', 'assets/images/gameover-scene-assets/game-over.png');
    this.load.image(
      'gameover-play-again',
      'assets/images/gameover-scene-assets/play-again-button.png',
    );
    this.load.image('p1-won-logo', 'assets/images/gameover-scene-assets/player-1-won.png');
    this.load.image('p2-won-logo', 'assets/images/gameover-scene-assets/player-2-won.png');
    this.load.image(
      'gameover-menu-btn',
      'assets/images/gameover-scene-assets/back-to-menu-button.png',
    );
    this.load.image('gameover-score-text', 'assets/images/gameover-scene-assets/score.png');
    this.load.image('gameover-distance-text', 'assets/images/gameover-scene-assets/distance.png');
    this.load.image(
      'gameover-hintergrund',
      'assets/images/gameover-scene-assets/game-over-hintergrund.png',
    );
  }

  // On create
  async create() {
    // Parse leaderboard
    await document.fonts.load('32px Silkscreen');
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);

    const { entries: leaderboard, isTampered } = await loadLeaderboard();

    // Session token: stable for this browser tab, unknown to an attacker
    // opening a fresh tab or window.  It is included in the HMAC so any entry
    // forged without it will fail signature verification.
    const sessionToken = createSessionToken();

    /**
     * Upserts the player's best result into the in-memory leaderboard array
     * and returns the final entry object (not yet signed).
     */
    const upsertPlayerBest = (name, distance, score) => {
      const playerKey = (name || 'Unbekannt').trim() || 'Unbekannt';
      const dist = Number(distance) || 0;
      const sc = Number(score) || 0;

      const existing = leaderboard.find(
        (e) => (e.name ?? 'Unbekannt').trim().toLowerCase() === playerKey.toLowerCase(),
      );

      if (existing) {
        // Tampered entries are replaced by the real run so they are never re-signed as-is
        const isBetter =
          dist > existing.distance || (dist === existing.distance && sc > existing.score);
        if (!existing.isTampered && !isBetter) return null;
        existing.distance = dist;
        existing.score = sc;
        existing.token = sessionToken;
        return existing;
      }

      const newEntry = { name: playerKey, distance: dist, score: sc, token: sessionToken };
      leaderboard.push(newEntry);
      return newEntry;
    };

    // Collect all entries that need (re-)signing this session
    const toSign = [];

    const p1Entry = upsertPlayerBest(
      localStorage.getItem('Playername') || 'Unknown',
      this.distance,
      this.score,
    );
    if (p1Entry) toSign.push(p1Entry);

    if (this.isMultiplayer) {
      const p2Entry = upsertPlayerBest(
        localStorage.getItem('Playername2') || 'Unknown',
        this.distance2,
        this.score2,
      );
      if (p2Entry) toSign.push(p2Entry);
    }

    // Re-sign only the entries touched this session
    for (const entry of toSign) {
      const signed = await signEntry(entry);
      entry.sig = signed.sig;
      entry.isTampered = false;
    }

    // Sort descending by distance, then by score as tiebreaker
    leaderboard.sort((a, b) => b.distance - a.distance || b.score - a.score);

    // Persist to localStorage
    await saveLeaderboard(leaderboard, { isTampered });

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

    const totalScore = (this.score ?? 0) + (this.isMultiplayer ? (this.score2 ?? 0) : 0);

    const coinCount = Math.floor(totalScore / 50);

    if (coinCount > 0) {
      const countingSound = this.sound.add('collect-coin', {
        volume: 0.3,
        rate: 10,
      });

      let remainingCoins = coinCount;

      const playNextCoin = () => {
        if (remainingCoins === 0) return;

        remainingCoins -= 1;
        countingSound.play();
      };

      countingSound.on('complete', playNextCoin);

      this.events.once('shutdown', () => {
        countingSound.off('complete', playNextCoin);
        countingSound.destroy();
      });

      playNextCoin();
    }

    // Retry function
    const retryFunction = () => {
      playMenuClick(this);
      this.scene.start('GameScene', {
        isMultiplayer: this.isMultiplayer,
      });
    };

    // Back to home function
    const backToHomeFunction = () => {
      playMenuClick(this);
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
    this.background = this.add
      .image(this.width / 2, this.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    // Style for stats
    const statsStyle = {
      fontSize: `${30 * this.scaleFactor}px`,
      fontFamily: 'Silkscreen',
    };

    // Header

    let winner = 0;

    if (this.isMultiplayer) {
      if (this.score > this.score2) {
        winner = 1;
      } else if (this.distance > this.distance2) {
        winner = 1;
      } else if (this.score2 > this.score) {
        winner = 2;
      } else if (this.distance2 > this.distance) {
        winner = 2;
      }

      if (winner === 1) {
        this.title = this.add.image(this.width / 2, this.height / 3, 'p1-won-logo');
      } else {
        this.title = this.add.image(this.width / 2, this.height / 3, 'p2-won-logo');
      }
    }

    if (!this.isMultiplayer) {
      this.title = this.add
        .image(this.width / 2, this.height / 3, 'gameover-title')
        .setOrigin(0.5)
        .setScale(0.6);
    }

    // the won logos have scale 1, gameover-title has 0.6
    this.titleScale = this.isMultiplayer ? 1 : 0.6;

    // Distance text
    this.distanceLabel = this.add
      .image(this.width / 1.9, this.height / 5, 'gameover-distance-text')
      .setOrigin(0.5)
      .setScale(0.4);

    // Distance display
    this.distanceText = this.add
      .text(this.width / 1.67, this.height / 2.2, ` ${this.distance} Km`, statsStyle)
      .setOrigin(0.5);

    // Score text
    this.scoreLabel = this.add
      .image(this.width / 2.7, this.height / 2.2, 'gameover-score-text')
      .setOrigin(0.5)
      .setScale(0.4);

    // Score display
    this.scoreText = this.add
      .text(this.width / 2.31, this.height / 2.2, `${this.score} Pts`, statsStyle)
      .setOrigin(0.5);

    //in multiplayer: top line is player 1, below is player 2
    if (this.isMultiplayer) {
      this.p1Label = this.add
        .text(this.width / 4, this.height / 2.2, 'P1', statsStyle)
        .setOrigin(0.5);
      this.p2Label = this.add
        .text(this.width / 4, this.height / 2.2 + 40, 'P2', statsStyle)
        .setOrigin(0.5);

      // Points text
      this.scoreText2 = this.add
        .text(this.width / 2.31, this.height / 2.2 + 40, `${this.score2} Pts`, statsStyle)
        .setOrigin(0.5);

      // Distance text
      this.distanceText2 = this.add
        .text(this.width / 1.67, this.height / 2.2 + 40, ` ${this.distance2} Km`, statsStyle)
        .setOrigin(0.5);
    }

    // Play again button
    this.playAgainButton = this.add
      .image(this.width / 2, this.height / 1.8, 'gameover-play-again')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScale(0.4);

    // Home page button
    this.lobbyButton = this.add
      .image(this.width / 2, this.height / 1.5, 'gameover-menu-btn')
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScale(0.4);

    // Creates html hovers
    positionAccessibleControls(this, [
      [retryGame, this.playAgainButton],
      [backToHomeScreen, this.lobbyButton],
    ]);

    // Hover state for buttons

    this.playAgainButton.on('pointerover', () => {
      this.selectButton(this.playAgainButton);
    });

    this.playAgainButton.on('pointerout', () => {
      this.deselectButton(this.playAgainButton);
    });

    this.lobbyButton.on('pointerover', () => {
      this.selectButton(this.lobbyButton);
    });

    this.lobbyButton.on('pointerout', () => {
      this.deselectButton(this.lobbyButton);
    });

    // Click events
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);
    this.playAgainButton.on('pointerdown', retryFunction);
    this.lobbyButton.on('pointerdown', backToHomeFunction);
    bindMenuFocusSounds(this, ['retry', 'back-to-home']);
    this.selectButton = (button) => {
      this.tweens.add({
        targets: button,
        scale: 0.45 * this.scaleFactor,
        duration: 100,
      });
    };

    this.deselectButton = (button) => {
      this.tweens.add({
        targets: button,
        scale: 0.4 * this.scaleFactor,
        duration: 100,
      });
    };

    // Menu button array and selected index
    this.Buttons = [
      {
        button: this.playAgainButton,
        action: retryFunction,
      },
      {
        button: this.lobbyButton,
        action: backToHomeFunction,
      },
    ];

    this.selectedIndex = 0;

    this.selectButton(this.Buttons[0].button);

    this.resize({
      width: this.scale.width,
      height: this.scale.height,
    });

    this.scale.on('resize', this.resize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
    });
  }

  // On every frame
  update() {
    // During rare error paths `create()` may not finish (e.g. crypto errors).
    // Avoid crashing the whole game loop if InputManager wasn't initialized.
    if (this.InputManager?.update) {
      this.InputManager.update();
    } else {
      return;
    }

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

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    const scaleFactor = Math.min(width / 1920, height / 1080);

    this.background.setPosition(width / 2, height / 2).setDisplaySize(width, height);

    this.title.setPosition(width / 2, height / 3).setScale(this.titleScale * scaleFactor);

    this.distanceLabel.setPosition(width / 1.8, height / 2.3).setScale(0.4 * scaleFactor);

    this.distanceText.setPosition(width / 1.8, height / 2.1).setFontSize(30 * scaleFactor);

    this.scoreLabel.setPosition(width / 2.31, height / 2.3).setScale(0.4 * scaleFactor);

    this.scoreText.setPosition(width / 2.31, height / 2.1).setFontSize(30 * scaleFactor);

    if (this.isMultiplayer) {
      this.p1Label.setPosition(width / 2.8, height / 2.1).setFontSize(30 * scaleFactor);

      this.p2Label
        .setPosition(width / 2.8, height / 2.1 + 40 * scaleFactor)
        .setFontSize(30 * scaleFactor);

      this.scoreText2
        .setPosition(width / 2.31, height / 2.1 + 40 * scaleFactor)
        .setFontSize(30 * scaleFactor);

      this.distanceText2
        .setPosition(width / 1.8, height / 2.1 + 40 * scaleFactor)
        .setFontSize(30 * scaleFactor);

      this.playAgainButton.setPosition(width / 2, height / 1.6).setScale(0.4 * scaleFactor);

      this.lobbyButton.setPosition(width / 2, height / 1.4).setScale(0.4 * scaleFactor);
    } else {
      this.playAgainButton.setPosition(width / 2, height / 1.8).setScale(0.4 * scaleFactor);
      this.lobbyButton.setPosition(width / 2, height / 1.5).setScale(0.4 * scaleFactor);
    }
  }
}
