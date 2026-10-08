import Car from "./Car";
import Item from "./Item";

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
      console.log("shrink");

    let carShrinkSize = 0.3; 

    this.scene.car.setScale(carShrinkSize);

    this.scene.time.delayedCall(10000, () => {
    this.scene.car.setScale(0.66);
    });
  }

  itemShrinkCar2() {
    let carShrinkSize = 0.3; 


    this.scene.secondCar.setScale(carShrinkSize);

    this.scene.time.delayedCall(10000, () => {
    this.scene.secondCar.setScale(0.66);
    });
  }

  itemGrowCar1() {
      console.log("grow");

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
    console.log("schild");

    if (!this.schildAktivCar1) {
        this.schildAktivCar1 = true;
        this.scene.car.setTexture('carShield');

        this.scene.time.delayedCall(4500, () => {
            this.scene.tweens.add({
                targets: this.scene.car,
                alpha: 0.2,
                duration: 700,
                yoyo: true,
                repeat: -1
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
                repeat: -1
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

  itemNausea(){
    console.log("Nausea");
    this.scene.tweens.add({
    targets: this.scene.cameras.main,
    rotation: 0.05,
    zoom: 1.20,
    duration: 500,
    yoyo: true,
    repeat: 2.5
    });
  }

  itemRandom1(){
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

    itemRandom2(){
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

    coinBudgetPlus(){
    this.coinBudget ++;
    console.log("Spieler1 " + this.coinBudget + " Coins" );
  }

//   useItem(key, price, action) {
//     if (
//     Phaser.Input.Keyboard.JustDown(key) &&
//     this.coinBudget >= price
//     ) {
//     action();
//     this.coinBudget -= price;
//     }


    // Items werden eingesetzt
    // Spieler1
    // if (Phaser.Input.Keyboard.JustDown(this.keyOne) && this.itemShieldPrize <= this.coinBudget) {
    // this.itemShieldCar1();
    // this.coinBudget -= this.itemShieldPrize;
    //   }
    // if (Phaser.Input.Keyboard.JustDown(this.keyTwo)) {
    // console.log("2 eingesetzt");
    // this.itemShrinkCar1();
    // this.coinBudget -= this.itemShrinkPrize;
    //   }
    // if (Phaser.Input.Keyboard.JustDown(this.keyThree)) {
    // console.log("3 eingesetzt");
    // this.itemGrowCar1();
    //   }
    // if (Phaser.Input.Keyboard.JustDown(this.keyFour)) {
    // console.log("4 eingesetzt");
    // this.itemNausea();
    //   }
    // if (Phaser.Input.Keyboard.JustDown(this.keyFive)) {
    // console.log("5 eingesetzt");
    //   }
    // //Spieler2
    //     if (Phaser.Input.Keyboard.JustDown(this.keyOne) && this.itemShieldPrize <= this.coinBudget) {
    // this.itemShieldCar1();
    // this.coinBudget -= this.itemShieldPrize;
    //   }
    // if (Phaser.Input.Keyboard.JustDown(this.keyTwo)) {
    // console.log("2 eingesetzt");
    // this.itemShrinkCar1();
    // this.coinBudget -= this.itemShrinkPrize;
    //   }
    // if (Phaser.Input.Keyboard.JustDown(this.keyThree)) {
    // console.log("3 eingesetzt");
    // this.itemGrowCar1();
    //   }
    // if (Phaser.Input.Keyboard.JustDown(this.keyFour)) {
    // console.log("4 eingesetzt");
    // this.itemNausea();
    //   }
    // if (Phaser.Input.Keyboard.JustDown(this.keyFive)) {
    // console.log("5 eingesetzt");
    //   }
}