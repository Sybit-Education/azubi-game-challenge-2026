import Phaser from 'phaser';
import InputManager from '../../objects/InputManager.js';
import { preloadMenuSounds, preloadTypingSounds } from '../../../audio/sounds.js';
import TypingSoundPlayer from '../../../audio/TypingSoundPlayer.js';

const COLORS = {
  grid: 0x520078,
  border: 0xe32bff,
  selected: 0xc8ff16,
  mainText: '#ffffff',
  secondaryText: '#cdb8e4',
  keyFill: 0x180a24,
  selectedText: '#180a24',
  disabledFill: 0x55515b,
  disabledText: '#8e8993',
};

export default class NameInputScene extends Phaser.Scene {
  constructor() {
    super('NameInputScene');
  }

  init(data) {
    this.isMultiplayer = data.isMultiplayer;
  }

  preload() {
    preloadMenuSounds(this);
    preloadTypingSounds(this);
    this.load.image(
      'homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );
  }

  async create() {
    // Create InputManager instance and initialize it
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    this.previousNavigation = { left: false, right: false, up: false, down: false };

    this.typingSound = new TypingSoundPlayer(this);

    this.playerNames = [''];
    this.activePlayer = 0;
    this.selectedRow = 0;
    this.selectedColumn = 0;
    this.maxNameLength = 20;

    this.scaleFactor = this.scale.height / 1080;
    this.createParallaxBackground();

    // Characters shown in the grid, each nested array is one row
    this.characterGrid = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
      ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      ['DELETE', 'ENTER'],
    ];

    this.createPrompt();
    this.createCharacterGrid();
    this.createKeyboardInput();

    this.updateSelection();

    const nameY = this.scale.height / 2.8;
    const labelX = this.scale.width / 2 - 334 * this.scaleFactor;
    this.add
      .rectangle(
        this.scale.width / 2,
        nameY,
        700 * this.scaleFactor,
        56 * this.scaleFactor,
        0x180a24,
        0.8,
      )
      .setStrokeStyle(2 * this.scaleFactor, COLORS.selected)
      .setDepth(0);
    const nameStyle = {
      fontFamily: 'Silkscreen',
      fontSize: `${32 * this.scaleFactor}px`,
      color: COLORS.mainText,
    };

    this.labelText = this.add
      .text(labelX, nameY, '', { ...nameStyle, color: COLORS.secondaryText })
      .setOrigin(0, 0.5);
    this.nameText = this.add.text(labelX, nameY, '', nameStyle).setOrigin(0, 0.5);

    this.updateNamePrompt();
  }

  createParallaxBackground() {
    this.background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width * 1.01, this.scale.height * 1.01)
      .setDepth(-2);

