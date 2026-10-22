export default class HUD {
  constructor(scene, car, secondCar = null) {
    this.car = car;
    this.secondCar = secondCar;
    this.scaleFactor = Math.min(scene.scale.width / 1920, scene.scale.height / 1080);

    const margin = 20 * this.scaleFactor;

    // Player 1 (top-left)
    this.distanceText = scene.add
      .text(margin, margin, '', {
        fontFamily: 'Tiny5',
        fontSize: `${50 * this.scaleFactor}px`,
      })
      .setOrigin(0, 0);

    this.scoreText = scene.add
      .text(margin, margin + 40 * this.scaleFactor, '', {
        fontFamily: 'Tiny5',
        fontSize: `${50 * this.scaleFactor}px`,
      })
      .setOrigin(0, 0);

    // Player 2 (top-right)
    if (this.secondCar) {
      this.distanceText2 = scene.add
        .text(scene.scale.width - margin, margin, '', {
          fontFamily: 'Tiny5',
          fontSize: `${50 * this.scaleFactor}px`,
        })
        .setOrigin(1, 0);

      this.scoreText2 = scene.add
        .text(scene.scale.width - margin, margin + 40 * this.scaleFactor, '', {
          fontFamily: 'Tiny5',
          fontSize: `${50 * this.scaleFactor}px`,
        })
        .setOrigin(1, 0);

      this.extraLife2 = scene.add
        .image(0, 0, 'extraLife')
        .setScale(0.04 * this.scaleFactor)
        .setOrigin(0.5, 0.5);

      this.disable(this.extraLife2);

      this.coinMultiplier2 = scene.add
        .image(0, 0, 'coinMultiplier')
        .setScale(0.04 * this.scaleFactor)
        .setOrigin(0.5, 0.5);
      this.disable(this.coinMultiplier2);
    }

    this.coinMultiplier1 = scene.add
      .image(0, 0, 'coinMultiplier')
      .setScale(0.04 * this.scaleFactor)
      .setOrigin(0.5, 0.5);
    this.disable(this.coinMultiplier1);

    this.extraLife1 = scene.add
      .image(
        this.distanceText.x + this.distanceText.width + 40 * this.scaleFactor,
        this.distanceText.y,
        'extraLife',
      )
      .setScale(0.04 * this.scaleFactor)
      .setOrigin(0.5, 0.5);
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
    this.extraLife1.x = this.distanceText.x + this.distanceText.width + 40 * this.scaleFactor;
    this.extraLife1.y = this.distanceText.y + this.distanceText.height / 1.5;

    this.coinMultiplier1.x = this.distanceText.x + this.distanceText.width + 100 * this.scaleFactor;
    this.coinMultiplier1.y = this.distanceText.y + this.distanceText.height / 1.5;

    if (this.secondCar) {
      this.extraLife2.x = this.distanceText2.x - this.distanceText2.width - 40 * this.scaleFactor;
      this.extraLife2.y = this.extraLife1.y;

      this.coinMultiplier2.x =
        this.distanceText2.x - this.distanceText2.width - 100 * this.scaleFactor;
      this.coinMultiplier2.y = this.coinMultiplier1.y;
    }
  }

  enable(element) {
    element.clearTint();
  }

  disable(element) {
    element.setTint(0x677777);
  }
}
