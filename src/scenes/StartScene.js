/* global Phaser */

import { positionAccessibleControls } from '../accessibility/positionControls.js';

import Car from '../objects/Car.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  preload() {
    this.load.image('car', 'sprites/Entities/Player Skins/Sybit Kart Player car 1.png');
    this.load.image('track', 'sprites/Race Track Assets/road.png');
    this.load.image('border', 'sprites/Race Track Assets/border.png');
    this.load.image('background', 'sprites/Map Skins/Hintergrund.png');
  }

  create() {
const startUi = document.getElementById("start-ui")
const skipIntroBtn = document.getElementById("skip-intro")
startUi.hidden = false



const skipIntro = () => {
  this.scene.start('GameScene', {
    isMultiplayer: this.isMultiplayer
  })
}

skipIntroBtn.addEventListener("click", skipIntro)
skipIntroBtn.focus();

this.events.once('shutdown', () => {
    skipIntroBtn.removeEventListener('click', skipIntro);
  startUi.hidden = true;
})



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
      .setInteractive();

    positionAccessibleControls(this, [[skipIntroBtn, skipButton]]);

    skipButton.on('pointerdown', () => {
      this.scene.start('GameScene', {
        isMultiplayer: this.isMultiplayer,
      });
    });
    this.createPlayer();
    this.createTrack();
    this.createWalls();
    this.setBackground('background');
  }

  setBackground(img) {
    const background = this.add.image(0, 0, img).setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
    background.setDepth(-10); // Set depth to -10 to ensure it is behind other objects
  }

  createPlayer() {
    if (this.isMultiplayer) {
      this.car = new Car(this, this.scale.width / 2 - 90, this.scale.height / 1.25);
      this.car.body.setSize(this.car.displayWidth * 1.25, this.car.displayHeight * 1.25);

      this.secondCar = new Car(
        this,
        this.scale.width / 2 + 90,
        this.scale.height / 1.25,
        'LEFT,RIGHT',
      );
      this.secondCar.body.setSize(
        this.secondCar.displayWidth * 1.25,
        this.secondCar.displayHeight * 1.25,
      );
      this.car.startAnim();
      this.secondCar.startAnim();
    } else {
      this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
      this.car.body.setSize(this.car.displayWidth * 1.25, this.car.displayHeight * 1.25);
      this.car.startAnim();
    }
  }

  createTrack() {
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);
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

  update() {
    if (this.car.y <= -300) {
      this.scene.start('GameScene', {
        isMultiplayer: this.isMultiplayer,
      });
    }
  }
}
