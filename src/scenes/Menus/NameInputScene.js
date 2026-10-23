import Phaser from 'phaser';

export default class NameInputScene extends Phaser.Scene {
  constructor() {
    super('NameInputScene');
  }

  init(data) {
    this.isMultiplayer = data.isMultiplayer;
  }

  async create() {
    await document.fonts.load('32px Tiny5');

    this.playerNames = [''];
    this.activePlayer = 0;
    this.selectedIndex = 0;
    this.maxNameLength = 10;

    this.scaleFactor = this.scale.height / 1080;

    // Characters shown in the grid, each nested array is one row
    this.characterGrid = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
      ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      ['DELETE', 'SPACE', 'END'],
    ];

    this.createPrompt();
    this.createCharacterGrid();

    const nameY = this.scale.height / 3;
    const labelX = this.scale.width / 2 - 285 * this.scaleFactor;
    const nameStyle = {
      fontFamily: 'Tiny5',
      fontSize: `${32 * this.scaleFactor}px`,
      color: '#ffffff',
    };

    this.labelText = this.add
      .text(labelX, nameY, '', nameStyle)
      .setOrigin(0, 0.5);
    this.nameText = this.add
      .text(labelX, nameY, '', nameStyle)
      .setOrigin(0, 0.5);

    this.updateNamePrompt();

    // Handle keyboard input for name entry
    this.input.keyboard.on('keydown', (event) => {
      const currentName = this.playerNames[this.activePlayer] || '';

      if (event.key === 'Enter') {
        if (currentName.trim().length === 0) return;

        this.playerNames[this.activePlayer] = currentName.trim();
        if (this.isMultiplayer && this.activePlayer === 0) {
          this.activePlayer = 1;
          this.updateNamePrompt();
          return;
        }

        localStorage.setItem('Playername', this.playerNames[0]);
        if (this.isMultiplayer) {
          localStorage.setItem('Playername2', this.playerNames[1]);
        } else {
          localStorage.removeItem('Playername2');
        }

        this.scene.start('LoadingScene', {
          isMultiplayer: this.isMultiplayer,
        });
        return;
      }

      if (event.key === 'Backspace') {
        this.playerNames[this.activePlayer] = currentName.slice(0, -1);
      } else if (event.key.length === 1) {
        this.playerNames[this.activePlayer] = currentName + event.key;
      }

      this.updateNamePrompt();
    });
  }

  createPrompt() {
    this.prompt = this.add
      .text(this.scale.width / 2, this.scale.height / 5, '---    ENTER YOUR NAME    ---', {
        fontFamily: 'Tiny5',
        fontSize: `${48 * this.scaleFactor}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }

  createCharacterGrid() {
    const cellWidth = 70 * this.scaleFactor;
    const cellHeight = 70 * this.scaleFactor;
    const startY = this.scale.height * 0.48;

    this.characterTexts = [];

    this.characterGrid.forEach((row, rowIndex) => {
      const isLastRow = rowIndex === this.characterGrid.length - 1;
      const rowTexts = row.map((character) =>
        this.add
          .text(0, startY + rowIndex * cellHeight, character, {
            fontFamily: 'Tiny5',
            fontSize: `${28 * this.scaleFactor}px`,
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 8 },
          })
          .setOrigin(0.5),
      );

      this.characterTexts.push(...rowTexts);

      const rowWidth = (9 - 1) * cellWidth;
      const startX = (this.scale.width - rowWidth) / 2;

      if (isLastRow) {
        const gridLeft = startX - cellWidth / 4;
        const gridRight = startX + rowWidth + cellWidth / 4;

        rowTexts[0].setX(gridLeft + rowTexts[0].width / 2);
        rowTexts[1].setX(this.scale.width / 2);
        rowTexts[2].setX(gridRight - rowTexts[2].width / 2);
        return;
      }

      rowTexts.forEach((text, columnIndex) => {
        text.setX(startX + columnIndex * cellWidth);
      });
    });
  }

  updateNamePrompt() {
    const currentName = this.playerNames[this.activePlayer] || '';
    let label;
    if (this.isMultiplayer) {
      label = this.activePlayer === 0 ? 'PLAYER 1: ' : 'PLAYER 2: ';
    } else {
      label = 'USERNAME: ';
    }

    this.labelText.setText(label);
    this.nameText
      .setText(currentName)
      .setPosition(
        this.labelText.x + this.labelText.width + 8 * this.scaleFactor,
        this.labelText.y,
      );
  }
}
