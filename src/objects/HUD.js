export default class HUD {
  constructor(scene, car, secondCar = null) {
    this.car = car;
    this.secondCar = secondCar;
    this.scaleFactor = Math.min(scene.scale.width / 1920, scene.scale.height / 1080);
    this.scene = scene;
    const margin = 20 * this.scaleFactor;
    this.hudBackground = scene.add.graphics();
    this.hudBackground2 = scene.add.graphics();
    this.activePowerups = [];

    // Player 1 (top-left)
    this.distanceText = scene.add
      .text(margin, margin, '', {
        fontFamily: 'Tiny5',
        fontSize: `${40 * this.scaleFactor}px`,
      })
      .setOrigin(0, 0)
      .setDepth(5);

    this.scoreText = scene.add
      .text(margin, margin + 40 * this.scaleFactor, '', {
        fontFamily: 'Tiny5',
        fontSize: `${40 * this.scaleFactor}px`,
      })
      .setOrigin(0, 0)
      .setDepth(5);

    // Player 2 (top-right)
    if (this.secondCar) {
      this.distanceText2 = scene.add
        .text(scene.scale.width - margin, margin, '', {
          fontFamily: 'Tiny5',
          fontSize: `${40 * this.scaleFactor}px`,
        })
        .setOrigin(1, 0)
        .setDepth(5);

      this.scoreText2 = scene.add
        .text(scene.scale.width - margin, margin + 40 * this.scaleFactor, '', {
          fontFamily: 'Tiny5',
          fontSize: `${40 * this.scaleFactor}px`,
        })
        .setOrigin(1, 0)
        .setDepth(5);
    }

    this.statsBackground = this.scene.add
      .image(0 * this.scaleFactor, 0 * this.scaleFactor, 'stats-background')
      .setDepth(4)
      .setScale(0.65)
      .setOrigin(0);
  }

  update() {
    if (this.secondCar) {
      this.distanceText.setText(`P1 Distance: ${this.car.calculate_km()} km`);
      this.scoreText.setText(`P1 Score: ${this.car.score}`);

      this.distanceText2.setText(`P2 Distance: ${this.secondCar.calculate_km()} km`);
      this.scoreText2.setText(`P2 Score: ${this.secondCar.score}`);
    } else {
      this.distanceText.setText(`Distance: ${this.car.calculate_km()} km`);
      this.scoreText.setText(`Score: ${this.car.score}`);
    }

    const x = this.statsBackground.x;
    const y = this.statsBackground.y;
    const width = this.statsBackground.displayWidth;
    const height = this.statsBackground.displayHeight;

    this.hudBackground.clear();
    this.hudBackground.fillStyle(0x000000, 0.9);
    this.hudBackground.fillRect(x, y, width, height);

    this.hudBackground.lineStyle(10, 0x000000, 1);
    this.hudBackground.strokeRect(x, y, width, height);
    this.hudBackground.setDepth(1);
  }

  showPowerupTimer(texture, duration = 10000, scale = 0.05) {
    const icon = this.scene.add
      .image(0, 140 * this.scaleFactor, texture)
      .setScale(scale * this.scaleFactor)
      .setDepth(10);

    const overlay = this.scene.add.graphics();
    overlay.setDepth(11);

    const powerup = {
      icon,
      overlay,
      permanent: true,
      type: 'extraLife',
    };

    this.activePowerups.push(powerup);

    this.layoutPowerups();

    const progress = { value: 0 };

    this.scene.tweens.add({
      targets: progress,
      value: 1,
      duration,

      onUpdate: () => {
        overlay.clear();
        overlay.fillStyle(0x000000, 0.7);

        overlay.fillRect(
          icon.x - icon.displayWidth / 2,
          icon.y - icon.displayHeight / 2,
          icon.displayWidth,
          icon.displayHeight * progress.value,
        );
      },

      onComplete: () => {
        overlay.destroy();
        icon.destroy();

        const index = this.activePowerups.indexOf(powerup);

        if (index !== -1) {
          this.activePowerups.splice(index, 1);
        }

        this.layoutPowerups();
      },
    });
  }

  layoutPowerups() {
    const startX = 60 * this.scaleFactor;
    const y = 140 * this.scaleFactor;
    const spacing = 50 * this.scaleFactor;

    this.activePowerups.forEach((powerup, index) => {
      const targetX = startX + spacing * index;

      this.scene.tweens.add({
        targets: powerup.icon,
        x: targetX,
        y,
        duration: 200,
        ease: 'Power2',
      });
    });
  }

  displayExtraLife() {
    if (this.extraLifePowerup) {
      return;
    }

    const icon = this.scene.add
      .image(0, 0, 'extraLife')
      .setScale(0.02 * this.scaleFactor)
      .setDepth(10);

    this.extraLifePowerup = {
      icon,
      permanent: true,
      type: 'extraLife',
    };

    this.activePowerups.unshift(this.extraLifePowerup);

    this.layoutPowerups();
  }

  deactivateExtraLife() {
    if (!this.extraLifePowerup) {
      return;
    }

    this.extraLifePowerup.icon.destroy();

    const index = this.activePowerups.indexOf(this.extraLifePowerup);

    if (index !== -1) {
      this.activePowerups.splice(index, 1);
    }

    this.extraLifePowerup = null;

    this.layoutPowerups();
  }
}
