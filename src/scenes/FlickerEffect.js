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

        for (let i = 0; i < numFlashes; i++) {
            const flashDelay = i * Phaser.Math.Between(60, 150);

            this.scene.time.delayedCall(flashDelay, () => {
                this.flashBg.setVisible(true);

                this.scene.time.delayedCall(
                    Phaser.Math.Between(30, 80),
                    () => {
                        this.flashBg.setVisible(false);
                    }
                );
            });
        }

        const totalStrikeDuration = numFlashes * 150;

        this.scene.time.delayedCall(totalStrikeDuration, () => {
            this.scheduleNextFlicker();
        });
    }
}