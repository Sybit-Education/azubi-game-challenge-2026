import Phaser from 'phaser';

import InputManager from '../objects/InputManager.js';
import {
  preloadMenuSounds,
  preloadCountdownSounds,
  playMenuClick,
  bindMenuFocusSounds,
} from '../../audio/sounds.js';
import { safePlay } from '../../audio/safePlay.js';

import { positionAccessibleControls } from '../accessibility/positionControls.js';

import Car from '../objects/Car.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';
import StartingBanner from '../objects/StartingBanner.js';
import StartingLine from '../objects/StartingLine.js';

/** Displays the starting grid and coordinates the countdown before gameplay. */
export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  /**
   * Receives the game-mode flags for this scene run.
   *
   * @param {{ isMultiplayer?: boolean, isChristmas?: boolean }} [data] - Flags forwarded to gameplay.
   * @returns {void}
   */
  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
    this.isChristmas = data?.isChristmas ?? false;
  }

  /**
   * Queues intro sounds, vehicles, scenery and countdown images for loading.
   *
   * @returns {void}
   */
  preload() {
    preloadMenuSounds(this);
    preloadCountdownSounds(this);
    this.load.image(
      'car',
      'assets/images/entities/player-skins/player-sprites/sybit-kart-player-1.png',
    );
    this.load.image(
      'car2',
      'assets/images/entities/player-skins/player-sprites/sybit-kart-player-2.png',
    );
    this.load.image('track', 'assets/images/race-track-assets/road.png');
    this.load.image('border', 'assets/images/race-track-assets/border.png');
    this.load.image('background', 'assets/images/map-skins/background-sybit-city.png');
    this.load.image('background-winter', 'assets/images/map-skins/background-winter-map.png');
    this.load.image('starting_Banner', 'assets/images/race-track-assets/starting-banner.png');
    this.load.image('startingLine', 'assets/images/race-track-assets/starting-and-finish-line.png');
    this.load.image('start-count-3', 'assets/images/race-track-assets/countdown-3.png');
    this.load.image('start-count-2', 'assets/images/race-track-assets/countdown-2.png');
    this.load.image('start-count-1', 'assets/images/race-track-assets/countdown-1.png');
    this.load.image('start-go', 'assets/images/race-track-assets/go-label.png');
  }

  /**
   * Builds the starting grid, binds skip controls and requests the countdown.
   *
   * @returns {void}
   */
  create() {
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    this.leaving = false;
    this.countdownStarted = false;
    this.secondCar = null;
    this.number = null;

    const startUi = document.getElementById('start-ui');
    const skipIntroBtn = document.getElementById('skip-intro');
    startUi.hidden = false;

    const skipIntro = () => {
      playMenuClick(this);
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

    skipButton.on('pointerdown', skipIntro);
    this.createPlayer();
    this.createTrack();
    this.createWalls();
    this.setBackground(
      this.registry.get('gameMode') === 'christmas' ? 'background-winter' : 'background',
    );
    this.spawnStartingBanner();
    this.countdown();
  }

  /**
   * Requests the countdown once, after checking cached audio and audio readiness.
   * Pending unlock and state-change listeners are removed on start or shutdown.
   *
   * @returns {void}
   */
  countdown() {
    if (this.leaving || this.countdownStarted) return;
    this.countdownStarted = true;

    const keys = ['countdown-3', 'countdown-2', 'countdown-1', 'countdown-go'];
    const missingKeys = keys.filter((key) => !this.cache.audio.exists(key));
    if (missingKeys.length > 0) {
      console.warn('Countdown audio missing:', missingKeys);
      return;
    }

    const context = this.sound.context;
    let cancelled = false;
    const cleanup = () => {
      cancelled = true;
      this.sound.off('unlocked', begin);
      context?.removeEventListener('statechange', begin);
      this.events.off('shutdown', cleanup);
    };
    const begin = () => {
      if (cancelled || this.leaving || this.sound.locked) return;
      if (context && context.state !== 'running') return;
      cleanup();
      this.prepareCountdownAudio();
    };

    this.events.once('shutdown', cleanup);
    this.sound.on('unlocked', begin);
    context?.addEventListener('statechange', begin);
    if (context?.state === 'suspended') {
      context
        .resume()
        .then(begin)
        .catch(() => {});
    }
    begin();
  }

  /**
   * Renders 1.5 seconds of digital silence before starting the countdown.
   * Without Web Audio, a scene timer preserves the intro delay instead. The
   * temporary source is stopped on shutdown; output keep-alive is separate.
   *
   * @returns {void}
   */
  prepareCountdownAudio() {
    const context = this.sound.context;
    if (!context) {
      this.time.delayedCall(1500, () => this.playCountdown());
      return;
    }

    const source = context.createBufferSource();
    source.buffer = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * 1.5),
      context.sampleRate,
    );
    source.connect(this.sound.destination);

    const cleanup = () => {
      source.onended = null;
      source.disconnect();
      this.events.off('shutdown', cancel);
    };
    const cancel = () => {
      cleanup();
      source.stop();
    };
    source.onended = () => {
      cleanup();
      if (!this.leaving) this.playCountdown();
    };
    this.events.once('shutdown', cancel);
    source.start();
  }

  /**
   * Starts the first sound and image, then schedules the remaining countdown.
   * Cars accelerate at Go. Scheduling aborts if Phaser rejects the first sound.
   *
   * @returns {void}
   */
  playCountdown() {
    if (!this.sound.play('countdown-3', { volume: 0.8 })) {
      console.warn('Countdown audio could not start.');
      return;
    }
    this.showNumber('start-count-3');

    this.time.delayedCall(900, () => {
      safePlay(this, 'countdown-2', { volume: 0.8 });
      this.showNumber('start-count-2');
    });

    this.time.delayedCall(1800, () => {
      safePlay(this, 'countdown-1', { volume: 0.8 });
      this.showNumber('start-count-1');
    });

    this.time.delayedCall(2700, () => {
      safePlay(this, 'countdown-go', { volume: 0.8 });
      this.showNumber('start-go');

      this.car.startAnim();
      if (this.secondCar) {
        this.secondCar.startAnim();
      }
    });

    this.time.delayedCall(4000, () => this.number.destroy());
    bindMenuFocusSounds(this, ['skip-intro']);
  }

  /**
   * Fits the chosen background texture behind the starting grid.
   *
   * @param {string} img - Key of the loaded background texture.
   * @returns {void}
   */
  setBackground(img) {
    const background = this.add.image(0, 0, img).setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
    background.setDepth(-10); // Set depth to -10 to ensure it is behind other objects
  }

  /**
   * Creates one or two cars according to the multiplayer flag.
   *
   * @returns {void}
   */
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

  /**
   * Creates the two vertically stacked road segments.
   *
   * @returns {void}
   */
  createTrack() {
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);
  }

  /**
   * Scales and positions the starting banner and line relative to the road.
   *
   * @returns {void}
   */
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

  /**
   * Places matching border pairs alongside both road segments.
   *
   * @returns {void}
   */
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

  /**
   * Replaces the previous countdown image with the selected texture.
   *
   * @param {string} key - Key of a loaded countdown image.
   * @returns {void}
   */
  showNumber(key) {
    if (this.number) {
      this.number.destroy();
    }
    this.number = this.add.image(this.scale.width / 2, this.scale.height * 0.2, key);
    this.number.setScale(0.8);
    this.number.setDepth(22);
  }

  /**
   * Stops countdown sounds and requests gameplay once, preserving mode flags.
   *
   * @returns {void}
   */
  goToGame() {
    if (this.leaving) {
      return;
    }
    this.leaving = true;
    this.sound.stopByKey('countdown');
    this.sound.stopByKey('countdown-3');
    this.sound.stopByKey('countdown-2');
    this.sound.stopByKey('countdown-1');
    this.sound.stopByKey('countdown-go');
    this.scene.start('GameScene', {
      isMultiplayer: this.isMultiplayer,
      isChristmas: this.isChristmas,
    });
  }

  /**
   * Checks for a completed start animation or a player request to skip the intro.
   *
   * @returns {void}
   */
  update() {
    if (this.car.y <= -300) {
      this.goToGame();
    }
    this.InputManager.update();
    if (
      this.InputManager.getControlsP1.button4 ||
      this.InputManager.getControlsP1.button2 ||
      this.InputManager.getControlsP2.button4 ||
      this.InputManager.getControlsP2.button2
    ) {
      this.goToGame();
    }
  }
}
