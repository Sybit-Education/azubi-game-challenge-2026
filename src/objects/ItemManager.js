import Phaser from 'phaser';

export default class ItemManager {
  constructor(scene) {
    this.scene = scene;

    this.coinBudgetPlayer1 = 0;
    this.coinBudgetPlayer2 = 0;

    this.coinMultiplierOnP1 = false;
    this.coinMultiplierOnP2 = false;

    this.itemShieldPrize = 20;
    this.itemShrinkPrize = 15;

    this.schildAktivCar1 = false;
    this.schildAktivCar2 = false;

    this.extraLifeActiveCar1 = false;
    this.extraLifeActiveCar2 = false;
    this.invulnerableCar1 = false;
    this.invulnerableCar2 = false;

    this.iceTriggered = false;
    this.originScale = this.scene.car.scale;
  }

  itemShrinkCar1() {
    console.log('shrink');
    const car = this.scene.car;

    car.setScale(this.originScale * 0.5);

    this.scene.time.delayedCall(10000, () => {
      car.setScale(this.originScale);
    });
  }

  itemShrinkCar2() {
    console.log('Shrink 2');
    const car = this.scene.secondCar;

    car.setScale(this.originScale * 0.5);

    this.scene.time.delayedCall(10000, () => {
      car.setScale(this.originScale);
    });
  }

  itemGrowCar1() {
    console.log('grow');
    const car = this.scene.car;

    this.scene.car.setScale(this.originScale * 1.5);

    this.scene.time.delayedCall(10000, () => {
      car.setScale(this.originScale);
    });
  }

  itemGrowCar2() {
    console.log('grow 2');
    const car = this.scene.secondCar;

    car.setScale(this.originScale * 1.5);

    this.scene.time.delayedCall(10000, () => {
      car.setScale(this.originScale);
    });
  }

  itemExtraLifeCar1() {
    console.log('extralife collected');

    if (!this.extraLifeActiveCar1) {
      this.extraLifeActiveCar1 = true;
      this.scene.hud.enable(this.scene.hud.extraLife1);
    }
  }

  itemExtraLifeCar2() {
    console.log('extralife collected');

    if (!this.extraLifeActiveCar2) {
      this.extraLifeActiveCar2 = true;
      this.scene.hud.enable(this.scene.hud.extraLife2);
    }
  }

  useExtraLifeCar1(car) {
    this.extraLifeActiveCar1 = false;
    this.scene.hud.disable(this.scene.hud.extraLife1);
    this.invulnerableCar1 = true;
    car.setTint(0xff0000);

    this.scene.tweens.add({
      targets: car,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        car.setAlpha(1);
        car.clearTint();
      },
    });

    this.scene.time.delayedCall(1000, () => {
      this.invulnerableCar1 = false;
      car.clearTint();
    });

