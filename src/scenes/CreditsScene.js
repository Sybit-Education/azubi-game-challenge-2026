import Phaser from 'phaser';
import InputManager from '../objects/InputManager.js';

export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    this.inputManager = new InputManager(this);
    this.inputManager.create();

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

    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });

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
  }

  update() {
    this.inputManager.update();

    if (this.inputManager.getControlsP1.button4) {
      this.scene.start('MenuScene');
    }
  }
}
