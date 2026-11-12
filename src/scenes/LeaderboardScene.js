import Phaser from 'phaser';
import InputManager from '../objects/InputManager.js';
import { loadLeaderboard } from '../utils/leaderboardSecurity.js';
import { preloadMenuSounds, playMenuClick } from '../../audio/sounds.js';
import { bindLeaderboardControls } from '../accessibility/leaderboard.js';

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
export default class LeaderboardScene extends Phaser.Scene {
  // Initializes the Phaser scene under its registered scene key.
  constructor() {
    super('LeaderboardScene');
  }

  // Preloads menu audio and the images used by the leaderboard scene.
  preload() {
    preloadMenuSounds(this);
    this.load.image(
      'homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );
    this.load.image('return-button', 'assets/images/homepage/return-button.png');
  }

  // Builds the leaderboard scene, then applies its initial layout and controls.
  async create(data) {
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    const leaderboard = await this.loadLeaderboardEntries();
    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);

    this.createParallaxBackground();
    this.createTitle();
    this.createLeaderboardContent(leaderboard);
    this.registerResizeHandler();
    this.createSearchBar();
    this.createFilterButton();
    this.createSortButton();
    this.createBackButton();

    this.resize({
      width: this.scale.width,
      height: this.scale.height,
    });
    bindLeaderboardControls(this, leaderboard, data?.focusTarget, this.isLeaderboardTampered);
  }

  // Loads leaderboard data and records whether the stored entries were tampered with.
  async loadLeaderboardEntries() {
    const result = await loadLeaderboard();
    this.isLeaderboardTampered = result.isTampered;
    return result.entries.slice(0, 10);
  }

  // Adds the parallax background and connects it to pointer movement.
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

