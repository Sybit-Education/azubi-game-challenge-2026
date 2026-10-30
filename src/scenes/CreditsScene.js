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

Advisors

Jevgenij Huebert-Weizenegger
Jonathan Kern

Development

Hans Solon
Davyd Mozghov
Berat Dalgic
Agwad Alsayed
Saied Tablis
Jamin Ibrahimovic
Tobias Jentzsch

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
Agwad Alsayed
Julian Thiemann


Accessibility

Agwad Alsayed


Honorable Mention

Julian Thiemann
Tobias Jentzsch



Thanks for playing!
    `;

    creditsContent.textContent = creditText;
    creditsUI.hidden = false;

    let skipText = 'Press SPACE to pause';

    this.width = this.scale.width;
    this.height = this.scale.height;

    const creditHeadings = [
      'SYBIT KART',
      'Team Lead',
      'Advisors',
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

    const creditLines = creditText.trim().split('\n');
    creditLines.forEach((line, index) => {
      const text = line.trim();

      if (!text) {
        const nextText = creditLines
          .slice(index + 1)
          .map((nextLine) => nextLine.trim())
          .find(Boolean);
        if (!addedBlankLine && previousText && !creditHeadings.includes(previousText)) {
          lineY += bodyFontSize * (nextText === 'Thanks for playing!' ? 8 : 2);
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

      creditTextContainer.add(
        this.add
          .text(0, lineY, text, {
            fontSize: `${fontSize}px`,
            fontFamily: 'Silkscreen',
            color: '#FEFEFE',
            align: 'center',
          })
          .setOrigin(0.5, 0),
      );
      lineY += fontSize * 1.2;
      if (creditHeadings.includes(text) && text !== 'SYBIT KART' && text !== 'Thanks for playing!') {
        lineY += bodyFontSize;
      }
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

    this.isCreditsPaused = false;
    this.scroll = this.tweens.add({
      targets: creditTextContainer,
      y: -creditTextContainer.height * 1.2,

      duration: 20000,
      ease: 'Linear',
      onComplete: () => {
        this.returnToMenu();
      },
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

    this.events.once('shutdown', () => {
      creditsUI.hidden = true;
    });
  }

  update() {
    this.InputManager.update();
    const controls = this.InputManager.getControlsP1;

    if (controls.button4) {
      this.returnToMenu();
    } else if (controls.space) {
      this.isCreditsPaused = !this.isCreditsPaused;
      if (this.isCreditsPaused) {
        this.scroll.pause();
      } else {
        this.scroll.resume();
      }
    }
  }
}
