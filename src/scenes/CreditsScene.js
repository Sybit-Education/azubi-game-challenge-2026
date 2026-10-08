import Phaser from 'phaser';
import InputManager from '../objects/InputManager.js';

export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    // Create InputManager instance and initialize it
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    const creditsUI = document.getElementById('credits-ui');
    const creditsContent = document.getElementById('credits-content');

    let creditText = `
      SYBIT KART



    Development

    Hans Solon
    Davyd Mozghov
    Berat Dalgic
    Agwad Alsayed
    Saied Tablis
    Jamin Ibrahimovic


    Art & Graphics

    Luisa Krasniqi
    Sofya Skripova


    UI/UX Design

    Sofya Skripova
    Saied Tablis
    Luisa Krasniqi


    Audio

    Sofya Skripova
    Jamin Ibrahimovic


    Accessibility

    Agwad Alsayed



    Thanks for playing!
    `;

    creditsContent.textContent = creditText;
    creditsUI.hidden = false;

    let skipText = 'Press SPACE to skip';

    this.width = this.scale.width;
    this.height = this.scale.height;
    this.cameras.main.setBackgroundColor('#3E0191');

    const textElement = this.add
      .text(this.width / 2, this.height * 0.95, creditText, {
        fontSize: '34px',
        fontFamily: 'Tiny5',
        color: '#FEFEFE',
      })
      .setOrigin(0.5, 0);

    this.tweens.add({
      targets: textElement,
      y: -(textElement.height * 2),
      duration: 30000,
      ease: 'Linear',
    });

    const returnToMenu = () => {
      const menuScene =
        this.registry.get('gameMode') === 'christmas' ? 'ChristmasScene' : 'MenuScene';

      this.scene.start(menuScene, { focusTarget: 'credit-btn' });
    };

    this.input.keyboard.on('keydown-SPACE', returnToMenu);
    this.input.keyboard.on('keydown-ESC', returnToMenu);

    const skipTextElement = this.add.text(this.width - 380, this.height - 70, skipText, {
      fontSize: '24px',
      color: '#FEFEFE',
    });

    this.tweens.add({
      targets: skipTextElement,
      alpha: 0.2,
      duration: 850,
      yoyo: true,
      repeat: -1,
    });

    this.events.once('shutdown', () => {
      creditsUI.hidden = true;
      this.input.keyboard.off('keydown-SPACE', returnToMenu);
      this.input.keyboard.off('keydown-ESC', returnToMenu);
    });
  }

  update() {
    this.InputManager.update();

    if (this.InputManager.getControlsP1.button4) {
      if (this.registry.get('gameMode') === 'christmas') {
        this.scene.start('ChristmasScene');
      } else {
        this.scene.start('MenuScene');
      }
    }
  }
}
