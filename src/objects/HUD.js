export default class HUD {
  constructor(scene, car, secondCar = null) {
    this.car = car;
    this.secondCar = secondCar;
    this.scaleFactor = Math.min(scene.scale.width / 1920, scene.scale.height / 1080);
    this.scene = scene;
    const margin = 20 * this.scaleFactor;
    this.statsFrame = scene.add.graphics();
    this.statsFrame2 = scene.add.graphics();
    this.activePowerupsP1 = [];
    this.activePowerupsP2 = [];
    this.extraLifePowerupP1 = null;
    this.extraLifePowerupP2 = null;

    // Player 1 (top-left)
    this.distanceText = scene.add
      .text(margin, margin, '', {
        fontFamily: 'Tiny5',
        fontSize: `${50 * this.scaleFactor}px`,
      })
      .setOrigin(0, 0)
      .setDepth(5);

    this.scoreText = scene.add
      .text(margin, margin + 40 * this.scaleFactor, '', {
        fontFamily: 'Tiny5',
        fontSize: `${50 * this.scaleFactor}px`,
      })
      .setOrigin(0, 0)
      .setDepth(5);

    // Player 2 (top-right)
    if (this.secondCar) {
      this.distanceText2 = scene.add
        .text(scene.scale.width - margin, margin, '', {
          fontFamily: 'Tiny5',
          fontSize: `${50 * this.scaleFactor}px`,
        })
        .setOrigin(1, 0)
        .setDepth(5);

      this.scoreText2 = scene.add
        .text(scene.scale.width - margin, margin + 40 * this.scaleFactor, '', {
          fontFamily: 'Tiny5',
          fontSize: `${50 * this.scaleFactor}px`,
        })
        .setOrigin(1, 0)
        .setDepth(5);

      this.statsBackground2 = this.scene.add
        .image(
          this.scene.scale.width - 0 * this.scaleFactor,
          0 * this.scaleFactor,
          'stats-background',
        )
        .setDepth(4)
        .setScale(0.5 * this.scaleFactor)
        .setOrigin(0);
      this.statsBackground2.setFlipX(true);
      this.statsBackground2.x -= this.statsBackground2.displayWidth;
    }

    this.statsBackground = this.scene.add
      .image(0 * this.scaleFactor, 0 * this.scaleFactor, 'stats-background')
      .setDepth(4)
      .setScale(0.5 * this.scaleFactor)
      .setOrigin(0);
  }

  update() {
    const x = this.statsBackground.x;
    const x2 = this.statsBackground.x;
    const y = this.statsBackground.y;
    const width = this.statsBackground.displayWidth;
    const height = this.statsBackground.displayHeight;

    if (this.secondCar) {
      this.distanceText.setText(`P1 Distance: ${this.car.calculate_km()} km`);
      this.scoreText.setText(`P1 Score: ${this.car.score}`);

      this.distanceText2.setText(`P2 Distance: ${this.secondCar.calculate_km()} km`);
      this.scoreText2.setText(`P2 Score: ${this.secondCar.score}`);

      this.distanceText.setFontSize(40 * this.scaleFactor);
      this.scoreText.setFontSize(40 * this.scaleFactor);

      this.distanceText2.setFontSize(40 * this.scaleFactor);
      this.scoreText2.setFontSize(40 * this.scaleFactor);
      this.statsFrame2.clear();
      this.statsFrame2.fillStyle(0x000000, 0.9);
      this.statsFrame2.fillRect(x, y, width, height);

      this.statsFrame2.lineStyle(10, 0x000000, 1);
      this.statsFrame2.strokeRect(x2, y, width, height);
      this.statsFrame2.setDepth(1);
    } else {
      this.distanceText.setText(`Distance: ${this.car.calculate_km()} km`);
      this.scoreText.setText(`Score: ${this.car.score}`);
    }

    this.statsFrame.clear();
    this.statsFrame.fillStyle(0x000000, 0.9);
    this.statsFrame.fillRect(x, y, width, height);

    this.statsFrame.lineStyle(10, 0x000000, 1);
    this.statsFrame.strokeRect(x, y, width, height);
    this.statsFrame.setDepth(1);
  }

  showPowerupTimer(texture, duration = 10000, scale = 0.05, player = 1) {
    const icon = this.scene.add
      .image(0, 180 * this.scaleFactor, texture)
      .setScale(scale * this.scaleFactor)
      .setDepth(10);

    const overlay = this.scene.add.graphics();
    overlay.setDepth(11);

    const powerup = {
      icon,
      overlay,
      permanent: true,
      type: texture,
      player,
    };

    if (player === 1) {
      this.activePowerupsP1.push(powerup);
    } else {
      this.activePowerupsP2.push(powerup);
    }

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

        const list = player === 1 ? this.activePowerupsP1 : this.activePowerupsP2;

        const index = list.indexOf(powerup);

        if (index !== -1) {
          list.splice(index, 1);
        }

        this.layoutPowerups();
      },
    });
  }

  layoutPowerups() {
    const y = 140 * this.scaleFactor;
    const spacing = 50 * this.scaleFactor;

    // P1 icons
    const startX1 = 60 * this.scaleFactor;

    this.activePowerupsP1.forEach((powerup, index) => {
      this.scene.tweens.add({
        targets: powerup.icon,
        x: startX1 + spacing * index,
        y: y,
        duration: 200,
        ease: 'Power2',
      });
    });

    // P2 icons
    const startX2 = this.scene.scale.width - 60 * this.scaleFactor;

    this.activePowerupsP2.forEach((powerup, index) => {
      powerup.icon.setPosition(startX2 - spacing * index, y);
    });
  }

  displayExtraLife(player = 1) {
    if (player === 1 && this.extraLifePowerupP1) {
      return;
    }

    if (player === 2 && this.extraLifePowerupP2) {
      return;
    }

    const icon = this.scene.add
      .image(0, 0, 'extraLife')
      .setScale(0.02 * this.scaleFactor)
      .setDepth(10);

    const powerup = {
      icon,
      permanent: true,
      type: 'extraLife',
    };

    if (player === 1) {
      this.extraLifePowerupP1 = powerup;
      this.activePowerupsP1.unshift(powerup);
    } else {
      this.extraLifePowerupP2 = powerup;
      this.activePowerupsP2.unshift(powerup);
    }

    this.layoutPowerups();
  }

  deactivateExtraLife(player = 1) {
    const powerup = player === 1 ? this.extraLifePowerupP1 : this.extraLifePowerupP2;

    if (!powerup) {
      return;
    }

    powerup.icon.destroy();

    const list = player === 1 ? this.activePowerupsP1 : this.activePowerupsP2;

    const index = list.indexOf(powerup);

    if (index !== -1) {
      list.splice(index, 1);
    }

    if (player === 1) {
      this.extraLifePowerupP1 = null;
    } else {
      this.extraLifePowerupP2 = null;
    }

    this.layoutPowerups();
  }
}
