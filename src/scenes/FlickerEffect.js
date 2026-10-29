import Phaser from 'phaser';

export default class FlickerEffect {
  constructor(scene, normalBg, flashBg) {
    this.scene = scene;
    this.flashBg = flashBg;
  }

  start() {
    this.flashBg.setVisible(false);
    this.scheduleNextFlicker();
  }

  scheduleNextFlicker() {
    const delay = Phaser.Math.Between(2000, 8000);

    this.scene.time.delayedCall(delay, () => {
      this.lightningStrike();
    });
  }

  lightningStrike() {
    const numFlashes = Phaser.Math.Between(1, 4);
    let flashDelay = 0;
    let totalStrikeDuration = 0;

    for (let i = 0; i < numFlashes; i++) {
      if (i > 0) {
        flashDelay += Phaser.Math.Between(250, 500);
      }
      const flashDuration = Phaser.Math.Between(100, 200);
      totalStrikeDuration = flashDelay + flashDuration;

      this.scene.time.delayedCall(flashDelay, () => {
        this.flashBg.setVisible(true);

        this.scene.time.delayedCall(flashDuration, () => {
          this.flashBg.setVisible(false);
        });
      });
    }

    this.scene.time.delayedCall(totalStrikeDuration, () => {
      this.scheduleNextFlicker();
    });
  }
}
