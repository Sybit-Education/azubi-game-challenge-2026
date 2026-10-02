/* global Phaser */

export default class MenuScene extends Phaser.Scene {
  // Constructor
  constructor() {
    super('MenuScene');
  }

  // Pre load images
  preload() {
    this.load.image('homepage-2player', 'sprites/Homepage/2Multiplayer.png');
    //this.load.image('playButton', 'sprites/buttonTemplate.png');
    this.load.image('homepage-hintergrund', 'sprites/Homepage/Default Homepage/background.png');
    this.load.image(
      'homepage-resonanz-label',
      'sprites/Homepage/Default Homepage/Resonanz im Spiel 2.png',
    );
    this.load.image('homepage-title', 'sprites/Homepage/Default Homepage/SYBIT KART.png');
    this.load.image('homepage-play-btn', 'sprites/Homepage/Default Homepage/playButton.png');
    this.load.image('homepage-settings', 'sprites/Homepage/Default Homepage/settingsButton.png');
    this.load.image('homepage-anleitung', 'sprites/Homepage/Default Homepage/anleitungButton.png');
    this.load.image('homepage-car', 'sprites/Homepage/Default Homepage/car.png');
    this.load.image('homepage-credits', 'sprites/Homepage/Default Homepage/creditsButton.png');
    this.load.image(
      'homepage-barrierefreiheit',
      'sprites/Homepage/Default Homepage/barrierefreiheitButton.png',
    );
  }

  // Create scene
  create() {
    const playBtn = document.getElementById('start-game');
    const settingsBtn = document.getElementById('settings-btn');
    const menu = document.getElementById('accessible-ui');
    menu.hidden = false;

    const startGame = () => {
      this.scene.start('LoadingScene', { isMultiplayer: false });
    };

    const openSettings = () => {
      this.scene.launch('PopUpScene');
    };

    playBtn.addEventListener('click', startGame);
    settingsBtn.addEventListener('click', openSettings);

    this.events.once('shutdown', () => {
      playBtn.removeEventListener('click', startGame);
      settingsBtn.removeEventListener('click', openSettings);
      menu.hidden = true;
    });

    const footer_btn_y = this.scale.height / 1.17;
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height)
      .setDepth(-100);

    this.add
      .image(this.scale.width / 2, footer_btn_y * 1.1, 'homepage-resonanz-label')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5);

    const play_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'homepage-play-btn')
      .setOrigin(0.5)
      .setScale(0.33)
      .setInteractive();

    const settings_button = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.55, 'homepage-settings')
      .setOrigin(0.5)
      .setScale(0.33)
      .setInteractive();

    const twoPlayerButton = this.add
      .image(this.scale.width / 5.7, this.scale.height / 1.9, 'homepage-2player')
      .setOrigin(0.5)
      .setScale(0.278)
      .setDepth(-1);

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
    const creditsButton = this.add
      .image(this.scale.width / 1.14, footer_btn_y, 'homepage-credits')
      .setOrigin(0.5)
      .setScale(0.27)
      .setInteractive();

    creditsButton.setDepth(3);

    this.add
      .image(this.scale.width / 8, footer_btn_y, 'homepage-anleitung')
      .setOrigin(0.5)
      .setScale(0.3);

    this.add
      .image(this.scale.width / 2, footer_btn_y, 'homepage-barrierefreiheit')
      .setOrigin(0.5)
      .setScale(0.3);
    this.add
      .image(this.scale.width, this.scale.height / 1.5, 'homepage-car')
      .setOrigin(0.5)
      .setScale(0.3);

    play_button.on('pointerdown', startGame);

    settings_button.on('pointerdown', openSettings);

    hitboxVisual.on('pointerdown', () => {
      this.scene.start('LoadingScene', { isMultiplayer: true });
    });
    //logik um multiplayer zu starten
    creditsButton.on('pointerdown', () => {
      this.scene.start('CreditsScene');
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
    };

    // Variables for orientation, positioning and scaling (if you read this, you're cool :))
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const uiScale = Math.min(width / 1920, height / 1080);
    const spacing = 180 * uiScale;
    //let selectedIndex = 0;

    // Sets background color
  

    // SYBIT KART Logo placeholder
    this.add
      .text(centerX, height * 0.1, 'SYBIT KART', {
        fontFamily: 'Tiny5',
        fontSize: `${175 * uiScale}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Version tracker
    this.add
      .text(width * 0.97, height * 0.97, 'v0.5', {
        fontFamily: 'Tiny5',
        fontSize: `${32 * uiScale}px`,
        fontStyle: 'bold',
        color: '#ffffff',
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5);

    // Buttons + Text (function defined above)
    const playButton = createButton(centerX, centerY - spacing * 1, 'START');
    const settingsButton = createButton(centerX, centerY * 1.05, 'SETTINGS');
    const creditsButton = createButton(centerX, centerY + spacing * 1.3, 'CREDITS');
    const twoPlayerButton = createButton(centerX + 300, centerY + 20, '2 PLAYER');

    // const buttons = [
    //  playButton,
    // settingsButton,
    //  createButton
    // ];

    // List of useful button-specific variables
    const playButtonY = playButton.button.y;
    const settingsButtonY = settingsButton.button.y;

    // Navigation with TAB
    this.input.keyboard.on('keydown-TAB', () => {});

    // Hover and unhover conditions
    playButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [playButton.button, playButton.text],
        y: playButton.button.y - 5 * uiScale,
        duration: 100,
      });
    });

    playButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [playButton.button, playButton.text],
        y: playButtonY,
        duration: 100,
      });
    });

    settingsButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [settingsButton.button, settingsButton.text],
        y: settingsButton.button.y - 5,
        duration: 100,
      });
    });

    settingsButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [settingsButton.button, settingsButton.text],
        y: settingsButtonY,
        duration: 100,
      });
    });

    creditsButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [creditsButton.button, creditsButton.text],
        y: creditsButton.button.y - 5,
        duration: 100,
      });
    });

    creditsButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [creditsButton.button, creditsButton.text],
        y: creditsButtonY,
        duration: 100,
      });
    });

    twoPlayerButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [twoPlayerButton.button, twoPlayerButton.text],
        y: twoPlayerButton.button.y - 5,
        duration: 100,
      });
    });

    twoPlayerButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [twoPlayerButton.button, twoPlayerButton.text],
        y: twoPlayerButtonY,
        duration: 100,
      });
    });

    // Click events
    playButton.button.on('pointerdown', () => {
      this.scene.start('LoadingScene');
    });

   

    settingsButton.button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
    });
  }
}*/
  }
}
