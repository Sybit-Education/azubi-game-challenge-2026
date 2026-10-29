import Phaser from 'phaser';
import InputManager from '../../objects/InputManager.js';
import { preloadMenuSounds, preloadTypingSounds } from '../../../audio/sounds.js';
import TypingSoundPlayer from '../../../audio/TypingSoundPlayer.js';

// Color config
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
  // Constructor
  constructor() {
    super('NameInputScene');
  }

  // Init
  init(data) {
    this.isMultiplayer = data.isMultiplayer;
  }

  // Pre-load
  preload() {
    preloadMenuSounds(this);
    preloadTypingSounds(this);

    // Load background image
    this.load.image(
      'homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );
  }

  // Create
  async create() {
    // Create InputManager instance and initialize it
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    this.previousNavigation = { left: false, right: false, up: false, down: false };

    // Setup typing sound manager
    this.typingSound = new TypingSoundPlayer(this);

    // Resets values
    this.playerNames = [''];
    this.activePlayer = 0;
    this.selectedRow = 0;
    this.selectedColumn = 0;
    this.maxNameLength = 20;

    // Calculates scale
    this.scaleFactor = this.scale.height / 1080;

    // Setup parallax background
    this.createParallaxBackground();

    // Characters shown in the grid, each nested array is one row
    this.characterGrid = [
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
      ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0'],
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      ['DELETE', 'ENTER'],
    ];

    // Setup
    this.createPrompt();
    this.createCharacterGrid();
    this.createKeyboardInput();

    // Update display grid
    this.updateSelection();

    const nameY = this.scale.height / 2.8;
    const labelX = this.scale.width / 2 - 334 * this.scaleFactor;
    this.nameFieldWidth = 700 * this.scaleFactor;
    this.nameFontSize = 32 * this.scaleFactor;

    // Creates input box
    this.add
      .rectangle(
        this.scale.width / 2,
        nameY,
        this.nameFieldWidth,
        56 * this.scaleFactor,
        0x180a24,
        0.8,
      )
      .setStrokeStyle(2 * this.scaleFactor, COLORS.selected)
      .setDepth(0);

    // Style for input
    const nameStyle = {
      fontFamily: 'Silkscreen',
      fontSize: `${this.nameFontSize}px`,
      color: COLORS.mainText,
    };

    // Create empty label input
    this.labelText = this.add
      .text(labelX, nameY, '', { ...nameStyle, color: COLORS.secondaryText })
      .setOrigin(0, 0.5);

    // Creates input value display
    this.nameText = this.add.text(labelX, nameY, '', nameStyle).setOrigin(0, 0.5);

    // Update input
    this.updateNamePrompt();
  }

  // Creates parallax background
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

  // Creates input field
  createPrompt() {
    this.prompt = this.add
      .text(this.scale.width / 2, this.scale.height / 4.5, 'ENTER YOUR NAME', {
        fontFamily: 'Silkscreen',
        fontSize: `${66 * this.scaleFactor}px`,
        color: COLORS.mainText,
      })
      .setOrigin(0.5);
  }

  // Creates char grid
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

    // Creates container for charataer
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

    // For each character
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

        // Adds cell
        const cell = this.add
          .rectangle(x, y, cellWidthInPixels, cellHeightInPixels, COLORS.keyFill)
          .setStrokeStyle(2 * this.scaleFactor, COLORS.border)
          .setDepth(0)
          .setInteractive({ useHandCursor: true });

        // On hover
        cell.on('pointerover', () => {
          this.setSelection(rowIndex, columnIndex, true);
        });

        // On click
        cell.on('pointerdown', (pointer) => {
          if (!pointer.leftButtonDown()) return;

          this.selectedRow = rowIndex;
          this.selectedColumn = columnIndex;
          this.updateSelection();
          this.selectCharacter();
        });

        // Adds to list
        rowCells.push(cell);

        // Adds text to button
        return this.add
          .text(x, y, character, {
            fontFamily: 'Silkscreen',
            fontSize: `${(isActionRow ? 32 : 40) * this.scaleFactor}px`,
            color: COLORS.mainText,
          })
          .setOrigin(0.5)
          .setDepth(1);
      });

      // Adds to list
      this.characterCells.push(rowCells);
      this.characterTexts.push(rowTexts);
    });
  }

  // Creates keyboard listeer
  createKeyboardInput() {
    let selectedAll = false;

    // On key press
    const handleKeyDown = (event) => {
      const currentName = this.playerNames[this.activePlayer] || '';

      // Ctrl+A
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        // Prevent default
        event.preventDefault();

        // Only select all when the input is not empty
        selectedAll = currentName.length > 0;

        // Update input value display
        this.updateNamePrompt();
        return;
      }

      // Enter
      if (event.key === 'Enter') {
        this.submitName();
        return;
      }

      // Backspace
      if (event.key === 'Backspace') {
        if (selectedAll) {
          this.playerNames[this.activePlayer] = '';
          selectedAll = false;
        } else {
          this.moveSelectionToCharacter('DELETE');
          this.deleteCharacter();
        }

        // Update input value display
        this.updateNamePrompt();
        return;
      }

      // Usaual char
      if (/^[a-zA-Z0-9]$/.test(event.key)) {
        const character = event.key.toUpperCase();

        // Replace all
        if (selectedAll) {
          this.playerNames[this.activePlayer] = character;

          // Reset selected all
          selectedAll = false;
        } else if (currentName.length < this.maxNameLength) {
          this.playerNames[this.activePlayer] = currentName + character;
        }

        this.moveSelectionToCharacter(character);
        this.typingSound.play();
      }

      // Update input value
      this.updateNamePrompt();
    };

    // Starts listener
    this.input.keyboard.on('keydown', handleKeyDown);

    // On shutdown
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', handleKeyDown);
    });
  }

  // Moes selection to char
  moveSelectionToCharacter(character) {
    const rowIndex = this.characterGrid.findIndex((row) => row.includes(character));

    // Not found
    if (rowIndex === -1) {
      return;
    }

    // Sets row
    this.selectedRow = rowIndex;

    // Sets column
    this.selectedColumn = this.characterGrid[rowIndex].indexOf(character);

    // Updates display grid
    this.updateSelection();
  }

  // Selects cell
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

  // Submits name
  submitName() {
    const currentName = (this.playerNames[this.activePlayer] || '').trim();

    // Name is empty
    if (currentName.length === 0) {
      return;
    }

    // Sets name
    this.playerNames[this.activePlayer] = currentName;

    // Propmpty player 2
    if (this.isMultiplayer && this.activePlayer === 0) {
      this.activePlayer = 1;
      this.updateNamePrompt();
      return;
    }

    // Save and start
    this.saveNamesAndStart();
  }

  // Skips name entry
  skipNameEntry() {
    this.playerNames = this.isMultiplayer ? ['PLAYER1', 'PLAYER2'] : ['UNKNOWN'];
    this.saveNamesAndStart();
  }

  // Saves name and starts
  saveNamesAndStart() {
    // Player 1
    localStorage.setItem('Playername', this.playerNames[0]);

    // Player 2
    if (this.isMultiplayer) {
      localStorage.setItem('Playername2', this.playerNames[1]);
    } else {
      localStorage.removeItem('Playername2');
    }

    // Starts game
    this.scene.start('LoadingScene', {
      isMultiplayer: this.isMultiplayer,
    });
  }

  // Saves char press
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

  // Removes char
  deleteCharacter() {
    const currentName = this.playerNames[this.activePlayer] || '';

    // Input empty
    if (currentName.length === 0) {
      return;
    }

    // Removes last char
    this.playerNames[this.activePlayer] = currentName.slice(0, -1);

    // Play sound
    this.typingSound.play();

    // Update display
    this.updateNamePrompt();
  }

  // Appens char
  appendCharacter(character) {
    const currentName = this.playerNames[this.activePlayer] || '';

    // Name too long
    if (currentName.length >= this.maxNameLength) {
      return;
    }

    // Adds char
    this.playerNames[this.activePlayer] = currentName + character;

    // Play sound
    this.typingSound.play();

    // Update display
    this.updateNamePrompt();
  }

  // Updates input display
  updateNamePrompt() {
    const currentName = this.playerNames[this.activePlayer] || '';
    let label;

    // Input label
    if (this.isMultiplayer) {
      label = this.activePlayer === 0 ? 'PLAYER 1: ' : 'PLAYER 2: ';
    } else {
      label = 'USERNAME: ';
    }

    // Sets label
    this.labelText.setText(label);

    // Set name value
    this.nameText
      .setText(currentName)
      .setFontSize(this.nameFontSize)
      .setPosition(
        this.labelText.x + this.labelText.width + 8 * this.scaleFactor,
        this.labelText.y,
      );

    // Caclulates avaible space
    const availableNameWidth = this.nameFieldWidth - this.labelText.width - 40 * this.scaleFactor;

    // Shrinks font when size is not enough
    if (this.nameText.width > availableNameWidth) {
      this.nameText.setFontSize(this.nameFontSize * (availableNameWidth / this.nameText.width));
    }

    // Updates char grid
    this.updateSelection();
  }

  // Updates chatar cells display
  updateSelection() {
    const hasName = (this.playerNames[this.activePlayer] || '').trim().length > 0;
    this.characterTexts.forEach((row, rowIndex) => {
      row.forEach((textObject, columnIndex) => {
        const isSelected = rowIndex === this.selectedRow && columnIndex === this.selectedColumn;

        // Checks if this is enter button and is disabled
        const isDisabledEnter = textObject.text === 'ENTER' && !hasName;

        // Sets color
        textObject.setColor(
          isDisabledEnter
            ? COLORS.disabledText
            : isSelected
              ? COLORS.selectedText
              : COLORS.mainText,
        );

        // Set scale
        textObject.setScale(isSelected && !isDisabledEnter ? 1.2 : 1);

        // Gets scall
        const cell = this.characterCells[rowIndex][columnIndex];

        // Changes cursor
        cell.input.cursor = isDisabledEnter ? 'default' : 'pointer';

        // Applies styles
        cell
          .setFillStyle(
            isDisabledEnter ? COLORS.disabledFill : isSelected ? COLORS.selected : COLORS.keyFill,
          )
          .setStrokeStyle(
            2 * this.scaleFactor,
            isDisabledEnter ? COLORS.disabledFill : isSelected ? COLORS.selected : COLORS.border,
          )
          .setScale(isSelected && !isDisabledEnter ? 1.08 : 1);
      });
    });
  }

  // Moves input
  moveSelection(dx, dy) {
    const row = Phaser.Math.Wrap(this.selectedRow + dy, 0, this.characterGrid.length);
    const rowLength = this.characterGrid[row].length;
    const column =
      dx === 0
        ? Math.min(this.selectedColumn, rowLength - 1)
        : Phaser.Math.Wrap(this.selectedColumn + dx, 0, rowLength);

    this.setSelection(row, column, true);
  }

  // Frame update
  update() {
    this.InputManager.update();

    // Game grid not setup
    if (!this.characterGrid) {
      return;
    }

    // Get controller input
    const controls = this.InputManager.getControlsP1;

    // Back
    if (controls.button4) {
      this.scene.start('MenuScene');
      return;
    }

    // Skip input
    if (controls.button1) {
      this.skipNameEntry();
      return;
    }

    // Directions
    const directions = {
      left: controls.left && !this.InputManager.keys.leftP1.isDown,
      right: controls.right && !this.InputManager.keys.rightP1.isDown,
      up: controls.up && !this.InputManager.keys.upP1.isDown,
      down: controls.down && !this.InputManager.keys.downP1.isDown,
    };

    // Gets keys that werent pressed last frame
    const justPressed = {
      left: directions.left && !this.previousNavigation.left,
      right: directions.right && !this.previousNavigation.right,
      up: directions.up && !this.previousNavigation.up,
      down: directions.down && !this.previousNavigation.down,
    };

    // Sets last navigation with current
    this.previousNavigation = directions;

    // Moves cursor
    if (justPressed.left) {
      this.moveSelection(-1, 0);
    } else if (justPressed.right) {
      this.moveSelection(1, 0);
    } else if (justPressed.up) {
      this.moveSelection(0, -1);
    } else if (justPressed.down) {
      this.moveSelection(0, 1);
    }

    // Select char
    if (controls.button3) {
      this.selectCharacter();
    }
  }
}