  // Creates the centered title, showing a warning when the leaderboard is tampered with.
  createTitle() {
    this.title = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 12,
        this.isLeaderboardTampered ? 'Leaderboard\n⚠ manipuliert' : 'Leaderboard',
        {
          fontFamily: 'Silkscreen',
          fontSize: this.isLeaderboardTampered ? '60px' : '90px',
          color: '#ffffff',
          align: 'center',
        },
      )
      .setOrigin(0.5)
      .setScale(1 * this.scaleFactor);
  }

  // Creates the headers, rows, and empty-state message for the leaderboard.
  createLeaderboardContent(leaderboard) {
    const textStyle = this.getLeaderboardTextStyle();
    this.createColumnHeaders(textStyle);
    this.createLeaderboardRows(leaderboard, textStyle);
    this.createEmptyLeaderboardMessage(leaderboard.length, textStyle);
  }

  // Returns the shared text styling used by leaderboard headers and entries.
  getLeaderboardTextStyle() {
    return {
      fontFamily: 'Silkscreen',
      fontSize: `${this.scale.height / 26}px`,
      color: '#ffffff',
    };
  }

  // Creates the four column headers for rank, player, distance, and score.
  createColumnHeaders(textStyle) {
    this.columnHeaders = [
      this.add.text(0, 0, '#', textStyle).setOrigin(0.5, 1),
      this.add.text(0, 0, 'PLAYER', textStyle).setOrigin(0, 1),
      this.add.text(0, 0, 'DISTANCE', textStyle).setOrigin(1),
      this.add.text(0, 0, 'SCORE', textStyle).setOrigin(1),
    ];
  }

  // Builds a display row for each leaderboard entry.
  createLeaderboardRows(leaderboard, textStyle) {
    this.leaderboardEntries = leaderboard.map((entry, index) =>
      this.createLeaderboardRow(entry, index, textStyle),
    );
  }

  // Creates the text objects for one leaderboard entry.
  createLeaderboardRow(entry, index, textStyle) {
    const name = entry.name || 'Unbekannt';
    const displayName = entry.isTampered ? `${name} ⚠ manipuliert` : name;
    const alpha = index <= 7 ? 1 - (index / 2) * 0.04 : 0.75;

    return {
      rank: this.add
        .text(0, 0, String(index + 1), textStyle)
        .setOrigin(0.5)
        .setAlpha(alpha),
      name: this.add.text(0, 0, displayName, textStyle).setOrigin(0, 0.5).setAlpha(alpha),
      distance: this.add
        .text(0, 0, `${entry.distance} km`, textStyle)
        .setOrigin(1, 0.5)
        .setAlpha(alpha),
      score: this.add
        .text(0, 0, String(entry.score ?? 0), textStyle)
        .setOrigin(1, 0.5)
        .setAlpha(alpha),
    };
  }

  // Shows a centered message when the leaderboard has no entries.
  createEmptyLeaderboardMessage(entryCount, textStyle) {
    this.emptyLeaderboardText =
      entryCount === 0
        ? this.add
            .text(this.scale.width / 2, this.scale.height / 2, 'NO ENTRIES YET', {
              ...textStyle,
              align: 'center',
            })
            .setOrigin(0.5)
        : null;
  }

  createSearchBar() {
    this.nameFieldWidth = 700 * this.scaleFactor;
    this.nameFontSize = 24 * this.scaleFactor;
    this.searchBackground = this.add
      .rectangle(0, 0, this.nameFieldWidth, 56 * this.scaleFactor, 0x180a24, 0.8)
      .setStrokeStyle(2 * this.scaleFactor, COLORS.selected)
      .setDepth(0);

    const nameStyle = {
      fontFamily: 'Silkscreen',
      fontSize: `${this.nameFontSize}px`,
      color: COLORS.mainText,
    };

    this.labelText = this.add
      .text(0, 0, 'SEARCH BY NAME', { ...nameStyle, color: COLORS.secondaryText })
      .setOrigin(0, 0.5);

    this.nameText = this.add.text(0, 0, '', nameStyle).setOrigin(0, 0.5);
  }

  createFilterButton() {
    const filter = this.createActionButton('FILTER ▼');
    this.filterButton = filter.button;
    this.filterButtonText = filter.text;
  }

  createSortButton() {
    const sort = this.createActionButton('SORT ▼');
    this.sortButton = sort.button;
    this.sortButtonText = sort.text;
  }

  createActionButton(label) {
    const buttonTextStyle = {
      fontFamily: 'Silkscreen',
      fontSize: `${20 * this.scaleFactor}px`,
      color: COLORS.mainText,
      align: 'center',
    };

    const button = this.add
      .rectangle(0, 0, 120, 56, COLORS.keyFill)
      .setScale(this.scaleFactor)
      .setStrokeStyle(2, COLORS.selected)
      .setDepth(0)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, label, buttonTextStyle).setOrigin(0.5).setDepth(1);

    button.on('pointerover', () => {
      button.setFillStyle(COLORS.selected);
      button.setStrokeStyle(2, COLORS.selected);
      text.setColor(COLORS.selectedText);
    });
    button.on('pointerout', () => {
      button.setFillStyle(COLORS.keyFill);
      button.setStrokeStyle(2, COLORS.selected);
      text.setColor(COLORS.mainText);
    });

    return { button, text };
  }

  // Keeps the scene layout responsive and removes the listener on shutdown.
  registerResizeHandler() {
    this.scale.on('resize', this.resize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.resize, this);
    });
  }

  // Creates the same upper-left return button used by the name input scene.
  createBackButton() {
    this.returnButton = this.add
      .image(200 * this.scaleFactor, 50 * this.scaleFactor, 'return-button')
      .setInteractive({ useHandCursor: true })
      .setScale(0.1 * this.scaleFactor)
      .setOrigin(0.5)
      .on('pointerdown', this.goHome, this);
  }

  // Returns to the active menu and restores focus to its leaderboard button.
  goHome() {
    playMenuClick(this);
    const menu = this.registry.get('gameMode') === 'christmas' ? 'ChristmasScene' : 'MenuScene';
    this.scene.start(menu, { focusTarget: 'leaderboard-btn' });
  }

  // Updates input and returns to the menu when the back control is pressed.
  update() {
    this.InputManager.update();

    const controls = this.InputManager.getControlsP1;
    if (controls.button4) {
      this.goHome();
    }
  }

  // Recalculates scene sizing and positions after a screen resize.
  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.scaleFactor = Math.min(width / 1920, height / 1080);

    this.resizeBackground(width, height);
    this.resizeTitle(width, height);
    this.resizeLeaderboard(width, height);
    this.resizeSearchControls(width, height);
    this.resizeBackButton();
  }

  // Positions the search field and its adjacent action buttons at the current scale.
  resizeSearchControls(width, height) {
    this.nameFieldWidth = 700 * this.scaleFactor;
    this.nameFontSize = 24 * this.scaleFactor;

    const controlsY = height * 0.2;
    const firstColumnBounds = this.columnHeaders[0].getBounds();
    const lastColumnBounds = this.columnHeaders[3].getBounds();
    const buttonWidth = 120 * this.scaleFactor;
    const buttonGap = 12 * this.scaleFactor;
    const controlsLeft = firstColumnBounds.left;
    const controlsRight = lastColumnBounds.right;
    const filterX = controlsLeft + buttonWidth / 2;
    const sortX = controlsLeft + buttonWidth + buttonGap + buttonWidth / 2;
    const searchLeft = controlsLeft + buttonWidth * 2 + buttonGap * 2;
    const searchRight = controlsRight;
    this.nameFieldWidth = searchRight - searchLeft;
    const searchCenterX = (searchLeft + searchRight) / 2;
    const labelX = searchLeft + 12 * this.scaleFactor;

    this.searchBackground
      .setPosition(searchCenterX, controlsY)
      .setSize(this.nameFieldWidth, 56 * this.scaleFactor)
      .setStrokeStyle(2 * this.scaleFactor, COLORS.selected);
    this.labelText.setPosition(labelX, controlsY).setFontSize(this.nameFontSize);
    this.nameText.setPosition(labelX, controlsY).setFontSize(this.nameFontSize);
    this.filterButton.setPosition(filterX, controlsY).setScale(this.scaleFactor);
    this.filterButtonText.setPosition(filterX, controlsY).setFontSize(20 * this.scaleFactor);
    this.sortButton.setPosition(sortX, controlsY).setScale(this.scaleFactor);
    this.sortButtonText.setPosition(sortX, controlsY).setFontSize(20 * this.scaleFactor);
  }

  // Resizes and centers the background to match the game dimensions.
  resizeBackground(width, height) {
    this.background
    .setPosition(width / 2, height / 2)
    .setDisplaySize(width * 1.01, height * 1.01)
  }

  // Repositions and scales the title for the current screen size.
  resizeTitle(width, height) {
    this.title
      .setPosition(width / 2, height / 12)
      .setFontSize((this.isLeaderboardTampered ? 60 : 90) * this.scaleFactor);
  }

  // Repositions and rescales the return button with the current screen size.
  resizeBackButton() {
    this.returnButton
      .setPosition(200 * this.scaleFactor, 50 * this.scaleFactor)
      .setScale(0.1 * this.scaleFactor);
  }

  // Calculates leaderboard layout and updates the position and size of its text.
  resizeLeaderboard(width, height) {
    const rankX = width * 0.32;
    const nameX = width * 0.35;
    const distanceX = width * 0.62;
    const scoreX = width * 0.69;
    const headerY = height * 0.31;
    const firstRowY = height * 0.36;
    const rowGap = height * 0.052;
    const rowFontSize = height / 26;

    this.positionColumnHeaders({ rankX, nameX, distanceX, scoreX, headerY, rowFontSize });
    this.positionLeaderboardRows({
      rankX,
      nameX,
      distanceX,
      scoreX,
      firstRowY,
      rowGap,
      rowFontSize,
    });
    this.emptyLeaderboardText?.setPosition(width / 2, height * 0.5).setFontSize(rowFontSize);
  }

  // Positions the column headers using the calculated layout values.
  positionColumnHeaders({ rankX, nameX, distanceX, scoreX, headerY, rowFontSize }) {
    this.columnHeaders.forEach((header) => header.setFontSize(rowFontSize));
    this.columnHeaders[0].setPosition(rankX, headerY);
    this.columnHeaders[1].setPosition(nameX, headerY);
    this.columnHeaders[2].setPosition(distanceX, headerY);
    this.columnHeaders[3].setPosition(scoreX, headerY);
  }

  // Positions each row and fits player names before the distance column.
  positionLeaderboardRows({ rankX, nameX, distanceX, scoreX, firstRowY, rowGap, rowFontSize }) {
    this.leaderboardEntries.forEach((row, index) => {
      const y = firstRowY + index * rowGap;
      row.rank.setPosition(rankX, y).setFontSize(rowFontSize);
      row.name.setPosition(nameX, y).setFontSize(rowFontSize);
      this.fitLeaderboardName(row.name, rowFontSize, nameX, distanceX);
      row.distance.setPosition(distanceX, y).setFontSize(rowFontSize);
      row.score.setPosition(scoreX, y).setFontSize(rowFontSize);
    });
  }

  // Shrinks a player name when it exceeds the space available in its column.
  fitLeaderboardName(name, fontSize, nameX, distanceX) {
    const availableNameWidth = distanceX - nameX - 18 * this.scaleFactor;
    if (name.width > availableNameWidth) {
      name.setFontSize(fontSize * (availableNameWidth / name.width));
    }
  }
}

// Loads the leaderboard and returns its entries without creating scene objects.
export async function parseLeaderboard() {
  return (await loadLeaderboard()).entries;
}
