import Phaser from 'phaser';
import InputManager from '../objects/InputManager.js';
import LeaderboardTable from '../objects/LeaderboardTable.js';
import { preloadMenuSounds, playMenuClick } from '../../audio/sounds.js';
import { bindLeaderboardControls } from '../accessibility/leaderboard.js';
export { parseLeaderboard } from '../objects/LeaderboardTable.js';

// Color config
const COLORS = {
  grid: 0x520078,
  border: 0xe32bff,
  selected: 0xc8ff16,
  mainText: '#ffffff',
  secondaryText: '#cdb8e4',
  selectedLabel: '#c8ff16',
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

    this.currentFilter = 'all'; // default filter
    this.isSortDropdownOpen = false;
    this.isFilterDropdownOpen = false;
    this.openDropdown = null;
    this.leaderboardTable = new LeaderboardTable(this);
    const leaderboard = await this.leaderboardTable.loadEntries();

    this.scaleFactor = Math.min(this.scale.width / 1920, this.scale.height / 1080);

    this.createParallaxBackground();
    this.createTitle();
    this.leaderboardTable.create(leaderboard);
    this.registerResizeHandler();
    this.createSearchBar();
    this.createFilterButton();
    this.createSortButton();
    this.createBackButton();

    this.resize({
      width: this.scale.width,
      height: this.scale.height,
    });
    bindLeaderboardControls(
      this,
      leaderboard,
      data?.focusTarget,
      this.leaderboardTable.isTampered,
    );
  }

  // Creates a reusable dropdown menu for a button.
  createDropdown(button, options, dropdownScaling = 80) {
    button.dropdownScaling = dropdownScaling;

    const items = [];

    const itemHeight = 56 * this.scaleFactor;
    const panelWidth = (120 + button.dropdownScaling) * this.scaleFactor;
    const panelHeight = itemHeight * options.length;

    // Background of the entire dropdown.
    const panel = this.add
      .rectangle(0, 0, panelWidth, panelHeight, COLORS.keyFill)
      .setOrigin(0.5, 0)
      .setStrokeStyle(2 * this.scaleFactor, COLORS.selected)
      .setVisible(false);

    options.forEach((option) => {
      const row = this.add
        .rectangle(0, 0, panelWidth, itemHeight, COLORS.keyFill)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      const text = this.add
        .text(0, 0, option.label, {
          fontFamily: 'Silkscreen',
          fontSize: `${20 * this.scaleFactor}px`,
          color: option.selected ? COLORS.selectedLabel : COLORS.mainText,
        })
        .setOrigin(0.5)
        .setVisible(false);

      const item = {
        row,
        text,
        value: option.value,
        selected: option.selected ?? false,
      };

      row.on('pointerdown', option.callback);

      row.on('pointerover', () => {
        row.setFillStyle(COLORS.selected);
        text.setColor(COLORS.selectedText);
      });

      row.on('pointerout', () => {
        row.setFillStyle(COLORS.keyFill);
        text.setColor(item.selected ? COLORS.selectedLabel : COLORS.mainText);
      });

      items.push(item);
    });

    button.dropdown = {
      panel,
      items,
    };

    this.resizeDropdown(button);
  }

  // Repositions and rescales a dropdown after screen resize or button movement.
  resizeDropdown(button) {
    if (!button.dropdown) {
      return;
    }

    const itemHeight = 56 * this.scaleFactor;
    const panelHeight = itemHeight * button.dropdown.items.length;
    const buttonWidth = 120 * this.scaleFactor;
    const panelWidth = buttonWidth;
    const buttonLeft = button.x - buttonWidth / 2;
    const dropdownCenterX = buttonLeft + panelWidth / 2;

    // Position directly below button.
    const dropdownTop = button.y + (56 * this.scaleFactor) / 2 + 4 * this.scaleFactor;

    // Resize and position panel.
    button.dropdown.panel
      .setPosition(dropdownCenterX, dropdownTop)
      .setSize(panelWidth, panelHeight)
      .setStrokeStyle(2 * this.scaleFactor, COLORS.selected);

    // Position each row inside the panel.
    button.dropdown.items.forEach((item, index) => {
      const centerY = dropdownTop + itemHeight / 2 + index * itemHeight;

      item.row.setPosition(dropdownCenterX, centerY).setSize(panelWidth, itemHeight);

      item.text.setPosition(dropdownCenterX, centerY).setFontSize(18 * this.scaleFactor);
    });
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
        this.leaderboardTable.isTampered ? 'Leaderboard\n⚠ manipuliert' : 'Leaderboard',
        {
          fontFamily: 'Silkscreen',
          fontSize: this.leaderboardTable.isTampered ? '60px' : '90px',
          color: '#ffffff',
          align: 'center',
        },
      )
      .setOrigin(0.5)
      .setScale(1 * this.scaleFactor);
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

    this.createDropdown(
      this.filterButton,
      [
        {
          label: 'ALL',
          value: 'all',
          selected: true,
          callback: () => this.changeFilter('all'),
        },
      ],
      40,
    );

    this.filterButton.on('pointerdown', () => {
      this.toggleDropdown(this.filterButton);
    });
  }

  createSortButton() {
    const sort = this.createActionButton('SORT ▼');

    this.sortButton = sort.button;
    this.sortButtonText = sort.text;

    this.createDropdown(this.sortButton, [
      {
        label: 'DISTANCE',
        value: 'distance',
        selected: true,
        callback: () => this.changeSort('distance'),
      },
      {
        label: 'SCORE',
        value: 'score',
        callback: () => this.changeSort('score'),
      },
    ]);

    this.sortButton.on('pointerdown', () => {
      this.toggleDropdown(this.sortButton);
    });
  }

  // Shows or hides a dropdown menu.
  toggleDropdown(button) {
    // Close another dropdown if one is already open.
    if (this.openDropdown && this.openDropdown !== button) {
      this.openDropdown.dropdown.panel.setVisible(false);

      this.openDropdown.dropdown.items.forEach((item) => {
        item.row.setVisible(false);
        item.text.setVisible(false);
      });
    }
    const visible = button.dropdown.panel.visible;

    button.dropdown.panel.setVisible(!visible);

    button.dropdown.items.forEach((item) => {
      item.row.setVisible(!visible);
      item.text.setVisible(!visible);
    });
    this.openDropdown = visible ? null : button;
  }

  // Changes the current sorting mode and refreshes the leaderboard.
  async changeSort(sortType) {
    if (this.leaderboardTable.currentSort === sortType) {
      this.toggleDropdown(this.sortButton);
      return;
    }

    this.sortButton.dropdown.items.forEach((item) => {
      item.selected = item.value === sortType;
      item.text.setColor(item.selected ? COLORS.selectedLabel : COLORS.mainText);
    });

    this.toggleDropdown(this.sortButton);

    await this.leaderboardTable.setSort(sortType);
  }

  // Changes the current filter and refreshes the leaderboard.
  async changeFilter(filterType) {
    if (this.currentFilter === filterType) {
      this.toggleDropdown(this.filterButton);
      return;
    }

    this.currentFilter = filterType;

    this.filterButton.dropdown.items.forEach((item) => {
      item.selected = item.value === filterType;
      item.text.setColor(item.selected ? COLORS.selectedLabel : COLORS.mainText);
    });

    this.toggleDropdown(this.filterButton);

    await this.leaderboardTable.refresh();
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

    button.on('pointerdown', () => {
      playMenuClick(this);
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
    this.leaderboardTable.resize(width, height);
    this.resizeSearchControls(width, height);
    this.resizeBackButton();
  }

  // Positions the search field and its adjacent action buttons at the current scale.
  resizeSearchControls(width, height) {
    this.nameFieldWidth = 700 * this.scaleFactor;
    this.nameFontSize = 24 * this.scaleFactor;

    const controlsY = height * 0.2;
    const firstColumnBounds = this.leaderboardTable.columnHeaders[0].getBounds();
    const lastColumnBounds = this.leaderboardTable.columnHeaders[3].getBounds();
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
    this.resizeDropdown(this.filterButton);
    this.sortButton.setPosition(sortX, controlsY).setScale(this.scaleFactor);
    this.sortButtonText.setPosition(sortX, controlsY).setFontSize(20 * this.scaleFactor);
    this.resizeDropdown(this.sortButton);
  }

  // Resizes and centers the background to match the game dimensions.
  resizeBackground(width, height) {
    this.background.setPosition(width / 2, height / 2).setDisplaySize(width * 1.01, height * 1.01);
  }

  // Repositions and scales the title for the current screen size.
  resizeTitle(width, height) {
    this.title
      .setPosition(width / 2, height / 12)
      .setFontSize((this.leaderboardTable.isTampered ? 60 : 90) * this.scaleFactor);
  }

  // Repositions and rescales the return button with the current screen size.
  resizeBackButton() {
    this.returnButton
      .setPosition(200 * this.scaleFactor, 50 * this.scaleFactor)
      .setScale(0.1 * this.scaleFactor);
  }
}