    this.parallaxPointerMove = (pointer) => {
      this.background.setPosition(
        this.scale.width / 2 + (pointer.x - this.scale.width / 2) * 0.01,
        this.scale.height / 2 + (pointer.y - this.scale.height / 2) * 0.01,
      );
    };
    this.input.on('pointermove', this.parallaxPointerMove);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off('pointermove', this.parallaxPointerMove);
    });
  }

  createPrompt() {
    this.prompt = this.add
      .text(this.scale.width / 2, this.scale.height / 4.5, 'ENTER YOUR NAME', {
        fontFamily: 'Silkscreen',
        fontSize: `${66 * this.scaleFactor}px`,
        color: COLORS.mainText,
      })
      .setOrigin(0.5);
  }

  createCharacterGrid() {
    const cellWidth = 78 * this.scaleFactor;
    const cellHeight = 70 * this.scaleFactor;
    const keyWidth = 64 * this.scaleFactor;
    const actionButtonWidth = 144 * this.scaleFactor;
    const startY = this.scale.height * 0.48;
    const gridStartX = (this.scale.width - 8 * cellWidth) / 2;
    const gridLeft = gridStartX - keyWidth / 2;
    const gridRight = gridStartX + 8 * cellWidth + keyWidth / 2;

    this.characterTexts = [];
    this.characterCells = [];
    this.add
      .rectangle(
        this.scale.width / 2,
        startY + 1.5 * cellHeight,
        9 * cellWidth,
        4 * cellHeight,
        0x180a24,
        0.45,
      )
      .setStrokeStyle(2 * this.scaleFactor, COLORS.grid)
      .setDepth(-1);

    this.characterGrid.forEach((row, rowIndex) => {
      const isLastRow = rowIndex === this.characterGrid.length - 1;
      const rowCells = [];
      const rowTexts = row.map((character, columnIndex) => {
        const isActionRow = isLastRow;
        let x;
        let y;
        let cellWidthInPixels;
        let cellHeightInPixels;

        if (isActionRow) {
          cellWidthInPixels = actionButtonWidth;
          if (columnIndex === 0) {
            x = gridLeft + cellWidthInPixels / 2;
          } else {
            x = gridRight - cellWidthInPixels / 2;
          }
          y = startY + 4 * cellHeight + 10 * this.scaleFactor;
          cellHeightInPixels = 56 * this.scaleFactor;
        } else {
          x = gridStartX + columnIndex * cellWidth;
          y = startY + rowIndex * cellHeight;
          cellWidthInPixels = keyWidth;
          cellHeightInPixels = 60 * this.scaleFactor;
        }

        const cell = this.add
          .rectangle(x, y, cellWidthInPixels, cellHeightInPixels, COLORS.keyFill)
          .setStrokeStyle(2 * this.scaleFactor, COLORS.border)
          .setDepth(0)
          .setInteractive({ useHandCursor: true });
        cell.on('pointerover', () => {
          this.setSelection(rowIndex, columnIndex, true);
        });
        cell.on('pointerdown', (pointer) => {
          if (!pointer.leftButtonDown()) return;

          this.selectedRow = rowIndex;
          this.selectedColumn = columnIndex;
          this.updateSelection();
          this.selectCharacter();
        });
        rowCells.push(cell);

        return this.add
          .text(x, y, character, {
            fontFamily: 'Silkscreen',
            fontSize: `${(isActionRow ? 32 : 40) * this.scaleFactor}px`,
            color: COLORS.mainText,
          })
          .setOrigin(0.5)
          .setDepth(1);
      });

      this.characterCells.push(rowCells);
      this.characterTexts.push(rowTexts);
    });
  }

  createKeyboardInput() {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const currentName = this.playerNames[this.activePlayer] || '';

      if (event.key === 'Enter') {
        this.submitName();
        return;
      }

      if (event.key === 'Backspace') {
        this.moveSelectionToCharacter('DELETE');
        this.deleteCharacter();
      } else if (/^[a-zA-Z0-9]$/.test(event.key)) {
        const character = event.key.toUpperCase();
        this.moveSelectionToCharacter(character);
        if (currentName.length < this.maxNameLength) {
          this.playerNames[this.activePlayer] = currentName + character;
          this.typingSound.play();
        }
      }

      this.updateNamePrompt();
    };
    this.input.keyboard.on('keydown', handleKeyDown);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', handleKeyDown);
    });
  }

  moveSelectionToCharacter(character) {
    const rowIndex = this.characterGrid.findIndex((row) => row.includes(character));
    if (rowIndex === -1) return;

    this.selectedRow = rowIndex;
    this.selectedColumn = this.characterGrid[rowIndex].indexOf(character);
    this.updateSelection();
  }

  setSelection(row, column, playFocusSound = false) {
    const selectionChanged = row !== this.selectedRow || column !== this.selectedColumn;
    this.selectedRow = row;
    this.selectedColumn = column;
    this.updateSelection();

    if (
      playFocusSound &&
      selectionChanged &&
      !this.sound.locked &&
      this.cache.audio.exists('menu-focus')
    ) {
      this.sound.play('menu-focus', { volume: 0.12 });
    }
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

    if (character === 'ENTER') {
      this.submitName();
    } else if (character === 'DELETE') {
      this.deleteCharacter();
    } else {
      this.appendCharacter(character);
    }
  }

  deleteCharacter() {
    const currentName = this.playerNames[this.activePlayer] || '';
    if (currentName.length === 0) return;

    this.playerNames[this.activePlayer] = currentName.slice(0, -1);
    this.typingSound.play();
    this.updateNamePrompt();
  }

  appendCharacter(character) {
    const currentName = this.playerNames[this.activePlayer] || '';
    if (currentName.length >= this.maxNameLength) return;

    this.playerNames[this.activePlayer] = currentName + character;
    this.typingSound.play();
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
    this.updateSelection();
  }

  updateSelection() {
    const hasName = (this.playerNames[this.activePlayer] || '').trim().length > 0;
    this.characterTexts.forEach((row, rowIndex) => {
      row.forEach((textObject, columnIndex) => {
        const isSelected = rowIndex === this.selectedRow && columnIndex === this.selectedColumn;
        const isDisabledEnter = textObject.text === 'ENTER' && !hasName;
        textObject.setColor(
          isDisabledEnter
            ? COLORS.disabledText
            : isSelected
              ? COLORS.selectedText
              : COLORS.mainText,
        );
        textObject.setScale(isSelected && !isDisabledEnter ? 1.2 : 1);
        this.characterCells[rowIndex][columnIndex]
          .setFillStyle(
            isDisabledEnter
              ? COLORS.disabledFill
              : isSelected
                ? COLORS.selected
                : COLORS.keyFill,
          )
          .setStrokeStyle(
            2 * this.scaleFactor,
            isDisabledEnter
              ? COLORS.disabledFill
              : isSelected
                ? COLORS.selected
                : COLORS.border,
          )
          .setScale(isSelected && !isDisabledEnter ? 1.08 : 1);
      });
    });
  }

  moveSelection(dx, dy) {
    const row = Phaser.Math.Wrap(this.selectedRow + dy, 0, this.characterGrid.length);
    const rowLength = this.characterGrid[row].length;
    const column =
      dx === 0
        ? Math.min(this.selectedColumn, rowLength - 1)
        : Phaser.Math.Wrap(this.selectedColumn + dx, 0, rowLength);

    this.setSelection(row, column, true);
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

    const directions = {
      left: controls.left,
      right: controls.right,
      up: controls.up,
      down: controls.down,
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

    if (controls.button3) {
      this.selectCharacter();
    }
  }
}
