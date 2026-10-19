export default class HUD {
  constructor(scene, car, secondCar = null) {
    this.car = car;
    this.secondCar = secondCar;
    this.scaleFactor = Math.min(scene.scale.width / 1920, scene.scale.height / 1080);

    this.scoreText = scene.add
      .text(scene.scale.width - 20, 20, '', {
        fontFamily: 'Tiny5',
        fontSize: `${40 * this.scaleFactor}px`,
      })
      .setOrigin(1, 0);

    this.distanceText = scene.add
      .text(this.scoreText.x - 300 * this.scaleFactor, 20, '', {
        fontFamily: 'Tiny5',
        fontSize: `${40 * this.scaleFactor}px`,
      })
      .setOrigin(1, 0);

    //second line for player 2
    if (this.secondCar) {
      this.distanceText2 = scene.add
        .text(scene.scale.width - 300, 60, '', {
          fontFamily: 'Tiny5',
          fontSize: `${40 * this.scaleFactor}px`,
        })
        .setOrigin(1, 0);

      this.scoreText2 = scene.add
        .text(scene.scale.width - 20, 60, '', {
          fontFamily: 'Tiny5',
          fontSize: `${40 * this.scaleFactor}px`,
        })
        .setOrigin(1, 0);
    }
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
  }
}
