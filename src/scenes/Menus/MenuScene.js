/* global Phaser */

import InputManager from '../../objects/InputManager.js';
import CreditsScene from '../CreditsScene.js';
import { GameData } from './GameDate.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('homepage-2player', 'sprites/Homepage/2Multiplayer.png');
    this.load.image('homepage-hintergrund', 'sprites/Homepage/Default Homepage/background.png');
    this.load.image('homepage-resonanz', 'sprites/Homepage/Default Homepage/Resonanz.png');
    this.load.image('homepage-title', 'sprites/Homepage/Default Homepage/SYBIT KART.png');
    this.load.image('homepage-leaderboard-btn','sprites/Gameover Scene Assets/Leaderboard placeholder button.png');
    this.load.image('homepage-play-btn', 'sprites/Homepage/Default Homepage/playButton.png');
    this.load.image('homepage-settings', 'sprites/Homepage/Default Homepage/settingsButton.png');
    this.load.image('homepage-car', 'sprites/Homepage/Default Homepage/car.png');
    this.load.image('homepage-credits', 'sprites/Homepage/Default Homepage/creditsButton.png');
    this.load.image('leaderboard-homepage-btn','sprites/Gameover Scene Assets/Hauptmenü 1.png');
    this.load.image('homepage-barrierefreiheit','sprites/Homepage/Default Homepage/barrierefreiheitButton.png');
  }

  create() {
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    const footer_btn_y = this.scale.height / 1.17;

    this.add.image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(-100);

    this.add.image(this.scale.width / 2, footer_btn_y * 1.1, 'homepage-resonanz')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add.image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5);

    const settings_button = this.add.image(this.scale.width / 5.7, this.scale.height / 1.55, 'homepage-settings')
      .setOrigin(0.5)
      .setScale(0.33)
      .setInteractive();

    const play_button = this.add.image(this.scale.width / 5.7, this.scale.height / 1.9, 'homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.33)
      .setInteractive();

    const twoPlayerButton = this.add.image(this.scale.width / 5.7, this.scale.height / 1.9, 'homepage-2player')
      .setOrigin(0.5)
      .setScale(0.278)
      .setDepth(-1);

    const hitAreaPadding = 12;
    const hitboxVisual = this.add.rectangle(
      twoPlayerButton.x,
      twoPlayerButton.y,
      twoPlayerButton.displayWidth + hitAreaPadding * 2,
      twoPlayerButton.displayHeight + hitAreaPadding * 2,
      0xff0000,
      0
    )
      .setOrigin(0.5)
      .setDepth(-2)
      .setInteractive();

    play_button.on('pointerover', () => {
      this.tweens.add({
        targets: [twoPlayerButton, hitboxVisual],
        x: play_button.x + 350,
        duration: 150,
      });
    });

    let isTwoPlayerHovered = false;

    hitboxVisual.on('pointerover', () => {
      isTwoPlayerHovered = true;
    });

    hitboxVisual.on('pointerout', () => {
      isTwoPlayerHovered = false;
      this.tweens.add({
        targets: [twoPlayerButton, hitboxVisual],
        x: this.scale.width / 5.7,
        duration: 150,
      });
    });

    play_button.on('pointerout', () => {
      this.time.delayedCall(0, () => {
        if (!isTwoPlayerHovered) {
          this.tweens.add({
            targets: [twoPlayerButton, hitboxVisual],
            x: this.scale.width / 5.7,
            duration: 150,
          });
        }
      });
    });

    const creditsButton = this.add.image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.27)
      .setInteractive()
      .setDepth(3);

    this.add.image(this.scale.width / 8, footer_btn_y, 'homepage-barrierefreiheit')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add.image(this.scale.width, this.scale.height / 1.5, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

    play_button.on('pointerdown', () => {
      GameData.playerName = 'bob';
      this.registry.set('gameMode', 'standard');
      this.scene.start('LoadingScene', { isMultiplayer: false });
    });

    settings_button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
    });

    hitboxVisual.on('pointerdown', () => {
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });

    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });

    const leaderboardButton = this.add.image(
      this.scale.width / 2,
      this.scale.height / 1.17,
      'homepage-leaderboard-btn'
    )
      .setScale(0.24)
      .setOrigin(0.5)
      .setInteractive();

    leaderboardButton.on('pointerdown', () => {
      this.scene.start('LeaderboardScene');
    });
  }

  update() {
    this.InputManager.update();
  }
}
