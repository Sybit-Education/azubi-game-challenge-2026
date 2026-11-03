import Phaser from 'phaser';

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
        fontFamily: 'Silkscreen',
        fontSize: `${30 * this.scaleFactor}px`,
      })
      .setOrigin(0, 0)
      .setDepth(5);

    this.scoreText = scene.add
      .text(margin, margin + 40 * this.scaleFactor, '', {
        fontFamily: 'Silkscreen',
        fontSize: `${30 * this.scaleFactor}px`,
      })
      .setOrigin(0, 0)
      .setDepth(5);

    this.death = scene.add
      .text(margin, margin, '', {
        fontFamily: 'Tiny5',
        fontSize: `${150 * this.scaleFactor}px`,
      })
      .setOrigin(0, 0)
      .setDepth(500)
      .setText('DEAD')
      .setColor('red')
      .setStroke('black', 10)
      .setRotation(0.1)
      .setAlpha(0.6)
      .setVisible(false);

    this.speedoMeter = scene.add
      .image(this.scene.scale.width - 0 * this.scaleFactor, 0 * this.scaleFactor, 'speedometer')
      //.setOrigin(1, 0)
      .setScale(1.15 * this.scaleFactor)
      .setOrigin(0, 1)
      .setDepth(10000)
      .setFlipX(true); // green left, red right

    // bottom-left corner, box touches the screen edges like the score box does at the top
    const padding = 15 * this.scaleFactor;
    this.speedoMeter.setPosition(padding, this.scene.scale.height - padding);

    this.speedoMeterPointer = scene.add
      .image(
        this.speedoMeter.x + this.speedoMeter.displayWidth / 2,
        this.speedoMeter.y,
        'speedometer-pointer',
      )
      .setScale(0.55 * this.scaleFactor)
      .setOrigin(0.43, 0.5) // middle of the little square at the bottom of the pointer
      .setDepth(10001)
      .setTint(0xffffff)
      .setTintMode(Phaser.TintModes.FILL); // pointer is black, FILL paints it white
    // origin is at 70% of the pointer, so move it up by the other 30% so it doesn't stick out under the speedometer
    this.speedoMeterPointer.y -= this.speedoMeterPointer.displayHeight * 0.3;

    // km/h number above the speedometer, in the middle
    this.speedText = scene.add
      .text(
        this.speedoMeter.x + this.speedoMeter.displayWidth / 2,
        this.speedoMeter.y - this.speedoMeter.displayHeight - 10 * this.scaleFactor, // a bit of space above the speedometer
        '60 km/h',
        {
          fontFamily: 'Silkscreen',
          fontSize: `${40 * this.scaleFactor}px`,
        },
      )
      .setOrigin(0.5, 1)
      .setDepth(10001);

    // one dark box with a black border behind the text and the speedometer, like the distance/score box
    const boxX = this.speedoMeter.x - padding;
    const boxY = this.speedText.y - this.speedText.displayHeight - 5 * this.scaleFactor; // small gap, the font already has some space on top
    const boxWidth = this.speedoMeter.displayWidth + padding * 2;
    const boxHeight = this.scene.scale.height - boxY; // down to the bottom of the screen

    this.speedoMeterBackground = scene.add.graphics().setDepth(9999);
    this.speedoMeterBackground.fillStyle(0x000000, 0.85);
    this.speedoMeterBackground.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.speedoMeterBackground.lineStyle(10, 0x000000, 1);
    this.speedoMeterBackground.strokeRect(boxX, boxY, boxWidth, boxHeight);
    this.shownKmh = 60; // the km/h that is shown right now, moves slowly towards the real one
    // Player 2 (top-right)
    if (this.secondCar) {
      this.distanceText2 = scene.add
        .text(scene.scale.width - margin, margin, '', {
          fontFamily: 'Silkscreen',
          fontSize: `${30 * this.scaleFactor}px`,
        })
        .setOrigin(1, 0)
        .setDepth(5);

      this.scoreText2 = scene.add
        .text(scene.scale.width - margin, margin + 40 * this.scaleFactor, '', {
          fontFamily: 'Silkscreen',
          fontSize: `${30 * this.scaleFactor}px`,
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

      this.death2 = scene.add
        .text(margin, margin, '', {
          fontFamily: 'Tiny5',
          fontSize: `${150 * this.scaleFactor}px`,
        })
        .setOrigin(0, 0)
        .setDepth(500)
        .setText('DEAD')
        .setColor('red')
        .setStroke('black', 10)
        .setRotation(0.1)
        .setAlpha(0.6)
        .setVisible(false);

      // P2 speedometer, same as P1 but in the bottom-right corner
      this.speedoMeter2 = scene.add
        .image(this.scene.scale.width - padding, this.scene.scale.height - padding, 'speedometer')
        .setScale(1.15 * this.scaleFactor)
        .setOrigin(1, 1)
        .setDepth(10000)
        .setFlipX(true); // green left, red right

      this.speedoMeterPointer2 = scene.add
        .image(
          this.speedoMeter2.x - this.speedoMeter2.displayWidth / 2,
          this.speedoMeter2.y,
          'speedometer-pointer',
        )
        .setScale(0.55 * this.scaleFactor)
        .setOrigin(0.43, 0.5)
        .setDepth(10001)
        .setTint(0xffffff)
        .setTintMode(Phaser.TintModes.FILL);
      this.speedoMeterPointer2.y -= this.speedoMeterPointer2.displayHeight * 0.3;

      this.speedText2 = scene.add
        .text(
          this.speedoMeter2.x - this.speedoMeter2.displayWidth / 2,
          this.speedoMeter2.y - this.speedoMeter2.displayHeight - 10 * this.scaleFactor,
          '60 km/h',
          {
            fontFamily: 'Silkscreen',
            fontSize: `${40 * this.scaleFactor}px`,
          },
        )
        .setOrigin(0.5, 1)
        .setDepth(10001);

      const boxX2 = this.speedoMeter2.x - this.speedoMeter2.displayWidth - padding;
      const boxY2 = this.speedText2.y - this.speedText2.displayHeight - 5 * this.scaleFactor;

      this.speedoMeterBackground2 = scene.add.graphics().setDepth(9999);
      this.speedoMeterBackground2.fillStyle(0x000000, 0.85);
      this.speedoMeterBackground2.fillRect(boxX2, boxY2, boxWidth, this.scene.scale.height - boxY2);
      this.speedoMeterBackground2.lineStyle(10, 0x000000, 1);
      this.speedoMeterBackground2.strokeRect(
        boxX2,
        boxY2,
        boxWidth,
        this.scene.scale.height - boxY2,
      );
      this.shownKmh2 = 60;
    }

    this.statsBackground = this.scene.add
      .image(0 * this.scaleFactor, 0 * this.scaleFactor, 'stats-background')
      .setDepth(4)
      .setScale(0.5 * this.scaleFactor)
      .setOrigin(0);
  }

  update() {
    // speed goes from 700 (start) to 1600 (max), turn that into 0 to 1
    const speedPercent = (this.scene.track1.speed - 700) / (1600 - 700);
    // 60 to 220 km/h, +10 km/h when accelerating (velocity is negative), -10 km/h when braking (velocity is positive)
    const carVelocity = this.car.body ? this.car.body.velocity.y : 0; // body is gone after the car got destroyed
    let kmh = Phaser.Math.Linear(60, 220, speedPercent);
    if (carVelocity < 0) kmh += 10;
    if (carVelocity > 0) kmh -= 10;
    if (this.car.dead) kmh = 0; // dead car doesn't drive
    this.shownKmh += (kmh - this.shownKmh) * 0.05; // 5% closer each frame so it doesn't jump
    if (this.shownKmh >= 220) {
      this.speedText.setText('MAX! km/h');
    } else {
      this.speedText.setText(`${Math.round(this.shownKmh)} km/h`);
    }

    // pointer follows the km/h, -115 = pointing left at the green, 60 = pointing right at the red (the pointer image already leans right)
    // no max, so speeding at max speed (230 km/h) pushes the pointer a bit past the red
    const pointerPercent = Math.max((this.shownKmh - 60) / (220 - 60), 0);
    this.speedoMeterPointer.setAngle(Phaser.Math.Linear(-115, 60, pointerPercent));

    const x = this.statsBackground.x;
    const y = this.statsBackground.y;
    const width = this.statsBackground.displayWidth;
    const height = this.statsBackground.displayHeight;

    if (this.secondCar) {
      this.distanceText.setText(`P1 Distance: ${this.car.calculate_km()} km`);
      this.scoreText.setText(`P1 Score: ${this.car.score}`);

      this.distanceText2.setText(`P2 Distance: ${this.secondCar.calculate_km()} km`);
      this.scoreText2.setText(`P2 Score: ${this.secondCar.score}`);

      // P2 speedometer, same as P1
      const carVelocity2 = this.secondCar.body ? this.secondCar.body.velocity.y : 0;
      let kmh2 = Phaser.Math.Linear(60, 220, speedPercent);
      if (carVelocity2 < 0) kmh2 += 10;
      if (carVelocity2 > 0) kmh2 -= 10;
      if (this.secondCar.dead) kmh2 = 0;
      this.shownKmh2 += (kmh2 - this.shownKmh2) * 0.1;
      this.speedText2.setText(`${Math.round(this.shownKmh2)} km/h`);

      const pointerPercent2 = Math.max((this.shownKmh2 - 60) / (220 - 60), 0);
      this.speedoMeterPointer2.setAngle(Phaser.Math.Linear(-115, 60, pointerPercent2));

      this.distanceText.setFontSize(30 * this.scaleFactor);
      this.scoreText.setFontSize(30 * this.scaleFactor);

      const x2 = this.statsBackground2.x;
      const y2 = this.statsBackground2.y;
      const width2 = this.statsBackground2.displayWidth;
      const height2 = this.statsBackground2.displayHeight;

      this.distanceText2.setFontSize(30 * this.scaleFactor);
      this.scoreText2.setFontSize(30 * this.scaleFactor);
      this.statsFrame2.clear();
      this.statsFrame2.fillStyle(0x000000, 0.9);
      this.statsFrame2.fillRect(x2, y2, width2, height2);

      this.statsFrame2.lineStyle(10, 0x000000, 1);
      this.statsFrame2.strokeRect(x2, y2, width2, height2);
      this.statsFrame2.setDepth(1);
      this.death
        .setPosition(this.statsBackground.displayWidth / 2, this.statsBackground.displayHeight / 2)
        .setOrigin(0.5);
      this.death2
        .setPosition(
          this.scene.scale.width - this.statsBackground2.displayWidth / 2,
          this.statsBackground2.displayHeight / 2,
        )
        .setOrigin(0.5);
    } else {
      this.distanceText.setText(`Distance: ${this.car.calculate_km()} km`);
      this.scoreText.setText(`Score: ${this.car.score}`);
      this.death.setPosition(
        this.statsBackground.displayWidth / 2,
        this.statsBackground.displayHeight / 2,
      );
    }

    this.statsFrame.clear();
    this.statsFrame.fillStyle(0x000000, 0.9);
    this.statsFrame.fillRect(x, y, width, height);

    this.statsFrame.lineStyle(10, 0x000000, 1);
    this.statsFrame.strokeRect(x, y, width, height);
    this.statsFrame.setDepth(1);
  }

  greyOut(player) {
    const parts =
      player === 1
        ? [this.statsBackground, this.distanceText, this.scoreText]
        : [this.statsBackground2, this.distanceText2, this.scoreText2];

    if (player === 1) {
      parts.push(this.scene.hotbar, this.scene.hotbarCoin, this.scene.coinText1);
      parts.push(
        this.speedoMeter,
        this.speedoMeterPointer,
        this.speedText,
        this.speedoMeterBackground,
      );
      this.showDeathOverlay(1);
    } else {
      parts.push(this.scene.hotbar2, this.scene.hotbarCoin2, this.scene.coinText2);
      parts.push(
        this.speedoMeter2,
        this.speedoMeterPointer2,
        this.speedText2,
        this.speedoMeterBackground2,
      );
      this.showDeathOverlay(2);
    }

    this.scene.tweens.add({
      targets: parts.filter(Boolean),
      alpha: 0.4,
      duration: 300,
      ease: 'Sine.easeOut',
    });
  }

  showDeathOverlay(player) {
    const death = player === 1 ? this.death : this.death2;

    death.setVisible(true).setScale(0).setAlpha(0);

    this.scene.tweens.add({
      targets: death,
      scale: 1,
      alpha: 0.6,
      duration: 300,
      ease: 'Back.easeOut',
    });
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
