import Phaser from 'phaser';
import InputManager from '../objects/InputManager.js';
import LeaderboardTable from '../utils/LeaderboardTable.js';
import LeaderboardDropdown, { LEADERBOARD_COLORS as COLORS } from '../utils/LeaderboardDropdown.js';
import { preloadMenuSounds, playMenuClick } from '../../audio/sounds.js';
import { bindLeaderboardControls, renderLeaderboardEntries } from '../accessibility/leaderboard.js';
import {
  addButtonPrompt,
  BUTTON_PROMPT_SIZE,
  buttonPromptWidth,
  preloadButtonPrompts,
  setButtonPromptSize,
  updateButtonPromptPressed,
} from '../objects/buttonPrompts.js';
import { createSelectionOutline, updateSelectionOutline } from '../objects/menuSelectionOutline.js';
import { menuMoveFeedback } from '../objects/menuNavigation.js';
import { createParallax } from '../objects/parallax.js';
export { parseLeaderboard } from '../utils/LeaderboardTable.js';

export default class LeaderboardScene extends Phaser.Scene {
  // Initializes the Phaser scene under its registered scene key.
  constructor() {
    super('LeaderboardScene');
  }

  // Preloads menu audio and the images used by the leaderboard scene.
  preload() {
    preloadMenuSounds(this);
    preloadButtonPrompts(this);
    this.load.image(
      'homepage-hintergrund',
      'assets/images/homepage/default-homepage/background.png',
    );
    this.load.image('return-button', 'assets/images/homepage/return-button.png');
    this.load.image('blind-icon', 'assets/images/leaderboard-scene-assets/blind.png');
  }

  // Builds the leaderboard scene, then applies its initial layout and controls.
  async create(data) {
    this.InputManager = new InputManager(this);
    this.InputManager.create();

    this.currentFilter = 'all'; // default filter
    this.searchQuery = '';
    this.maxSearchLength = 45;
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
    this.createKeyboardInput();
    this.createFilterButton();
    this.createSortButton();
    this.createBackButton();
    this.createControllerNavigation();

    this.resize({
      width: this.scale.width,
      height: this.scale.height,
    });
    bindLeaderboardControls(this, leaderboard, data?.focusTarget, this.leaderboardTable.isTampered);
  }

  // Adds the parallax background and connects it to pointer movement.
  createParallaxBackground() {
    this.background = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width * 1.01, this.scale.height * 1.01)
      .setDepth(-2);

    // Follows the mouse, and glides to the controller's selection (see update())
    this.parallax = createParallax(this, [
      { object: this.background, base: (w, h) => [w / 2, h / 2], factor: 0.01 },
    ]);
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
      .setDepth(0)
      .setInteractive({ cursor: 'text' });
    this.searchBackground.on('pointerdown', () => {
      document.getElementById('leaderboard-search').focus();
    });

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

  createKeyboardInput() {
    let selectedAll = false;

    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        selectedAll = this.searchQuery.length > 0;
        return;
      }

      if (event.key === 'Backspace') {
        const query = selectedAll ? '' : this.searchQuery.slice(0, -1);
        selectedAll = false;
        this.setSearchQuery(query);
        return;
      }

      if (!/^[a-zA-Z0-9]$/.test(event.key)) return;

