import Phaser from 'phaser';
import InputManager from '../objects/InputManager.js';

import { preloadMenuSounds, playMenuClick } from '../../audio/sounds.js';
export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  preload() {
    preloadMenuSounds(this);
    this.load.image(
      'homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );
    this.load.image('return-button', 'assets/images/homepage/return-button.png');
  }

  create() {
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);
    // Background image
    this.background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width * 1.01, this.scale.height * 1.01)
      .setDepth(-2)
      .setAlpha(0.5);

    // Create InputManager instance and initialize it
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    const creditsUI = document.getElementById('credits-ui');
    const creditsContent = document.getElementById('credits-content');

    let creditText = `

    
SYBIT KART 

Team Lead
  
Stephan Strittmatter

Development

Agwad Alsayed
Berat Dalgic
Davyd Mozghov
Hans Solon
Jamin Ibrahimovic
Saied Tablis
Tobias Jentzsch

Art & Graphics

Luisa Krasniqi
Sofya Skripova


UI/UX Design

Luisa Krasniqi
Saied Tablis
Sofya Skripova


Audio

Agwad Alsayed
Jamin Ibrahimovic
Julian Thiemann
Sofya Skripova

Accessibility

Agwad Alsayed


Honorable Mention

Julian Thiemann
Tobias Jentzsch



Thanks for playing!
    `;

    creditsContent.textContent = creditText;
    creditsUI.hidden = false;

    const pauseHint = 'Press SPACE to Pause';

    this.width = this.scale.width;
    this.height = this.scale.height;

    const creditHeadings = [
      'SYBIT KART',
      'Team Lead',
      'Development',
      'Art & Graphics',
      'UI/UX Design',
      'Audio',
      'Accessibility',
      'Honorable Mention',
      'Thanks for playing!',
    ];
    const bodyFontSize = 30 * this.scaleFactor;
    const creditTextContainer = this.add.container(this.width / 2, this.height * 0.95);
    let lineY = 0;
    let previousText = '';
    let addedBlankLine = false;
    let thanksText;

    const creditLines = creditText.trim().split('\n');
    creditLines.forEach((line, index) => {
      const text = line.trim();

      if (!text) {
        const nextText = creditLines
          .slice(index + 1)
          .map((nextLine) => nextLine.trim())
          .find(Boolean);
        if (!addedBlankLine && previousText && !creditHeadings.includes(previousText)) {
          lineY += bodyFontSize * (nextText === 'Thanks for playing!' ? 6 : 2);
          addedBlankLine = true;
        }
        return;
      }

      addedBlankLine = false;
      const fontSize =
        text === 'SYBIT KART'
          ? 100 * this.scaleFactor
          : creditHeadings.includes(text)
            ? 50 * this.scaleFactor
            : bodyFontSize;

      const creditLine = this.add
        .text(0, lineY, text, {
          fontSize: `${fontSize}px`,
          fontFamily: 'Silkscreen',
          color: '#FEFEFE',
          align: 'center',
        })
        .setOrigin(0.5, 0);
      creditTextContainer.add(creditLine);
      if (text === 'Thanks for playing!') thanksText = creditLine;

      lineY += fontSize * 1.2;
      if (text === 'SYBIT KART') {
        lineY += bodyFontSize * 3;
      }
      previousText = text;
    });

    this.returnToMenu = () => {
      playMenuClick(this);
      const menuScene =
        this.registry.get('gameMode') === 'christmas' ? 'ChristmasScene' : 'MenuScene';

      this.scene.start(menuScene, { focusTarget: 'credit-btn' });
    };

    this.returnButton = this.add
      .image(200 * this.scaleFactor, 50 * this.scaleFactor, 'return-button')
      .setInteractive({ useHandCursor: true })
      .setScale(0.1 * this.scaleFactor)
      .setOrigin(0.5)
      .on('pointerdown', this.returnToMenu);

    this.scroll = this.tweens.add({
      targets: creditTextContainer,
      y: this.height / 2 - thanksText.y - thanksText.displayHeight / 2,

      duration: 20000,
      ease: 'Linear',
      onComplete: () => {
        this.time.delayedCall(2500, this.returnToMenu);
      },
    });

    this.setupPauseOnSpace();

    const skipTextElement = this.add
      .text(this.width - 40 * this.scaleFactor, this.height - 70 * this.scaleFactor, pauseHint, {
        fontSize: `${20 * this.scaleFactor}px`,
        fontFamily: 'Silkscreen',
        color: '#FEFEFE',
      })
      .setOrigin(1, 0);
    this.pauseHintText = skipTextElement;

    this.tweens.add({
      targets: skipTextElement,
      alpha: 0.2,
      duration: 850,
      yoyo: true,
      repeat: -1,
    });

    this.events.once('shutdown', () => {
      creditsUI.hidden = true;
    });
  }

  setupPauseOnSpace() {
    const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    spaceKey.on('down', this.toggleScrollPause, this);
    this.events.once('shutdown', () => spaceKey.off('down', this.toggleScrollPause, this));
  }

  toggleScrollPause() {
    if (!this.scroll) return;

    if (this.scroll.isPaused()) {
      this.scroll.resume();
      this.pauseHintText.setText('Press SPACE to Pause');
    } else {
      this.scroll.pause();
      this.pauseHintText.setText('Press SPACE to Resume');
    }
  }

  update() {
    this.InputManager.update();
    const controls = this.InputManager.getControlsP1;

    if (controls.button4) {
      this.returnToMenu();
    } else if (controls.button1) {
      this.toggleScrollPause();
    }
  }
}
