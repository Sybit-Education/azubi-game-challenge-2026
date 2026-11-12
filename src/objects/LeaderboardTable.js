import { loadLeaderboard } from '../utils/leaderboardSecurity.js';

export default class LeaderboardTable {
  constructor(scene) {
    this.scene = scene;
    this.currentSort = 'distance';
    this.isTampered = false;
    this.columnHeaders = [];
    this.leaderboardEntries = [];
    this.emptyLeaderboardText = null;
  }

  async loadEntries() {
    const result = await loadLeaderboard();
    this.isTampered = result.isTampered;
    this.entries = this.getSortedEntries(result.entries).slice(0, 10);
    return this.entries;
  }

  getSortedEntries(entries) {
    const sortedEntries = [...entries];
    if (this.currentSort === 'score') {
      sortedEntries.sort((a, b) => b.score - a.score);
    } else {
      sortedEntries.sort((a, b) => b.distance - a.distance);
    }

    return sortedEntries;
  }

  create(entries) {
    const textStyle = this.getLeaderboardTextStyle();
    this.createColumnHeaders(textStyle);
    this.createLeaderboardRows(entries, textStyle);
    this.createEmptyLeaderboardMessage(entries.length, textStyle);
  }

  async setSort(sortType) {
    this.currentSort = sortType;
    return this.refresh();
  }

  async refresh() {
    this.leaderboardEntries.forEach((row) => {
      row.rank.destroy();
      row.name.destroy();
      row.distance.destroy();
      row.score.destroy();
    });
    this.emptyLeaderboardText?.destroy();

    const entries = await this.loadEntries();
    const textStyle = this.getLeaderboardTextStyle();
    this.createLeaderboardRows(entries, textStyle);
    this.createEmptyLeaderboardMessage(entries.length, textStyle);
    this.resize(this.scene.scale.width, this.scene.scale.height);

    return entries;
  }

  getLeaderboardTextStyle() {
    return {
      fontFamily: 'Silkscreen',
      fontSize: `${this.scene.scale.height / 26}px`,
      color: '#ffffff',
    };
  }

  createColumnHeaders(textStyle) {
    this.columnHeaders = [
      this.scene.add.text(0, 0, '#', textStyle).setOrigin(0.5, 1),
      this.scene.add.text(0, 0, 'PLAYER', textStyle).setOrigin(0, 1),
      this.scene.add.text(0, 0, 'DISTANCE', textStyle).setOrigin(1),
      this.scene.add.text(0, 0, 'SCORE', textStyle).setOrigin(1),
    ];
  }

  createLeaderboardRows(entries, textStyle) {
    this.leaderboardEntries = entries.map((entry, index) =>
      this.createLeaderboardRow(entry, index, textStyle),
    );
  }

  createLeaderboardRow(entry, index, textStyle) {
    const name = entry.name || 'Unbekannt';
    const displayName = entry.isTampered ? `${name} ⚠ manipuliert` : name;
    const alpha = index <= 7 ? 1 - (index / 2) * 0.04 : 0.75;

    return {
      rank: this.scene.add
        .text(0, 0, String(index + 1), textStyle)
        .setOrigin(0.5)
        .setAlpha(alpha),
      name: this.scene.add
        .text(0, 0, displayName, textStyle)
        .setOrigin(0, 0.5)
        .setAlpha(alpha),
      distance: this.scene.add
        .text(0, 0, `${entry.distance} km`, textStyle)
        .setOrigin(1, 0.5)
        .setAlpha(alpha),
      score: this.scene.add
        .text(0, 0, String(entry.score ?? 0), textStyle)
        .setOrigin(1, 0.5)
        .setAlpha(alpha),
    };
  }

  createEmptyLeaderboardMessage(entryCount, textStyle) {
    this.emptyLeaderboardText =
      entryCount === 0
        ? this.scene.add
            .text(this.scene.scale.width / 2, this.scene.scale.height / 2, 'NO ENTRIES YET', {
              ...textStyle,
              align: 'center',
            })
            .setOrigin(0.5)
        : null;
  }

  resize(width, height) {
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

  positionColumnHeaders({ rankX, nameX, distanceX, scoreX, headerY, rowFontSize }) {
    this.columnHeaders.forEach((header) => header.setFontSize(rowFontSize));
    this.columnHeaders[0].setPosition(rankX, headerY);
    this.columnHeaders[1].setPosition(nameX, headerY);
    this.columnHeaders[2].setPosition(distanceX, headerY);
    this.columnHeaders[3].setPosition(scoreX, headerY);
  }

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

  fitLeaderboardName(name, fontSize, nameX, distanceX) {
    const availableNameWidth = distanceX - nameX - 18 * this.scene.scaleFactor;
    if (name.width > availableNameWidth) {
      name.setFontSize(fontSize * (availableNameWidth / name.width));
    }
  }
}

export async function parseLeaderboard() {
  return (await loadLeaderboard()).entries;
}