    console.log('extra life used');
    return;
  }

  useExtraLifeCar2(car) {
    this.extraLifeActiveCar2 = false;
    this.scene.hud.disable(this.scene.hud.extraLife2);
    this.invulnerableCar2 = true;

    car.setTint(0xff0000);

    this.scene.tweens.add({
      targets: car,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        car.setAlpha(1);
        car.clearTint();
      },
    });

    this.scene.time.delayedCall(1000, () => {
      this.invulnerableCar2 = false;
      car.clearTint();
    });

    console.log('extra life used');
    return;
  }

  itemShieldCar1() {
    console.log('schild');

    if (!this.schildAktivCar1) {
      this.schildAktivCar1 = true;
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
        this.schildAktivCar1 = false;

        this.scene.tweens.killTweensOf(this.scene.car);
        this.scene.car.alpha = 1;

        this.scene.car.setTexture('car');
      });
    }
  }

  itemShieldCar2() {
    if (!this.schildAktivCar2) {
      this.schildAktivCar2 = true;
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
        this.schildAktivCar2 = false;

        this.scene.tweens.killTweensOf(this.scene.secondCar);
        this.scene.secondCar.alpha = 1;

        this.scene.secondCar.setTexture('car2');
      });
    }
  }

  lebenCheckCar1(car) {
    if (this.invulnerableCar1) {
      return;
    }

    if (this.schildAktivCar1) {
      return;
    }

    if (this.extraLifeActiveCar1) {
      this.useExtraLifeCar1(car);
      return;
    }
    this.scene.gameOver(car);
  }

  lebenCheckCar2(car) {
    if (this.invulnerableCar2) {
      return;
    }
    if (this.schildAktivCar2) {
      return;
    }

    if (this.extraLifeActiveCar2) {
      this.useExtraLifeCar2(car);
      return;
    }

    this.scene.gameOver(car);
  }

  itemNausea() {
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

  itemRandom1() {
    const random = Phaser.Math.Between(1, 4);

    if (random === 1) {
      return this.itemShrinkCar1();
    } else if (random === 2) {
      return this.itemGrowCar1();
    } else if (random === 3) {
      return this.itemShieldCar1();
    } else if (random === 4) {
      return this.itemNausea();
    }
  }

  itemRandom2() {
    const random = Phaser.Math.Between(1, 4);

    if (random === 1) {
      return this.itemShrinkCar2();
    } else if (random === 2) {
      return this.itemGrowCar2();
    } else if (random === 3) {
      return this.itemShieldCar2();
    } else if (random === 4) {
      return this.itemNausea();
    }
  }

  iceEffect(car) {
    if (car.iceTriggered) {
      return;
    }

    car.iceTriggered = true;

    console.log('ice!');

    const zufallszahl = Phaser.Math.Between(0, 1);

    if (zufallszahl === 1) {
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

  coinBudgetPlus1(multiplier = 1) {
    this.coinBudgetPlayer1 += multiplier;
    console.log('Spieler1 has collected ' + this.coinBudgetPlayer1 + ' Coins');
    console.log('multiplier: ' + multiplier);
  }

  coinBudgetPlus2(multiplier = 1) {
    this.coinBudgetPlayer2 += multiplier;
    console.log('Spieler2 has collected ' + this.coinBudgetPlayer2 + ' Coins');
    console.log('multiplier: ' + multiplier);
  }

  multiplyCoins1(car, item) {
    if (car.multiplierTimer) {
      car.multiplierTimer.remove();
    }

    console.log('Multiplier enabled');
    this.scene.hud.enable(this.scene.hud.coinMultiplier1);

    car.coinMultiplier = 2;
    car.multiplierTimer = this.scene.time.delayedCall(10000, () => {
      car.coinMultiplier = 1;
      console.log('Multiplier disabled');
      this.scene.hud.disable(this.scene.hud.coinMultiplier1);
    });

    item.destroy();
  }

  multiplyCoins2(car, item) {
    if (car.multiplierTimer) {
      car.multiplierTimer.remove();
    }

    console.log('Multiplier enabled');
    this.scene.hud.enable(this.scene.hud.coinMultiplier2);

    car.coinMultiplier = 2;
    car.multiplierTimer = this.scene.time.delayedCall(10000, () => {
      car.coinMultiplier = 1;
      console.log('Multiplier disabled');
      this.scene.hud.disable(this.scene.hud.coinMultiplier2);
    });

    item.destroy();
  }

  itemShop() {
    // Hotkeys Player1
    this.key1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    // this.key3 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    if (
      Phaser.Input.Keyboard.JustDown(this.key1) &&
      this.coinBudgetPlayer1 >= this.itemShieldPrize
    ) {
      this.itemShieldCar1();
      this.coinBudgetPlayer1 -= this.itemShieldPrize;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.key2) &&
      this.coinBudgetPlayer1 >= this.itemShrinkPrize
    ) {
      this.itemShrinkCar1();
      this.coinBudgetPlayer1 -= this.itemShrinkPrize;
    }

    // Hotkeys Player2
    this.numpad1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE);
    this.numpad2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO);
    // this.numpad3 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE);

    if (
      Phaser.Input.Keyboard.JustDown(this.numpad1) &&
      this.coinBudgetPlayer2 >= this.itemShieldPrize
    ) {
      this.itemShieldCar2();
      this.coinBudgetPlayer2 -= this.itemShieldPrize;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.numpad2) &&
      this.coinBudgetPlayer2 >= this.itemShrinkPrize
    ) {
      this.itemShrinkCar2();
      this.coinBudgetPlayer2 -= this.itemShrinkPrize;
    }
  }
}
