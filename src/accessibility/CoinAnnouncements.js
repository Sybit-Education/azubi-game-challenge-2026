const COIN_STEP = 5;

export default class CoinAnnouncements {
  constructor(scene) {
    this.scene = scene;
    this.previousBalance = 0;
  }

  update() {
    const balance = this.scene.ItemManager.coinBudgetPlayer1;
    const previousStep = Math.floor(this.previousBalance / COIN_STEP);
    const currentStep = Math.floor(balance / COIN_STEP);
    this.previousBalance = balance;

    if (!this.scene.registry.get('accessibility enabled') || this.scene.car.dead) {
      this.scene.speech.cancel('coins');
      return;
    }
    // Only player 1 receives accessibility announcements, including in multiplayer.
    if (currentStep <= previousStep) return;
    this.scene.speech.speak(`${balance} coins`, {
      key: 'coins',
      isValid: () => this.scene.registry.get('accessibility enabled') && !this.scene.car.dead,
    });
  }
}
