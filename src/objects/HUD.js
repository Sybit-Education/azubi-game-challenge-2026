export default class HUD {
  constructor(scene, car) {
    this.car = car;

    this.distanceText = scene.add
      .text(scene.scale.width - 300, 20, '', { fontSize: '30px' })
      .setOrigin(1, 0);

    this.scoreText = scene.add
      .text(scene.scale.width - 20, 20, '', { fontSize: '30px' })
      .setOrigin(1, 0);
  }

  update() {
    this.distanceText.setText(`Distance: ${this.car.calculate_km()} km`);

    this.scoreText.setText(`Score: ${this.car.score}`);
  }
}
