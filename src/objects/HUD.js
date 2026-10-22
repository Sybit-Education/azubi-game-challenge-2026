export default class HUD {
  constructor(scene, car, secondCar = null) {
    this.car = car;
    this.secondCar = secondCar;
    this.scaleFactor = Math.min(scene.scale.width / 1920, scene.scale.height / 1080);
    this.scene = scene;
    const margin = 20 * this.scaleFactor;
    this.hudBackground = scene.add.graphics();
    this.hudBackground2 = scene.add.graphics();

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

      this.extraLife2 = scene.add
        .image(0, 0, 'extraLife')
        .setScale(0.04 * this.scaleFactor)
        .setOrigin(0.5, 0.5)
        .setDepth(5);

      this.disable(this.extraLife2);

      this.coinMultiplier2 = scene.add
        .image(0, 0, 'coinMultiplier')
        .setScale(0.04 * this.scaleFactor)
        .setOrigin(0.5, 0.5)
        .setDepth(5);
      this.disable(this.coinMultiplier2);
    }

    this.coinMultiplier1 = scene.add
      .image(0, 0, 'coinMultiplier')
      .setScale(0.04 * this.scaleFactor)
      .setOrigin(0.5, 0.5)
      .setDepth(5);
    this.disable(this.coinMultiplier1);

    this.extraLife1 = scene.add
      .image(
        this.distanceText.x + this.distanceText.width + 60 * this.scaleFactor,
        this.distanceText.y,
        'extraLife',
      )
      .setScale(0.04 * this.scaleFactor)
      .setOrigin(0.5, 0.5)
      .setDepth(5);
    this.disable(this.extraLife1);
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

    this.extraLife1.x = this.distanceText.x + this.distanceText.width + 130 * this.scaleFactor;
    this.extraLife1.y = this.distanceText.y + this.distanceText.height / 1.5;

    this.coinMultiplier1.x = this.distanceText.x + this.distanceText.width + 200 * this.scaleFactor;
    this.coinMultiplier1.y = this.distanceText.y + this.distanceText.height / 1.5;

    if (this.secondCar) {
      this.extraLife2.x = this.distanceText2.x - this.distanceText2.width - 130 * this.scaleFactor;
      this.extraLife2.y = this.extraLife1.y;

      this.coinMultiplier2.x =
        this.distanceText2.x - this.distanceText2.width - 200 * this.scaleFactor;
      this.coinMultiplier2.y = this.coinMultiplier1.y;

      this.hudBackground2.clear();
      const x2 = this.coinMultiplier2.x - this.coinMultiplier2.displayWidth / 2 - 30;
      const rightEdge = this.scene.scale.width;

      const y2 = 10 * this.scaleFactor;
      const width2 = rightEdge - x2;
      const height2 = 120 * this.scaleFactor;

      this.hudBackground2.fillStyle(0x000000, 0.9);
      this.hudBackground2.fillRect(x2, y2, width2, height2);

      this.hudBackground2.lineStyle(2, 0xffffff, 1);
      this.hudBackground2.strokeRect(x2, y2, width2, height2);
      this.hudBackground2.setDepth(1);
    }

    this.hudBackground.clear();
    const x = 0 * this.scaleFactor;
    const y = 10 * this.scaleFactor;
    const width = this.coinMultiplier1.x + 50 * this.scaleFactor;
    const height = 120 * this.scaleFactor;

    this.hudBackground.fillStyle(0x000000, 0.9);
    this.hudBackground.fillRect(x, y, width, height);

    this.hudBackground.lineStyle(2, 0xffffff, 1);
    this.hudBackground.strokeRect(x, y, width, height);
    this.hudBackground.setDepth(1);
  }

  enable(element) {
    element.clearTint();
  }

  disable(element) {
    element.setTint(0x677777);
  }
}
