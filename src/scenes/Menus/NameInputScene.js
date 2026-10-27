import Phaser from 'phaser';
import InputManager from '../../objects/InputManager.js';

export default class NameInputScene extends Phaser.Scene {
  constructor() {
    super('NameInputScene');
  }

  init(data) {
    this.isMultiplayer = data.isMultiplayer;
  }

  async create() {
    // Create InputManager instance and initialize it
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    this.previousNavigation = { left: false, right: false, up: false, down: false };

    await document.fonts.load('32px Silkscreen');

    this.playerNames = [''];
    this.activePlayer = 0;
    this.selectedRow = 0;
    this.selectedColumn = 0;
    this.maxNameLength = 20;

    this.scaleFactor = this.scale.height / 1080;

    // Characters shown in the grid, each nested array is one row
    this.characterGrid = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
      ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      ['DELETE', 'END'],
    ];

    this.createPrompt();
    this.createCharacterGrid();
    this.createKeyboardInput();

    this.updateSelection();

    const nameY = this.scale.height / 3;
    const labelX = this.scale.width / 2 - 320 * this.scaleFactor;
    const nameStyle = {
      fontFamily: 'Silkscreen',
      fontSize: `${32 * this.scaleFactor}px`,
      color: '#ffffff',
    };

    this.labelText = this.add.text(labelX, nameY, '', nameStyle).setOrigin(0, 0.5);
    this.nameText = this.add.text(labelX, nameY, '', nameStyle).setOrigin(0, 0.5);

    this.updateNamePrompt();
  }

  createPrompt() {
    this.prompt = this.add
      .text(this.scale.width / 2, this.scale.height / 5, '---    ENTER YOUR NAME    ---', {
        fontFamily: 'Silkscreen',
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
            fontFamily: 'Silkscreen',
            fontSize: `${28 * this.scaleFactor}px`,
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 8 },
          })
          .setOrigin(0.5),
      );

      this.characterTexts.push(rowTexts);

      const rowWidth = (9 - 1) * cellWidth;
      const startX = (this.scale.width - rowWidth) / 2;

      if (isLastRow) {
        const gridLeft = startX - cellWidth / 4;
        const gridRight = startX + rowWidth + cellWidth / 4;

        rowTexts[0].setX(gridLeft + rowTexts[0].width / 2);
        rowTexts[1].setX(gridRight - rowTexts[1].width / 2);
        return;
      }

      rowTexts.forEach((text, columnIndex) => {
        text.setX(startX + columnIndex * cellWidth);
      });
    });
  }

  createKeyboardInput() {
    this.input.keyboard.on('keydown', (event) => {
      const currentName = this.playerNames[this.activePlayer] || '';

      if (event.key === 'Enter') {
        this.submitName();
        return;
      }

      if (event.key === 'Backspace') {
        this.playerNames[this.activePlayer] = currentName.slice(0, -1);
      } else if (/^[a-zA-Z0-9]$/.test(event.key) && currentName.length < this.maxNameLength) {
        this.playerNames[this.activePlayer] = currentName + event.key.toUpperCase();
      }

      this.updateNamePrompt();
    });
  }

  submitName() {
    const currentName = (this.playerNames[this.activePlayer] || '').trim();
    if (currentName.length === 0) return;

    this.playerNames[this.activePlayer] = currentName;
    if (this.isMultiplayer && this.activePlayer === 0) {
      this.activePlayer = 1;
      this.updateNamePrompt();
      return;
    }

    this.saveNamesAndStart();
  }

  skipNameEntry() {
    this.playerNames = this.isMultiplayer ? ['PLAYER1', 'PLAYER2'] : ['UNKNOWN'];
    this.saveNamesAndStart();
  }

  saveNamesAndStart() {
    localStorage.setItem('Playername', this.playerNames[0]);
    if (this.isMultiplayer) {
      localStorage.setItem('Playername2', this.playerNames[1]);
    } else {
      localStorage.removeItem('Playername2');
    }

    this.scene.start('LoadingScene', {
      isMultiplayer: this.isMultiplayer,
    });
  }

  selectCharacter() {
    const character = this.characterGrid[this.selectedRow][this.selectedColumn];
    const currentName = this.playerNames[this.activePlayer] || '';

    if (character === 'END') {
      this.submitName();
    } else if (character === 'DELETE') {
      this.playerNames[this.activePlayer] = currentName.slice(0, -1);
      this.updateNamePrompt();
    } else {
      this.appendCharacter(character);
    }
  }

  appendCharacter(character) {
    const currentName = this.playerNames[this.activePlayer] || '';
    if (currentName.length >= this.maxNameLength) return;

    this.playerNames[this.activePlayer] = currentName + character;
    this.updateNamePrompt();
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

  updateSelection() {
    this.characterTexts.forEach((row, rowIndex) => {
      row.forEach((textObject, columnIndex) => {
        const isSelected = rowIndex === this.selectedRow && columnIndex === this.selectedColumn;
        textObject.setColor(isSelected ? '#000000' : '#ffffff');
        textObject.setBackgroundColor(isSelected ? '#ffffff' : '#333333');
        textObject.setScale(isSelected ? 1.15 : 1);
      });
    });
  }

  moveSelection(dx, dy) {
    this.selectedRow = Phaser.Math.Wrap(this.selectedRow + dy, 0, this.characterGrid.length);
    const rowLength = this.characterGrid[this.selectedRow].length;
    this.selectedColumn =
      dx === 0
        ? Math.min(this.selectedColumn, rowLength - 1)
        : Phaser.Math.Wrap(this.selectedColumn + dx, 0, rowLength);

    this.updateSelection();
  }

  update() {
    this.InputManager.update();

    if (!this.characterGrid) return;

    const controls = this.InputManager.getControlsP1;
    if (controls.button4) {
      this.scene.start('MenuScene');
      return;
    }
    if (controls.button1) {
      this.skipNameEntry();
      return;
    }

    const gamepad = this.input.gamepad;
    const pad = gamepad?.enabled ? gamepad.getPad(0) : null;
    const connectedPad = pad?.pad?.connected ? pad : null;
    const axisX = connectedPad?.axes?.[0]?.getValue() ?? 0;
    const axisY = connectedPad?.axes?.[1]?.getValue() ?? 0;
    const deadzone = 0.2;
    const directions = {
      left: axisX < -deadzone,
      right: axisX > deadzone,
      up: axisY < -deadzone,
      down: axisY > deadzone,
    };
    const justPressed = {
      left: directions.left && !this.previousNavigation.left,
      right: directions.right && !this.previousNavigation.right,
      up: directions.up && !this.previousNavigation.up,
      down: directions.down && !this.previousNavigation.down,
    };
    this.previousNavigation = directions;

    if (justPressed.left) {
      this.moveSelection(-1, 0);
    } else if (justPressed.right) {
      this.moveSelection(1, 0);
    } else if (justPressed.up) {
      this.moveSelection(0, -1);
    } else if (justPressed.down) {
      this.moveSelection(0, 1);
    }

    if (controls.button2) {
      this.selectCharacter();
    }
  }
}
