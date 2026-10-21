import Phaser from 'phaser';

import InputManager from '../objects/InputManager.js';
import { positionAccessibleControls } from '../accessibility/positionControls.js';

import Car from '../objects/Car.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';
import StartingBanner from '../objects/StartingBanner.js';
import StartingLine from '../objects/StartingLine.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  preload() {
    this.load.image('car', 'assets/images/entities/player-skins/sybit-kart-player-1.png');
    this.load.image('car2', 'assets/images/entities/player-skins/sybit-kart-player-2.png');
    this.load.image('track', 'assets/images/race-track-assets/road.png');
    this.load.image('border', 'assets/images/race-track-assets/border.png');
    this.load.image('background', 'assets/images/map-skins/hintergrund.png');
    this.load.image('starting-banner', 'assets/images/race-track-assets/starting-banner.png');
    this.load.image('starting-line', 'assets/images/race-track-assets/starting-and-finish-line.png');
    this.load.image('start-count-3', 'assets/images/race-track-assets/countdown-3.png');
    this.load.image('start-count-2', 'assets/images/race-track-assets/countdown-2.png');
    this.load.image('start-count-1', 'assets/images/race-track-assets/countdown-1.png');
    this.load.image('start-go', 'assets/images/race-track-assets/go-label.png');
    this.load.audio('countdown', 'assets/audio/sfx/countdown.mp3');
  }

  create() {
    this.inputManager = new InputManager(this);
    this.inputManager.create();

    this.leaving = false;
    this.secondCar = null;
    this.number = null;

    const startUi = document.getElementById('start-ui');
    const skipIntroBtn = document.getElementById('skip-intro');
    startUi.hidden = false;

    const skipIntro = () => {
      this.goToGame();
    };

    skipIntroBtn.addEventListener('click', skipIntro);
    skipIntroBtn.focus();

    this.events.once('shutdown', () => {
      skipIntroBtn.removeEventListener('click', skipIntro);
      startUi.hidden = true;
    });

    const skipButton = this.add
      .text(1300, 600, 'Skip Intro!', {
        fontSize: '32px',
        backgroundColor: '#000000',
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setInteractive();

    positionAccessibleControls(this, [[skipIntroBtn, skipButton]]);

    skipButton.on('pointerdown', () => {
      this.goToGame();
    });
    this.createPlayer();
    this.createTrack();
    this.createWalls();
    this.setBackground(
      this.registry.get('gameMode') === 'christmas' ? 'background-winter' : 'background',
    );
    this.spawnStartingBanner();
    this.time.delayedCall(1500, () => this.countdown());
  }

  countdown() {
    this.showNumber('start-count-3');
    this.sound.play('countdown');
    this.time.delayedCall(900, () => this.showNumber('start-count-2'));
    this.time.delayedCall(1800, () => this.showNumber('start-count-1'));
    this.time.delayedCall(2700, () => {
      this.showNumber('start-go');
      this.car.startAnim();
      if (this.secondCar) {
        this.secondCar.startAnim();
      }
    });
    this.time.delayedCall(4000, () => this.number.destroy());
  }

  setBackground(img) {
    const background = this.add.image(0, 0, img).setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
    background.setDepth(-10);
  }

  createPlayer() {
    if (this.isMultiplayer) {
      this.car = new Car(this, this.scale.width / 2 - 90, this.scale.height / 1.2);
      this.car.body.setSize(this.car.displayWidth * 1.25, this.car.displayHeight * 1.25);

      this.secondCar = new Car(this, this.scale.width / 2 + 90, this.scale.height / 1.2, 'car2');
      this.secondCar.body.setSize(
        this.secondCar.displayWidth * 1.25,
        this.secondCar.displayHeight * 1.25,
      );
    } else {
      this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.2);
      this.car.body.setSize(this.car.displayWidth * 1.25, this.car.displayHeight * 1.25);
    }
  }

  createTrack() {
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);
  }

  spawnStartingBanner() {
    const s = this.scale.height / 900;
    const roadWidth = this.track1.displayWidth;

    // The banners are 1404 pixels apart, so this scale matches them to the road
    const bannerScale = roadWidth / 1404;
    const bannerY = this.track1.y + this.track1.displayHeight / 2 - 20 * s;

    const startingLine = new StartingBanner(this, this.track1.x, bannerY);
    startingLine.setScale(bannerScale);
    startingLine.setDepth(21);

    // The checkerboard is 264 pixels wide and must render above the road but below cars
    const lineScale = roadWidth / 264;
    const checkerboard = new StartingLine(this, this.track1.x, bannerY + 248 * bannerScale);
    checkerboard.setScale(lineScale, lineScale * 0.4);
    checkerboard.setDepth(5);
  }

  createWalls() {
    const screenCenterX = this.scale.width / 2;
    const roadHalfWidth = this.track1.displayWidth / 2;

    const wall1 = new Border(this, 0, 0);
    const wall2 = new Border(this, 0, 0);
    const wall3 = new Border(this, 0, -this.scale.height);
    const wall4 = new Border(this, 0, -this.scale.height);
    const wallHalfWidth = wall1.displayWidth / 2;

    wall1.x = screenCenterX - roadHalfWidth - wallHalfWidth;
    wall2.x = screenCenterX + roadHalfWidth + wallHalfWidth;
    wall3.x = screenCenterX - roadHalfWidth - wallHalfWidth;
    wall4.x = screenCenterX + roadHalfWidth + wallHalfWidth;

    wall2.setFlipX(true);
    wall4.setFlipX(true);

    this.walls = [wall1, wall2, wall3, wall4];
  }

  showNumber(key) {
    if (this.number) {
      this.number.destroy();
    }
    this.number = this.add.image(this.scale.width / 2, this.scale.height * 0.2, key);
    this.number.setScale(0.8);
    this.number.setDepth(22);
  }

  goToGame() {
    if (this.leaving) {
      return;
    }
    this.leaving = true;
    this.sound.stopByKey('countdown');
    this.scene.start('GameScene', {
      isMultiplayer: this.isMultiplayer,
    });
  }

  update() {
    if (this.car.y <= -300) {
      this.goToGame();
    }
    this.inputManager.update();
    if (
      this.inputManager.getControlsP1.button4 ||
      this.inputManager.getControlsP1.button2 ||
      this.inputManager.getControlsP2.button4 ||
      this.inputManager.getControlsP2.button2
    ) {
      this.goToGame();
    }
  }
}
