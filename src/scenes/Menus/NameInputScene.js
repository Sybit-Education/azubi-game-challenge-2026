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
    this.playerNames = [];
    this.activePlayer = 0;

    this.add
      .text(this.scale.width / 2, this.scale.height / 3, 'Enter your name', {
        fontFamily: 'Tiny5',
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.nameText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, '', {
        fontFamily: 'Tiny5',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.updateNamePrompt();

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

  updateNamePrompt() {
    const currentName = this.playerNames[this.activePlayer] || '';
    if (!this.isMultiplayer) {
      this.nameText.setText(`Username: ${currentName}`);
    } else {
      const playerLabel = this.activePlayer === 0 ? 'Player 1' : 'Player 2';
      this.nameText.setText(`${playerLabel}: ${currentName}`);
    }
  }
}
