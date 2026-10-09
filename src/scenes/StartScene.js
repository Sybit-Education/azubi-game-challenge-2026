/* global Phaser */

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
    this.load.image('car', 'sprites/Entities/Player Skins/SybitKartPlayer1.png');
    this.load.image('track', 'sprites/Race Track Assets/road.png');
    this.load.image('border', 'sprites/Race Track Assets/border.png');
    this.load.image('background', 'sprites/Map Skins/Hintergrund.png');
    this.load.image('starting_Banner', 'sprites/Race Track Assets/starting_banner.png');
    this.load.image('startingLine', 'sprites/Race Track Assets/startingAndFinishLine.png');
    this.load.image('start-count-3', 'sprites/Race Track Assets/countdown3.png');
    this.load.image('start-count-2', 'sprites/Race Track Assets/countdown2.png');
    this.load.image('start-count-1', 'sprites/Race Track Assets/countdown1.png');
    this.load.image('start-go', 'sprites/Race Track Assets/goLabel.png');
    this.load.audio('countdown', 'audio/sfx/countdown.mp3');
  }

  create() {
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
    this.setBackground('background');
    this.spawnStartingBanner();

    //countdown
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
    background.setDepth(-10); // Set depth to -10 to ensure it is behind other objects
  }

  createPlayer() {
    if (this.isMultiplayer) {
      this.car = new Car(this, this.scale.width / 2 - 90, this.scale.height / 1.2);
      this.car.body.setSize(this.car.displayWidth * 1.25, this.car.displayHeight * 1.25);

      this.secondCar = new Car(
        this,
        this.scale.width / 2 + 90,
        this.scale.height / 1.2,
        'LEFT,RIGHT',
      );
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
    const s = this.scale.height / 900; // 900 = höhe, auf der die werte gepasst haben
    const roadWidth = this.track1.displayWidth;

    //banner so breit wie die straße (im bild sind die pfosten 1404px auseinander)
    const bannerScale = roadWidth / 1404;
    const bannerY = this.track1.y + this.track1.displayHeight / 2 - 20 * s;

    const startingLine = new StartingBanner(this, this.track1.x, bannerY);
    startingLine.setScale(bannerScale);
    startingLine.setDepth(21);

    //checkerboard auf dem boden, unter dem auto (depth 10) aber über der straße (depth -1)
    //der streifen im bild ist 264px breit, liegt bei den füßen vom banner
    const lineScale = roadWidth / 264;
    const checkerboard = new StartingLine(this, this.track1.x, bannerY + 248 * bannerScale);
    checkerboard.setScale(lineScale, lineScale * 0.4); // breite, höhe
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
    this.scene.start('GameScene', {
      isMultiplayer: this.isMultiplayer,
    });
  }

  update() {
    if (this.car.y <= -300) {
      this.goToGame();
    }
  }
}
