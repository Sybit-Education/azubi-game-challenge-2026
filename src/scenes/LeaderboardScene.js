/* global Phaser*/
export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
  }

  create() {

    // Hintergrund
    this.add
      .image(
        this.scale.width / 2,
        this.scale.height / 2,
        'homepage-hintergrund'
      )
      .setDisplaySize(this.scale.width, this.scale.height);

    // Titel
    this.add.text(
      this.scale.width / 2,
      100,
      'Leaderboard'
    ).setOrigin(0.5);

    // Button zurück zum Hauptmenu
    const backButton = this.add
      .image(
        this.scale.width / 2,
        this.scale.height / 1.14,
        'homepage-leaderboard-btn'
      )
      .setScale(2)
      .setOrigin(0.5)
      .setInteractive();

    backButton.on('pointerdown', () => {
      console.log('BACK');
      this.scene.start('MenuScene');
    });

  }
}