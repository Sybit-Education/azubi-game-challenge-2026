/* global Phaser */

export default class ItemManager {
  constructor(scene) {
    this.scene = scene;

    this.coinBudgetPlayer1 = 0;
    this.coinBudgetPlayer2 = 0;

    this.itemShieldPrize = 10;
    this.itemShrinkPrize = 5;

    this.schildAktivCar1 = false;
    this.schildAktivCar2 = false;
  }

  itemShrinkCar1() {
    console.log('shrink');

    let carShrinkSize = 0.3;

    this.scene.car.setScale(carShrinkSize);

    this.scene.time.delayedCall(10000, () => {
      this.scene.car.setScale(0.66);
    });
  }

  itemShrinkCar2() {
    console.log("Shrink 2");
    let carShrinkSize = 0.3;

    this.scene.secondCar.setScale(carShrinkSize);

    this.scene.time.delayedCall(10000, () => {
      this.scene.secondCar.setScale(0.66);
    });
  }

  itemGrowCar1() {
    console.log('grow');

    let carGrowSize = 0.85;

    this.scene.car.setScale(carGrowSize);

    this.scene.time.delayedCall(10000, () => {
      this.scene.car.setScale(0.66);
    });
  }

  itemGrowCar2() {
    let carGrowSize = 0.85;

    this.scene.secondCar.setScale(carGrowSize);

    this.scene.time.delayedCall(10000, () => {
      this.scene.secondCar.setScale(0.66);
    });
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

  lebenCheckCar1() {
    if (!this.schildAktivCar1) {
      this.scene.gameOver();
    }
  }

  lebenCheckCar2() {
    if (!this.schildAktivCar2) {
      this.scene.gameOver();
    }
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

  coinBudgetPlus1() {
    this.coinBudgetPlayer1 ++;
    console.log('Spieler1 ' + this.coinBudgetPlayer1 + ' Coins');
  }

  coinBudgetPlus2() {
    this.coinBudgetPlayer2 ++;
    console.log('Spieler2 ' + this.coinBudgetPlayer2 + ' Coins');
  }



  itemShop(){

    // Hotkeys Player1
    this.key1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    // this.key3 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    if (Phaser.Input.Keyboard.JustDown(this.key1) && this.coinBudgetPlayer1 >= this.itemShieldPrize) {

      this.itemRandom1();
    }

    if (Phaser.Input.Keyboard.JustDown(this.key2) && this.coinBudgetPlayer1 >= this.itemShrinkPrize) {
      this.itemShrinkCar1();
    }

    // if (Phaser.Input.Keyboard.JustDown(this.key1)) {
    //   this.itemShrinkCar1();
    // }

    // Hotkeys Player2
    this.numpad1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE);
    this.numpad2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO);
    // this.numpad3 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE);
    
    if (Phaser.Input.Keyboard.JustDown(this.numpad1) && this.coinBudgetPlayer2 >= this.itemShieldPrize) {
      this.itemShieldCar2;
    }

    if (Phaser.Input.Keyboard.JustDown(this.numpad2) && this.coinBudgetPlayer2 >= this.itemShrinkPrize) {
      this.itemShrinkCar2();
    }

    // if (Phaser.Input.Keyboard.JustDown(this.numpad3)) {
    //   this.itemShrinkCar3();
    // }
  }


  
}