      const character = event.key.toUpperCase();
      let query = this.searchQuery;
      if (selectedAll) {
        query = character;
      } else if (query.length < this.maxSearchLength) {
        query += character;
      }
      selectedAll = false;
      this.setSearchQuery(query);
    };

    this.input.keyboard.on('keydown', handleKeyDown);
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', handleKeyDown);
    });
  }

  // Applies a new search query to the canvas, the HTML search field and the table.
  setSearchQuery(query) {
    this.searchQuery = query;
    const searchField = document.getElementById('leaderboard-search');
    if (searchField && searchField.value !== query) searchField.value = query;
    this.updateSearchPrompt();
    this.refreshAccessibleEntries(this.leaderboardTable.setSearchQuery(query));
  }

  // Re-renders the screen reader table and syncs the HTML controls with the canvas state.
  refreshAccessibleEntries(entries) {
    renderLeaderboardEntries(entries, this.leaderboardTable.currentSort);
    this.syncAccessibleControls?.();
  }

  updateSearchPrompt() {
    const hasQuery = this.searchQuery.length > 0;
    const labelWidth = hasQuery ? 0 : this.labelText.width;
    this.labelText.setVisible(!hasQuery);

    const nameTextX = this.labelText.x + labelWidth + (hasQuery ? 0 : 8 * this.scaleFactor);
    this.nameText
      .setText(this.searchQuery)
      .setFontSize(this.nameFontSize)
      .setPosition(nameTextX, this.labelText.y);

    const availableQueryWidth = Math.max(
      0,
      this.nameFieldWidth - labelWidth - (hasQuery ? 24 : 36) * this.scaleFactor,
    );
    if (this.nameText.width > availableQueryWidth) {
      this.nameText.setFontSize(this.nameFontSize * (availableQueryWidth / this.nameText.width));
    }
  }

  createFilterButton() {
    const filter = this.createActionButton('FILTER ▼');

    this.filterButton = filter.button;
    this.filterButtonText = filter.text;

    this.filterDropdown = new LeaderboardDropdown(
      this,
      this.filterButton,
      [
        {
          label: 'ALL',
          value: 'all',
          selected: true,
          callback: () => this.changeFilter('all'),
        },
        {
          label: 'BLINDED',
          value: 'blinded',
          callback: () => this.changeFilter('blinded'),
        },
        {
          label: 'SIGHTED',
          value: 'non-blinded',
          callback: () => this.changeFilter('non-blinded'),
        },
      ],
      190,
    );

    this.filterButton.on('pointerdown', () => {
      this.toggleDropdown(this.filterDropdown);
    });
  }

  createSortButton() {
    const sort = this.createActionButton('SORT ▼');

    this.sortButton = sort.button;
    this.sortButtonText = sort.text;

    this.sortDropdown = new LeaderboardDropdown(this, this.sortButton, [
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
      this.toggleDropdown(this.sortDropdown);
    });
  }

  // Shows or hides a dropdown menu.
  toggleDropdown(dropdown) {
    // Close another dropdown if one is already open.
    if (this.openDropdown && this.openDropdown !== dropdown) {
      this.openDropdown.setVisible(false);
    }
    dropdown.toggle();
    this.openDropdown = dropdown.isOpen ? dropdown : null;
    this.syncAccessibleControls?.();
  }

  // Changes the current sorting mode and refreshes the leaderboard.
  async changeSort(sortType) {
    if (this.leaderboardTable.currentSort === sortType) {
      this.toggleDropdown(this.sortDropdown);
      return;
    }

    this.sortDropdown.setSelected(sortType);

    this.toggleDropdown(this.sortDropdown);

    const entries = await this.leaderboardTable.setSort(sortType);
    this.refreshAccessibleEntries(entries);
  }

  // Changes the current filter and refreshes the leaderboard.
  async changeFilter(filterType) {
    if (this.currentFilter === filterType) {
      this.toggleDropdown(this.filterDropdown);
      return;
    }

    this.currentFilter = filterType;

    this.filterDropdown.setSelected(filterType);

    this.toggleDropdown(this.filterDropdown);

    const entries = await this.leaderboardTable.setFilter(filterType);
    this.refreshAccessibleEntries(entries);
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

    // Joy-Con Y icon next to the return button (positioned in update())
    this.backPrompt = addButtonPrompt(this, 'y', BUTTON_PROMPT_SIZE * this.scaleFactor);
  }

  // Keeps the Y icon right of the return button (follows resizes).
  // Shown only while a Joy-Con was the last input.
  updateButtonPrompt() {
    if (!this.backPrompt || !this.returnButton) return; // create() is still loading
    const show = Boolean(this.InputManager.showJoyConPrompts);
    this.backPrompt.setVisible(show);
    if (!show) return;

    const bounds = this.returnButton.getBounds();
    setButtonPromptSize(this.backPrompt, BUTTON_PROMPT_SIZE * this.scaleFactor);
    updateButtonPromptPressed(this.backPrompt, this.InputManager.getControlsP1);
    this.backPrompt.setPosition(
      bounds.right + 12 * this.scaleFactor + buttonPromptWidth(this.backPrompt) / 2,
      bounds.centerY,
    );
  }

  // Returns to the active menu and restores focus to its leaderboard button.
  goHome() {
    playMenuClick(this);
    this.InputManager?.rumbleBack();
    const menu = this.registry.get('gameMode') === 'christmas' ? 'ChristmasScene' : 'MenuScene';
    this.scene.start(menu, { focusTarget: 'leaderboard-btn' });
  }

  // Controller focus for the FILTER / SORT buttons and their dropdowns.
  createControllerNavigation() {
    this.navButtons = [
      { button: this.filterButton, dropdown: this.filterDropdown },
      { button: this.sortButton, dropdown: this.sortDropdown },
    ];
    this.navIndex = 0;
    this.dropdownIndex = -1; // highlighted dropdown row, -1 while no dropdown is open
    this.previousNavigation = { left: false, right: false, up: false, down: false };
    this.selectionOutline = createSelectionOutline(this);
  }

  // Updates input and handles controller navigation; Y closes a dropdown or returns to the menu.
  update() {
    this.InputManager.update();
    this.updateButtonPrompt();

    const controls = this.InputManager.getControlsP1;
    if (!this.navButtons) return; // create() is still loading

    const { dropdown } = this.navButtons[this.navIndex];
    // Closed by the mouse: drop the controller highlight so it isn't stuck on reopening
    if (!dropdown.isOpen && this.dropdownIndex >= 0) this.highlightDropdownItem(dropdown, -1);

    if (controls.button4) {
      if (this.openDropdown) this.closeDropdownFromController();
      else this.goHome();
      return;
    }

    this.handleControllerNavigation(controls);
    // Parallax follows the controller's selection like it follows the mouse
    if (this.InputManager.usingGamepad) {
      const current = this.navButtons[this.navIndex];
      const row = current.dropdown.isOpen && current.dropdown.items[this.dropdownIndex]?.row;
      this.parallax?.focusOn(row || current.button);
    }
    updateSelectionOutline(
      this,
      this.selectionOutline,
      this.navButtons[this.navIndex].button,
      this.InputManager.usingGamepad,
    );
  }

  handleControllerNavigation(controls) {
    const pressed = {};
    for (const direction of ['left', 'right', 'up', 'down']) {
      const key = `pad${direction[0].toUpperCase()}${direction.slice(1)}`;
      pressed[direction] = controls[key] && !this.previousNavigation[direction];
      this.previousNavigation[direction] = controls[key];
    }
    // X confirms; Enter (also button3) is ignored so typing a search doesn't open dropdowns
    const confirm = controls.button3 && this.InputManager.usingGamepad;
    const { dropdown } = this.navButtons[this.navIndex];

    if (dropdown.isOpen) {
      const count = dropdown.items.length;
      if (pressed.up || pressed.down) {
        const step = pressed.down ? 1 : -1;
        this.highlightDropdownItem(dropdown, (this.dropdownIndex + step + count) % count);
        menuMoveFeedback(this);
      }
      if (confirm && this.dropdownIndex >= 0) {
        const item = dropdown.items[this.dropdownIndex];
        playMenuClick(this);
        this.highlightDropdownItem(dropdown, -1);
        item.row.emit('pointerdown'); // runs the option's callback, which closes the dropdown
      }
      return;
    }

    if (pressed.left || pressed.right) {
      const count = this.navButtons.length;
      this.navIndex = (this.navIndex + (pressed.right ? 1 : -1) + count) % count;
      menuMoveFeedback(this);
    }
    if (confirm) {
      playMenuClick(this);
      this.toggleDropdown(dropdown);
      const selected = dropdown.items.findIndex((item) => item.selected);
      this.highlightDropdownItem(dropdown, Math.max(0, selected));
    }
  }

  // Moves the controller highlight to dropdown row `index` (-1 clears it),
  // reusing the rows' mouse-hover look.
  highlightDropdownItem(dropdown, index) {
    dropdown.items[this.dropdownIndex]?.row.emit('pointerout');
    this.dropdownIndex = index;
    dropdown.items[index]?.row.emit('pointerover');
  }

  closeDropdownFromController() {
    this.highlightDropdownItem(this.openDropdown, -1);
    this.toggleDropdown(this.openDropdown);
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
    this.updateSearchPrompt();
    this.filterButton.setPosition(filterX, controlsY).setScale(this.scaleFactor);
    this.filterButtonText.setPosition(filterX, controlsY).setFontSize(20 * this.scaleFactor);
    this.filterDropdown.resize();
    this.sortButton.setPosition(sortX, controlsY).setScale(this.scaleFactor);
    this.sortButtonText.setPosition(sortX, controlsY).setFontSize(20 * this.scaleFactor);
    this.sortDropdown.resize();
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
