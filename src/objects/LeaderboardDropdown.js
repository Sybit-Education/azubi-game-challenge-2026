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

export { COLORS as LEADERBOARD_COLORS };

export default class LeaderboardDropdown {
  constructor(scene, button, options) {
    this.scene = scene;
    this.button = button;
    this.items = [];

    const itemHeight = 56 * scene.scaleFactor;
    const panelWidth = 120 * scene.scaleFactor;
    const panelHeight = itemHeight * options.length;

    this.panel = scene.add
      .rectangle(0, 0, panelWidth, panelHeight, COLORS.keyFill)
      .setOrigin(0.5, 0)
      .setStrokeStyle(2 * scene.scaleFactor, COLORS.selected)
      .setVisible(false);

    options.forEach((option) => {
      const row = scene.add
        .rectangle(0, 0, panelWidth, itemHeight, COLORS.keyFill)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      const text = scene.add
        .text(0, 0, option.label, {
          fontFamily: 'Silkscreen',
          fontSize: `${20 * scene.scaleFactor}px`,
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

      this.items.push(item);
    });

    this.resize();
  }

  get isOpen() {
    return this.panel.visible;
  }

  setVisible(visible) {
    this.panel.setVisible(visible);
    this.items.forEach(({ row, text }) => {
      row.setVisible(visible);
      text.setVisible(visible);
    });
  }

  toggle() {
    this.setVisible(!this.isOpen);
  }

  setSelected(value) {
    this.items.forEach((item) => {
      item.selected = item.value === value;
      item.text.setColor(item.selected ? COLORS.selectedLabel : COLORS.mainText);
    });
  }

  resize() {
    const scaleFactor = this.scene.scaleFactor;
    const itemHeight = 56 * scaleFactor;
    const panelWidth = 120 * scaleFactor;
    const panelHeight = itemHeight * this.items.length;
    const buttonLeft = this.button.x - panelWidth / 2;
    const dropdownCenterX = buttonLeft + panelWidth / 2;
    const dropdownTop = this.button.y + itemHeight / 2 + 4 * scaleFactor;

    this.panel
      .setPosition(dropdownCenterX, dropdownTop)
      .setSize(panelWidth, panelHeight)
      .setStrokeStyle(2 * scaleFactor, COLORS.selected);

    this.items.forEach((item, index) => {
      const centerY = dropdownTop + itemHeight / 2 + index * itemHeight;
      item.row.setPosition(dropdownCenterX, centerY).setSize(panelWidth, itemHeight);
      item.text.setPosition(dropdownCenterX, centerY).setFontSize(18 * scaleFactor);
    });
  }
}
