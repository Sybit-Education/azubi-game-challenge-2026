import Phaser from 'phaser';

export default class ChristmasScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('ChristmasScene');
  }

  // Pre load images
  preload() {
    this.load.image('christmas-homepage-2player', 'assets/images/homepage/2-multiplayer.png');
    //this.load.image('playButton', 'assets/images/button-template.png');
    this.load.image(
      'christmas-homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );
    this.load.image(
      'christmas-homepage-resonanz',
      'assets/images/homepage/default-homepage/resonanz.png',
    );
    this.load.image(
      'christmas-homepage-title',
      'assets/images/homepage/weihnachts-homepage/sybit-kart-weihnachtsthema.png',
    );
    this.load.image(
      'christmas-homepage-lights',
      'assets/images/homepage/weihnachts-homepage/die-lichterkette.png',
    );
    this.load.image(
      'christmas-homepage-play-btn',
      'assets/images/homepage/default-homepage/play-button.png',
    );
    this.load.image(
      'christmas-homepage-settings',
      'assets/images/homepage/default-homepage/settings-button.png',
    );
    this.load.image(
      'christmas-homepage-trees',
      'assets/images/homepage/weihnachts-homepage/bigger-trees.png',
    );
    this.load.image('christmas-homepage-car', 'assets/images/homepage/default-homepage/car.png');

    this.load.image('christmas-homepage-line', 'assets/images/homepage/default-homepage/line.png');
    this.load.image(
      'christmas-homepage-credits',
      'assets/images/homepage/default-homepage/credits-button.png',
    );
    this.load.image(
      'homepage-how-to-play',
      'assets/images/homepage/default-homepage/how-to-play-button.png',
    );
  }

  // Create scene
  create() {
    const footer_btn_y = this.scale.height / 1.17;
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);

    const background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'christmas-homepage-hintergrund')
      .setDisplaySize(this.scale.width * 1.01, this.scale.height * 1.01)
      .setDepth(-100);

    this.add
      .image(this.scale.width / 2, this.scale.height / 1.12, 'christmas-homepage-line')
      .setDisplaySize(this.scale.width - 175, 1)
      .setDepth(-2);

    this.add
      .image(this.scale.width / 2, this.scale.height / 3, 'christmas-homepage-title')
      .setOrigin(0.5)
      .setScale(0.5 * this.scaleFactor);

    const lights = this.add
      .image(this.scale.width / 2, this.scale.height / 6, 'christmas-homepage-lights')
      .setOrigin(0.5)
      .setScale(0.7 * this.scaleFactor);

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.55, 'christmas-homepage-settings')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setInteractive();

    const play_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'christmas-homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setInteractive();

    const twoPlayerButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'christmas-homepage-2player')
      .setOrigin(0.5)
      .setScale(0.275 * this.scaleFactor)
      .setDepth(-1)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    const creditsButton = this.add
      .image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor)
      .setInteractive();
    creditsButton.setDepth(3);

    this.add
      .image(this.scale.width / 1.3, footer_btn_y * 1.1, 'christmas-homepage-resonanz')
      .setOrigin(0.5)
      .setScale(0.4 * this.scaleFactor);

    const trees = this.add
      .image(this.scale.width / 3, this.scale.height, 'christmas-homepage-trees')
      .setOrigin(0.5, 1)
      .setScale(0.3 * this.scaleFactor);

    const howToPlayScale = 0.2;
    const howToPlayButton = this.add
      .image(this.scale.width / 8, footer_btn_y, 'homepage-how-to-play')
      .setOrigin(0.5)
      .setScale(howToPlayScale * this.scaleFactor)
      .setInteractive({ useHandCursor: true });

    const homepageCar = this.add
      .image(this.scale.width, this.scale.height / 1.45, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3 * this.scaleFactor);

    // Leaderboard button
    const leaderboardButton = this.add
      .image(this.scale.width / 2, this.scale.height / 1.17, 'homepage-leaderboard-btn')
      .setScale(0.24 * this.scaleFactor)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const hitAreaPadding = 12;
    const hitboxVisual = this.add
      .rectangle(
        twoPlayerButton.x,
        twoPlayerButton.y,
        twoPlayerButton.displayWidth + hitAreaPadding * 2,
        twoPlayerButton.displayHeight + hitAreaPadding * 2,
        0xff0000,
        0,
      )
      .setOrigin(0.5)
      .setDepth(-2)
      .setInteractive();

    // Some variables to keep track of the button states
    let isPlayHovered = false;
    let isTwoPlayerHovered = false;
    this.isMultiplayerSelected = false;
    let hideSubmenuEvent;
    const playOriginalY = play_button.y;
    const settingsOriginalY = settings_button.y;
    const creditsOriginalY = creditsButton.y;
    const howToPlayOriginalY = howToPlayButton.y;
    const cancelScheduledHide = () => {
      if (hideSubmenuEvent) {
        this.time.removeEvent(hideSubmenuEvent);
        hideSubmenuEvent = undefined;
      }
    };

    const scheduleHide = () => {
      cancelScheduledHide();
      hideSubmenuEvent = this.time.delayedCall(180, () => {
        hideSubmenuEvent = undefined;
        if (isPlayHovered || isTwoPlayerHovered || this.isMultiplayerSelected) {
          return;
        }

        this.tweens.killTweensOf(twoPlayerButton);
        this.tweens.add({
          targets: twoPlayerButton,
          x: play_button.x,
          y: play_button.y,
          alpha: 0.7,
          duration: 180,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            if (!isPlayHovered && !isTwoPlayerHovered) {
              twoPlayerButton.setVisible(false);
              twoPlayerButton.setAlpha(1);
            }
          },
        });
      });
    };

    const revealTwoPlayerButton = () => {
      cancelScheduledHide();
      this.tweens.killTweensOf(twoPlayerButton);
      this.tweens.add({
        targets: twoPlayerButton,
        x: play_button.x + 325 * this.scaleFactor,
        y: playOriginalY - 10 * this.scaleFactor,
        scaleX: (0.278 + 0.02) * this.scaleFactor,
        scaleY: (0.278 + 0.02) * this.scaleFactor,
        duration: 220,
        ease: 'Sine.easeOut',
      });
      this.time.delayedCall(100, () => {
        twoPlayerButton.setVisible(true);
      });
    };

    this.selectMultiplayerOption = () => {
      this.isMultiplayerSelected = true;
      revealTwoPlayerButton();
      twoPlayerButton.setDepth(1);
      this.selectButton(twoPlayerButton, playOriginalY - 3);
    };

    this.clearMultiplayerOption = () => {
      this.isMultiplayerSelected = false;
      twoPlayerButton.setDepth(0);
      this.deselectButton(twoPlayerButton, playOriginalY - 3);
      scheduleHide();
    };

    const startMultiplayer = () => {
      this.registry.set('isMultiplayer', true);
      this.registry.set('gameMode', 'christmas');
      this.scene.start('NameInputScene', { isMultiplayer: true });
    };
    this.startMultiplayer = startMultiplayer;

    twoPlayerButton.on('pointerover', () => {
      isTwoPlayerHovered = true;
      twoPlayerButton.setDepth(-1);
      cancelScheduledHide();
      if (!isPlayHovered && isTwoPlayerHovered) {
        this.selectButton(play_button, playOriginalY);

        this.tweens.add({
          targets: twoPlayerButton,
          y: playOriginalY - 10 * this.scaleFactor,
          duration: 50,
        });
      }
    });

    twoPlayerButton.on('pointerout', () => {
      isTwoPlayerHovered = false;
      isPlayHovered = false;
      twoPlayerButton.setDepth(0);
      if (twoPlayerButton.visible) {
        this.deselectButton(twoPlayerButton, playOriginalY, 0.278);
      }
      scheduleHide();
      if (!isPlayHovered && !isTwoPlayerHovered) {
        this.deselectButton(play_button, playOriginalY);
      }
    });

    this.selectButton = (button, originalY, scale = 0.3 * this.scaleFactor) => {
      this.tweens.add({
        targets: button,
        scaleX: scale + 0.02 * this.scaleFactor,
        scaleY: scale + 0.02 * this.scaleFactor,
        y: originalY - 10 * this.scaleFactor,
        duration: 50,
      });
    };

    this.deselectButton = (button, originalY, scale = 0.3) => {
      this.tweens.add({
        targets: button,
        scaleX: scale * this.scaleFactor,
        scaleY: scale * this.scaleFactor,
        y: originalY,
        duration: 50,
      });
    };

    play_button.on('pointerover', () => {
      isPlayHovered = true;
      revealTwoPlayerButton();
      this.selectButton(play_button, playOriginalY);
    });

    play_button.on('pointerout', () => {
      isPlayHovered = false;

      this.deselectButton(play_button, playOriginalY);

      if (twoPlayerButton.visible) {
        this.deselectButton(twoPlayerButton, playOriginalY, 0.278);
      }
      scheduleHide();
    });

    twoPlayerButton.on('pointerover', () => {
      isTwoPlayerHovered = true;
      twoPlayerButton.setDepth(-1);
      cancelScheduledHide();
      if (!isPlayHovered && isTwoPlayerHovered) {
        this.selectButton(this.play_button, playOriginalY - 10 * this.scaleFactor);
      }
    });

    twoPlayerButton.on('pointerout', () => {
      isTwoPlayerHovered = false;
      isPlayHovered = false;
      twoPlayerButton.setDepth(0);
      scheduleHide();
      if (!isPlayHovered && !isTwoPlayerHovered) {
        this.deselectButton(this.play_button, playOriginalY);
      }
    });

    settings_button.on('pointerover', () => {
      this.selectButton(settings_button, settingsOriginalY);
    });

    settings_button.on('pointerout', () => {
      this.deselectButton(settings_button, settingsOriginalY);
    });

    creditsButton.on('pointerover', () => {
      this.selectButton(creditsButton, creditsOriginalY);
    });

    creditsButton.on('pointerout', () => {
      this.deselectButton(creditsButton, creditsOriginalY);
    });

    settings_button.on('pointerout', () => {
      this.deselectButton(settings_button, settingsOriginalY);
    });

    creditsButton.on('pointerout', () => {
      this.deselectButton(creditsButton, creditsOriginalY);
    });

    howToPlayButton.on('pointerover', () => {
      this.selectButton(howToPlayButton, howToPlayOriginalY, howToPlayScale);
    });

    howToPlayButton.on('pointerout', () => {
      this.deselectButton(howToPlayButton, howToPlayOriginalY, howToPlayScale);
    });

    // Leaderboard click listener
    leaderboardButton.on('pointerdown', () => {
      this.scene.start('LeaderboardScene');
    });

    leaderboardButton.on('pointerover', () => {
      this.tweens.add({
        targets: leaderboardButton,
        scaleX: 0.26 * this.scaleFactor,
        scaleY: 0.26 * this.scaleFactor,
        duration: 100,
      });
    });

    leaderboardButton.on('pointerout', () => {
      this.tweens.add({
        targets: leaderboardButton,
        scaleX: 0.24 * this.scaleFactor,
        scaleY: 0.24 * this.scaleFactor,
        duration: 100,
      });
    });

    //Background parralax effect
    this.input.on('pointermove', (pointer) => {
      background.setPosition(
        this.scale.width / 2 + (pointer.x - this.scale.width / 2) * 0.01,
        this.scale.height / 2 + (pointer.y - this.scale.height / 2) * 0.01,
      );
    });

    //homepage car parallax effect
    this.input.on('pointermove', (pointer) => {
      homepageCar.setPosition(
        this.scale.width + (pointer.x - this.scale.width / 2) * 0.015,
        this.scale.height / 1.45 + (pointer.y - this.scale.height / 2) * 0.015,
      );
    });

    //christmas lights parallax effect
    this.input.on('pointermove', (pointer) => {
      lights.setPosition(
        this.scale.width / 2 + (pointer.x - this.scale.width / 2) * 0.03,
        this.scale.height / 6 + (pointer.y - this.scale.height / 2) * 0.03,
      );
    });

    //christmas trees parallax effect
    this.input.on('pointermove', (pointer) => {
      trees.setPosition(
        this.scale.width / 3 + (pointer.x - this.scale.width / 2) * 0.0225,
        this.scale.height + (pointer.y - this.scale.height / 2) * 0.0225,
      );
    });

    play_button.on('pointerdown', () => {
      this.registry.set('gameMode', 'christmas');
      this.scene.start('NameInputScene', { isMultiplayer: false });
    });
    twoPlayerButton.on('pointerdown', () => {
      startMultiplayer();
    });
    settings_button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
      this.scene.bringToTop('PopUpScene');
    });

    hitboxVisual.on('pointerdown', () => {
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });
    //logik um multiplayer zu starten
    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
    });

    this.tweens.add({
      targets: lights,
      alpha: 0.2,
      duration: 2000,
      yoyo: 0.5,
      repeat: -1,
    });
  }
}
