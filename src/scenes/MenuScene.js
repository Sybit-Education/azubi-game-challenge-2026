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
  }

  // Create scene
  create() {

    // Button genator wrapper
    const createButton = (x, y, label) => {
      const button = this.add.image(x, y, "playButton")
        .setScale(0.37 * uiScale)
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
      height / 1080
    );
    const spacing = 180 * uiScale;
    //let selectedIndex = 0;

    // Sets background color
    this.cameras.main.setBackgroundColor('#6f3198');

    // SYBIT KART Logo placeholder
    this.add.text(centerX, height * 0.10, 'SYBIT KART', {
      fontFamily: 'Tiny5',
      fontSize: `${175 * uiScale}px`,
      color: '#ffffff'
    })
      .setOrigin(0.5);

    // Version tracker
    this.add.text(width * 0.97, height * 0.97, "v0.5", {
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
    const playButton = createButton(centerX, centerY - spacing * 1, "START")
    const settingsButton = createButton(centerX, centerY * 1.05, "SETTINGS")
    const creditsButton = createButton(centerX, centerY + spacing * 1.3, "CREDITS")
    const twoPlayerButton = createButton(centerX + 300, centerY + 20, "SONION")

   // const buttons = [
    //  playButton,
     // settingsButton,
    //  createButton
   // ];

    // List of useful button-specific variables
    const playButtonY = playButton.button.y;
    const settingsButtonY = settingsButton.button.y;
    const creditsButtonY = creditsButton.button.y;
    const twoPlayerButtonY = twoPlayerButton.button.y;

    // Navigation with TAB
    this.input.keyboard.on("keydown-TAB" , () => {

    });

    // Hover and unhover conditions
    playButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [playButton.button, playButton.text],
        y: playButton.button.y - 5 * uiScale,
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

    twoPlayerButton.button.on('pointerover', () => {
      this.tweens.add({
        targets: [twoPlayerButton.button, twoPlayerButton.text],
        y: twoPlayerButton.button.y - 5,
        duration: 100
      });
    });

    twoPlayerButton.button.on('pointerout', () => {
      this.tweens.add({
        targets: [twoPlayerButton.button, twoPlayerButton.text],
        y: twoPlayerButtonY,
        duration: 100
      })
    });

    // Click events 
    playButton.button.on('pointerdown', () => {
      this.scene.start('LoadingScene');
    });

    twoPlayerButton.button.on('pointerdown', () => {
      this.scene.start('GameScene', {isMultiplayer: true});
      //logik um multiplayer zu starten
    });

    settingsButton.button.on('pointerdown', () => {
      this.scene.launch('PopUpScene');
    });
  }
}
