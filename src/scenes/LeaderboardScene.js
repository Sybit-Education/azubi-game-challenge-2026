/* global Phaser*/
export default class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
  }

  create() {

    const leaderboard = JSON.parse(
      localStorage.getItem('leaderboard') || '[]'
    );

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

    // Einträge anzeigen
    leaderboard.forEach((distance, index) => {
      this.add.text(
        this.scale.width / 2,
        200 + index * 50,
        `${index + 1}. ${distance} km`
      ).setOrigin(0.5);
    });

    // Back Button
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
      this.scene.start('MenuScene');
    });
  }
}