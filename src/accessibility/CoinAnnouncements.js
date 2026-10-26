const COIN_STEP = 50;

export default class CoinAnnouncements {
  constructor(scene) {
    this.scene = scene;
    this.region = document.getElementById('coin-status');
    this.previousBalances = [0, 0];
    this.region.textContent = '';
    scene.events.once('shutdown', () => {
      this.region.textContent = '';
    });
  }

  update() {
    const manager = this.scene.ItemManager;
    const balances = [manager.coinBudgetPlayer1];
    if (this.scene.secondCar) balances.push(manager.coinBudgetPlayer2);

    const messages = [];
    balances.forEach((balance, index) => {
      const previousStep = Math.floor(this.previousBalances[index] / COIN_STEP);
      const currentStep = Math.floor(balance / COIN_STEP);
      this.previousBalances[index] = balance;

      // Spending lowers the threshold again; only upward crossings announce money.
      if (currentStep <= previousStep) return;
      const player = this.scene.secondCar ? `Player ${index + 1}: ` : '';
      messages.push(`${player}${balance} coins`);
    });

    if (!this.scene.registry.get('accessibility enabled')) {
      this.region.textContent = '';
      return;
    }
    if (messages.length > 0) this.region.textContent = messages.join('. ');
  }
}
