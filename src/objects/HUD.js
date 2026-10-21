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

      this.disableExtraLife2();
    }

    this.extraLife1 = scene.add
      .image(
        this.distanceText.x + this.distanceText.width + 40 * this.scaleFactor,
        this.distanceText.y,
        'extraLife',
      )
      .setScale(0.04 * this.scaleFactor)
      .setOrigin(0.5, 0.5);
    this.disableExtraLife1();
  }

  disableExtraLife1() {
    this.extraLife1.setTint(0x677777);
  }

  enableExtraLife1() {
    this.extraLife1.clearTint();
  }

  disableExtraLife2() {
    this.extraLife2.setTint(0x677777);
  }

  enableExtraLife2() {
    this.extraLife2.clearTint();
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
    if (this.secondCar) {
      this.extraLife2.x = this.distanceText2.x - this.distanceText2.width - 40 * this.scaleFactor;
      this.extraLife2.y = this.extraLife1.y;
    }
  }
}
