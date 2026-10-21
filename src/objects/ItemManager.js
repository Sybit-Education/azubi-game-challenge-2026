import Phaser from 'phaser';

export default class ItemManager {
  constructor(scene) {
    this.scene = scene;

    this.coinBudgetPlayer1 = 0;
    this.coinBudgetPlayer2 = 0;

    this.itemShieldPrize = 20;
    this.itemShrinkPrize = 15;

    this.player1ShieldActive = false;
    this.player2ShieldActive = false;

    this.iceTriggered = false;
    this.originScale = this.scene.car.scale;
  }

  shrinkPlayer1Car() {
    console.log('shrink');
    const carShrinkSize = 0.5;

    this.scene.car.setScale(carShrinkSize);

    this.scene.time.delayedCall(10000, () => {
      this.scene.car.setScale(this.originScale);
    });
  }

  shrinkPlayer2Car() {
    console.log('Shrink 2');
    const carShrinkSize = 0.5;

    this.scene.secondCar.setScale(carShrinkSize);

    this.scene.time.delayedCall(10000, () => {
      this.scene.secondCar.setScale(this.originScale);
    });
  }

  growPlayer1Car() {
    console.log('grow');
    const carGrowSize = 1;

    this.scene.car.setScale(carGrowSize);

    this.scene.time.delayedCall(10000, () => {
      this.scene.car.setScale(this.originScale);
    });
  }

  growPlayer2Car() {
    console.log('grow 2');
    const carGrowSize = 1;

    this.scene.secondCar.setScale(carGrowSize);

    this.scene.time.delayedCall(10000, () => {
      this.scene.secondCar.setScale(this.originScale);
    });
  }

  activatePlayer1Shield() {
    console.log('shield');

    if (!this.player1ShieldActive) {
      this.player1ShieldActive = true;
      this.scene.car.setTexture('carShield');

      this.scene.time.delayedCall(4500, () => {
        this.scene.tweens.add({
          targets: this.scene.car,
          alpha: 0.2,
          duration: 700,
          yoyo: true,
          repeat: -1,
        });
      });

      this.scene.time.delayedCall(8000, () => {
        this.player1ShieldActive = false;

        this.scene.tweens.killTweensOf(this.scene.car);
        this.scene.car.alpha = 1;

        this.scene.car.setTexture('car');
      });
    }
  }

  activatePlayer2Shield() {
    if (!this.player2ShieldActive) {
      this.player2ShieldActive = true;
      this.scene.secondCar.setTexture('carShield2');

      this.scene.time.delayedCall(4500, () => {
        this.scene.tweens.add({
          targets: this.scene.secondCar,
          alpha: 0.2,
          duration: 700,
          yoyo: true,
          repeat: -1,
        });
      });

      this.scene.time.delayedCall(8000, () => {
        this.player2ShieldActive = false;

        this.scene.tweens.killTweensOf(this.scene.secondCar);
        this.scene.secondCar.alpha = 1;

        this.scene.secondCar.setTexture('car2');
      });
    }
  }

  handlePlayer1Collision(car) {
    if (!this.player1ShieldActive) {
      this.scene.gameOver(car);
    }
  }

  handlePlayer2Collision(car) {
    if (!this.player2ShieldActive) {
      this.scene.gameOver(car);
    }
  }

  applyNauseaEffect() {
    console.log('Nausea');
    this.scene.tweens.add({
      targets: this.scene.cameras.main,
      rotation: 0.05,
      zoom: 1.2,
      duration: 500,
      yoyo: true,
      repeat: 2.5,
    });
  }

  applyRandomItemToPlayer1() {
    const random = Phaser.Math.Between(1, 4);

    if (random === 1) {
      return this.shrinkPlayer1Car();
    } else if (random === 2) {
      return this.growPlayer1Car();
    } else if (random === 3) {
      return this.activatePlayer1Shield();
    } else if (random === 4) {
      return this.applyNauseaEffect();
    }
  }

  applyRandomItemToPlayer2() {
    const random = Phaser.Math.Between(1, 4);

    if (random === 1) {
      return this.shrinkPlayer2Car();
    } else if (random === 2) {
      return this.growPlayer2Car();
    } else if (random === 3) {
      return this.activatePlayer2Shield();
    } else if (random === 4) {
      return this.applyNauseaEffect();
    }
  }

  applyIceEffect(car) {
    if (car.iceTriggered) {
      return;
    }

    car.iceTriggered = true;

    console.log('ice!');

    const randomDirection = Phaser.Math.Between(0, 1);

    if (randomDirection === 1) {
      this.scene.tweens.add({
        targets: car,
        x: car.x + 300,
        duration: 1250,
      });
    } else {
      this.scene.tweens.add({
        targets: car,
        x: car.x - 300,
        duration: 1250,
      });
    }

    this.scene.time.delayedCall(1500, () => {
      car.iceTriggered = false;
    });
  }

  addCoinToPlayer1Budget() {
    this.coinBudgetPlayer1++;
    console.log(`Player 1 has ${this.coinBudgetPlayer1} coins`);
  }

  addCoinToPlayer2Budget() {
    this.coinBudgetPlayer2++;
    console.log(`Player 2 has ${this.coinBudgetPlayer2} coins`);
  }

  updateItemShop() {
    // Player 1 spends coins with the number-row keys
    this.key1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);

    if (
      Phaser.Input.Keyboard.JustDown(this.key1) &&
      this.coinBudgetPlayer1 >= this.itemShieldPrize
    ) {
      this.activatePlayer1Shield();
      this.coinBudgetPlayer1 -= this.itemShieldPrize;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.key2) &&
      this.coinBudgetPlayer1 >= this.itemShrinkPrize
    ) {
      this.shrinkPlayer1Car();
      this.coinBudgetPlayer1 -= this.itemShrinkPrize;
    }

    // Player 2 uses the equivalent numpad keys
    this.numpad1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE);
    this.numpad2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO);

    if (
      Phaser.Input.Keyboard.JustDown(this.numpad1) &&
      this.coinBudgetPlayer2 >= this.itemShieldPrize
    ) {
      this.activatePlayer2Shield();
      this.coinBudgetPlayer2 -= this.itemShieldPrize;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.numpad2) &&
      this.coinBudgetPlayer2 >= this.itemShrinkPrize
    ) {
      this.shrinkPlayer2Car();
      this.coinBudgetPlayer2 -= this.itemShrinkPrize;
    }
  }
}
