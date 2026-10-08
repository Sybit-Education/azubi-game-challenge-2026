/* global Phaser */

export default class NameInputScene extends Phaser.Scene {
  constructor() {
    super('NameInputScene');
  }

  init(data) {
    this.isMultiplayer = data.isMultiplayer;
  }

  create() {

    // Titel
    this.add.text(
      this.scale.width / 2,
      this.scale.height / 3,
      'Gib deinen Namen ein',
      {
        fontFamily: 'Tiny5',
        fontSize: '48px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // Name speichern
    this.playerName = '';

    // Angezeigter Name
    this.nameText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'Name: ',
      {
        fontFamily: 'Tiny5',
        fontSize: '32px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // Tastatureingabe
    this.input.keyboard.on('keydown', (event) => {

      if (event.key === 'Enter') {

        if (this.playerName.trim().length === 0) return;

        localStorage.setItem('Playername', this.playerName);

        this.scene.start('GameScene', {
          isMultiplayer: this.isMultiplayer
        });

        return;
      }

      if (event.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      }
      else if (event.key.length === 1) {
        this.playerName += event.key;
      }

      this.nameText.setText(`Name: ${this.playerName}`);
    });
  }
}
