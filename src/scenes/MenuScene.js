/* global Phaser */

export default class MenuScene extends Phaser.Scene {
  
  // Constructor
  constructor() {
    super('MenuScene');
  }

  // Pre load images
  preload() {
    this.load.image(
      "playButton",
      "sprites/buttonTemplate.png");
      this.load.image('background',
      'sprites/backgroundMenu.png');
      this.load.image('gameLogo',
      'sprites/sybitKartLogo.png'
      );
  }

  // Create scene
  create() {

    // Button genator wrapper
    const createButton = (x, y, label) => {
      const button = this.add.image(x, y, "playButton")
        .setScale(buttonScale)
        .setInteractive();

      const text = this.add.text(x, y, label, {
        fontFamily: "Tiny5",
        fontSize: `${62 * uiScale}px`,
        color: "#464646",
      })
        .setOrigin(0.5);

      return { button, text };
    }

    // Variables for orientation, positioning and scaling (if you read this, you're cool :))
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const uiScale = Math.min(
      width / 1920,
      height / 1080,
      1
    );
    const spacing = 180 * uiScale;
    const logoY = height * 0.18;
    const buttonScale = Math.min(
      0.35 * uiScale,
      0.35
    )

    // Sets background color, size AND scaling
    const bg = this.add.image(centerX, centerY, 'background');
    const scale = Math.max(
      this.cameras.main.width / bg.width,
      this.cameras.main.height / bg.height
    );
    bg.setScale(scale);

    // SYBIT KART Logo placeholder
    const sybitKartLogo = this.add.image(centerX, 200, "gameLogo")
    sybitKartLogo.setScale(uiScale);

    // Version tracker
    this.add.text(width - 50, height - 30, "v0.1", {
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
    const playButton = createButton(centerX - width * 0.25, centerY - spacing, "START")
    const settingsButton = createButton(centerX  - width * 0.25, centerY, "SETTINGS")
    const creditsButton = createButton(centerX - width * 0.25, centerY + spacing, "CREDITS")

    // List of useful button-specific variables
    const playButtonY = playButton.button.y;
    const settingsButtonY = settingsButton.button.y;
    const creditsButtonY = creditsButton.button.y;

    // Hover and unhover conditions
    playButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [playButton.button, playButton.text],
        y: playButton.button.y - 5,
        duration: 100
      });

    });

    playButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [playButton.button, playButton.text],
        y: playButtonY,
        duration: 100
      })
    });

    settingsButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [settingsButton.button, settingsButton.text],
        y: settingsButton.button.y - 5,
        duration: 100
      });
    });

    settingsButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [settingsButton.button, settingsButton.text],
        y: settingsButtonY,
        duration: 100
      })
    });

    creditsButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [creditsButton.button, creditsButton.text],
        y: creditsButton.button.y - 5,
        duration: 100
      });
    });

    creditsButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [creditsButton.button, creditsButton.text],
        y: creditsButtonY,
        duration: 100
      })
    });

    // Click events 
    playButton.button.on('pointerdown', () => {
      this.scene.start('LoadingScene');
    });

    settingsButton.button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
    });
  }
}
