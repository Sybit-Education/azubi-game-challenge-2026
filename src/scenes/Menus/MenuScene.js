/* global Phaser */

import { positionAccessibleControls } from '../../accessibility/positionControls.js';

import InputManager from '../../objects/InputManager.js';
import CreditsScene from '../CreditsScene.js';
import { GameData } from './GameDate.js';

export default class MenuScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('MenuScene');
  }

  // Pre load images
  preload() {
    this.load.image('homepage-2player', 'sprites/Homepage/2Multiplayer.png');
    this.load.image('homepage-hintergrund', 'sprites/Homepage/Default Homepage/background.png');
    this.load.image(
      'WeCreateCXChampions',
      'sprites/Homepage/Default Homepage/WeCreateCXChampions.png',
    );
    this.load.image('homepage-title', 'sprites/Homepage/Default Homepage/SYBIT KART.png');
    this.load.image('homepage-leaderboard-btn','sprites/Gameover Scene Assets/Leaderboard placeholder button.png');
    this.load.image('homepage-play-btn', 'sprites/Homepage/Default Homepage/playButton.png');
    this.load.image('homepage-settings', 'sprites/Homepage/Default Homepage/settingsButton.png');
    this.load.image('homepage-car', 'sprites/Homepage/Default Homepage/car.png');
    this.load.image('homepage-credits', 'sprites/Homepage/Default Homepage/creditsButton.png');
<<<<<<< HEAD
    this.load.image('leaderboard-homepage-btn','sprites/Gameover Scene Assets/Hauptmenü 1.png')
=======
    this.load.image('homepage-anleitung', 'sprites/Homepage/Default Homepage/anleitungButton.png');
>>>>>>> main
    this.load.image(
      'homepage-barrierefreiheit',
      'sprites/Homepage/Default Homepage/barrierefreiheitButton.png',
    );
  }

  // Create scene
  create() {
    console.log('PHASER.VERSION: ' + Phaser.VERSION);

    // Create InputManager instance and initialize it
    // Create InputManager instance and initialize it
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    const playBtn = document.getElementById('start-game');
    const settingsBtn = document.getElementById('settings-btn');
    const menu = document.getElementById('accessible-ui');
    menu.hidden = false;

    const startGame = () => {
      this.registry.set('gameMode', 'standard');
      this.scene.start('LoadingScene', { isMultiplayer: false });
    };

    const openSettings = () => {
      this.scene.launch('PopUpScene');
    };

    playBtn.addEventListener('click', startGame);
    playBtn.focus();
    settingsBtn.addEventListener('click', openSettings);

    this.events.once('shutdown', () => {
      playBtn.removeEventListener('click', startGame);
      settingsBtn.removeEventListener('click', openSettings);
      menu.hidden = true;
    });

    // Interface for our lovely Sybit Kart Game

    const footer_btn_y = this.scale.height / 1.17;

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(-2);

    this.add
      .image(this.scale.width / 2, this.scale.height / 1.08, 'WeCreateCXChampions')
      .setOrigin(0.5)
      .setScale(0.3)
      .setDepth(-1);

    this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5)
      .setDepth(-1);

    const play_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 2.2, 'homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    const twoPlayerButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 2.2, 'homepage-2player')
      .setOrigin(0.5)
      .setScale(0.278)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.8, 'homepage-settings')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    const creditsButton = this.add
      .image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    const AnleitungsButton = this.add
      .image(this.scale.width / 8, footer_btn_y, 'homepage-anleitung')
      .setOrigin(0.5)
      .setScale(0.3)
      .setInteractive({ useHandCursor: true });

    this.add
      .image(this.scale.width, this.scale.height / 1.5, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

<<<<<<< HEAD
      //Playbutton test
    play_button.on('pointerdown', () => {
      GameData.playerName ='bob'; 
      //Testname
      this.registry.set('gameMode', 'standard');
      this.scene.start('LoadingScene', { isMultiplayer: false });
    });
=======
    // Some variables to keep track of the button states
    let isPlayHovered = false;
    let isTwoPlayerHovered = false;
    let hideSubmenuEvent;
    const playOriginalY = play_button.y;
    const settingsOriginalY = settings_button.y;
    const creditsOriginalY = creditsButton.y;
    const AnleitungsOriginalY = AnleitungsButton.y;
>>>>>>> main

    // Functions

<<<<<<< HEAD
    hitboxVisual.on('pointerdown', () => {
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });
    //logik um multiplayer zu starten
    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });
    //Leaderboard Button auf dem hauptmenu
 const leaderboardButton = this.add
    .image(
      this.scale.width / 2,  //xachse//
      this.scale.height / 1.17,//Yachse//
      'homepage-leaderboard-btn'
    )
    .setScale(0.24)
    .setOrigin(0.5)
    .setInteractive();

  leaderboardButton.on('pointerdown', () => {
    this.scene.start('LeaderboardScene')
  });

    //Den Rest hier lasse ich Erstmal, weil ich nichts gelesen habe und vielleicht braucht man was davon später (Beim Optimieren kann man eventuell den Rest löschen)
    /*
    // Button genator wrapper
    const createButton = (x, y, label) => {
      const button = this.add
        .image(x, y, 'playButton')
        .setScale(0.37 * uiScale)
        .setInteractive();

      const text = this.add
        .text(x, y, label, {
          fontFamily: 'Tiny5',
          fontSize: `${62 * uiScale}px`,
          color: '#464646',
        })
        .setOrigin(0.5);

      return { button, text };
=======
    const cancelScheduledHide = () => {
      if (hideSubmenuEvent) {
        this.time.removeEvent(hideSubmenuEvent);
        hideSubmenuEvent = undefined;
      }
>>>>>>> main
    };

    const scheduleHide = () => {
      cancelScheduledHide();
      hideSubmenuEvent = this.time.delayedCall(180, () => {
        hideSubmenuEvent = undefined;
        if (isPlayHovered || isTwoPlayerHovered) {
          return;
        }

        this.tweens.killTweensOf(twoPlayerButton);
        this.tweens.add({
          targets: twoPlayerButton,
          x: play_button.x,
          duration: 150,
          onComplete: () => {
            if (!isPlayHovered && !isTwoPlayerHovered) {
              twoPlayerButton.setVisible(false);
            }
          },
        });
      });
    };

    const revealTwoPlayerButton = () => {
      cancelScheduledHide();
      this.tweens.killTweensOf(twoPlayerButton);
      twoPlayerButton.setVisible(true);
      this.tweens.add({
        targets: twoPlayerButton,
        x: play_button.x + 325,
        y: play_button.y - 3,
        duration: 150,
      });
    };

    play_button.on('pointerover', () => {
      isPlayHovered = true;
      revealTwoPlayerButton();
      this.tweens.add({
        targets: play_button,
        scaleX: 0.32,
        scaleY: 0.32,
        y: playOriginalY - 5,
        duration: 50,
      });
    });

    play_button.on('pointerout', () => {
      isPlayHovered = false;
      this.tweens.add({
        targets: play_button,
        scaleX: 0.3,
        scaleY: 0.3,
        y: playOriginalY,
        duration: 50,
      });

      scheduleHide();
    });

    twoPlayerButton.on('pointerover', () => {
      isTwoPlayerHovered = true;
      twoPlayerButton.setDepth(-1);
      cancelScheduledHide();
      if (!isPlayHovered && isTwoPlayerHovered) {
        this.tweens.add({
          targets: play_button,
          scaleX: 0.32,
          scaleY: 0.32,
          y: playOriginalY - 5,
          duration: 50,
        });
      }
    });

    twoPlayerButton.on('pointerout', () => {
      isTwoPlayerHovered = false;
      twoPlayerButton.setDepth(0);
      scheduleHide();
      if (!isPlayHovered && isTwoPlayerHovered) {
        this.tweens.add({
          targets: play_button,
          scaleX: 0.3,
          scaleY: 0.3,
          y: playOriginalY - 5,
          duration: 50,
        });
      }
    });

    settings_button.on('pointerover', () => {
      this.tweens.add({
        targets: settings_button,
        scaleX: 0.32,
        scaleY: 0.32,
        y: settingsOriginalY - 5,
        duration: 50,
      });
    });

    creditsButton.on('pointerover', () => {
      this.tweens.add({
        targets: creditsButton,
        scaleX: 0.32,
        scaleY: 0.32,
        y: creditsOriginalY - 5,
        duration: 50,
      });
    });

    settings_button.on('pointerout', () => {
      this.tweens.add({
        targets: settings_button,
        scaleX: 0.3,
        scaleY: 0.3,
        y: settingsOriginalY,
        duration: 100,
      });
    });

    creditsButton.on('pointerout', () => {
      this.tweens.add({
        targets: creditsButton,
        scaleX: 0.3,
        scaleY: 0.3,
        y: creditsOriginalY,
        duration: 100,
      });
    });

    AnleitungsButton.on('pointerover', () => {
      this.tweens.add({
        targets: AnleitungsButton,
        scaleX: 0.32,
        scaleY: 0.32,
        y: AnleitungsOriginalY - 5,
        duration: 100,
      });
    });

    AnleitungsButton.on('pointerout', () => {
      this.tweens.add({
        targets: AnleitungsButton,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 100,
        y: AnleitungsOriginalY,
      });
    });

    // Click events

    positionAccessibleControls(this, [
      [playBtn, play_button],
      [settingsBtn, settings_button],
    ]);

    play_button.on('pointerdown', startGame);

    twoPlayerButton.on('pointerdown', () => {
      this.registry.set('gameMode', 'multiplayer');
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });

    settings_button.on('pointerdown', openSettings);

    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });

    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });
  }
}
