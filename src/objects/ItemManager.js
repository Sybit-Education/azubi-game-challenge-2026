import Phaser from 'phaser';

export default class ItemManager {
  constructor(scene) {
    this.scene = scene;

    this.coinBudgetPlayer1 = 0;
    this.coinBudgetPlayer2 = 0;

    this.coinMultiplierOnP1 = false;
    this.coinMultiplierOnP2 = false;

    this.itemShieldPrize = 35;
    this.itemShrinkPrize = 25;
    this.itemHeartPrize = 40;

    this.schildAktivCar1 = false;
    this.schildAktivCar2 = false;

    this.extraLifeActiveCar1 = false;
    this.extraLifeActiveCar2 = false;
    this.invulnerableCar1 = false;
    this.invulnerableCar2 = false;

    this.originScale = this.scene.car.scale;
  }

  itemShrinkCar1() {
    console.log('shrink');
    this.scene.hud.showPowerupTimer('shrink', 10000, 0.1, 1);
    const car = this.scene.car;

    car.setScale(this.originScale * 0.5);

    this.scene.time.delayedCall(10000, () => {
      car.setScale(this.originScale);
    });
  }

  itemShrinkCar2() {
    console.log('Shrink 2');
    this.scene.hud.showPowerupTimer('shrink', 10000, 0.1, 2);
    const car = this.scene.secondCar;

    car.setScale(this.originScale * 0.5);

    this.scene.time.delayedCall(10000, () => {
      car.setScale(this.originScale);
    });
  }

  itemGrowCar1() {
    console.log('grow');
    this.scene.hud.showPowerupTimer('grow', 10000, 0.04, 1);

    const car = this.scene.car;

    car.setScale(this.originScale * 1.5);
    this.scene.sound.play('plant-grow', { volume: 0.3 });

    this.scene.time.delayedCall(10000, () => {
      car.setScale(this.originScale);
    });
  }

  itemGrowCar2() {
    console.log('grow 2');
    this.scene.hud.showPowerupTimer('grow', 10000, 0.04, 2);
    const car = this.scene.secondCar;

    car.setScale(this.originScale * 1.5);
    this.scene.sound.play('plant-grow', { volume: 0.3 });

    this.scene.time.delayedCall(10000, () => {
      car.setScale(this.originScale);
    });
  }

  itemExtraLifeCar1() {
    console.log('extralife collected');
    this.scene.hud.displayExtraLife(1);

    if (!this.extraLifeActiveCar1) {
      this.extraLifeActiveCar1 = true;
      this.scene.sound.play('collect-extra-life', { volume: 0.3 });
    }
  }

  itemExtraLifeCar2() {
    console.log('extralife collected');
    this.scene.hud.displayExtraLife(2);

    if (!this.extraLifeActiveCar2) {
      this.extraLifeActiveCar2 = true;
      this.scene.sound.play('collect-extra-life', { volume: 0.3 });
    }
  }

  useExtraLifeCar1(car) {
    this.extraLifeActiveCar1 = false;
    this.invulnerableCar1 = true;
    car.setTint(0xff0000);
    this.scene.hud.deactivateExtraLife(1);

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
    this.invulnerableCar2 = true;
    car.setTint(0xff0000);
    this.scene.hud.deactivateExtraLife(2);

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
    this.scene.hud.showPowerupTimer('shield', 4500, 0.04, 1);

    if (!this.schildAktivCar1) {
      this.schildAktivCar1 = true;
      this.scene.sound.play('shield-collected', { volume: 0.3 });
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
        this.scene.sound.play('shield-over', { volume: 0.3 });

        this.scene.tweens.killTweensOf(this.scene.car);
        this.scene.car.alpha = 1;

        this.scene.car.setTexture('car');
      });
    }
  }

  itemShieldCar2() {
    this.scene.hud.showPowerupTimer('shield', 4500, 0.04, 2);
    if (!this.schildAktivCar2) {
      this.schildAktivCar2 = true;
      this.scene.sound.play('shield-collected', { volume: 0.3 });
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
        this.scene.sound.play('shield-over', { volume: 0.3 });

        this.scene.tweens.killTweensOf(this.scene.secondCar);
        this.scene.secondCar.alpha = 1;

        this.scene.secondCar.setTexture('car2');
      });
    }
  }

  itemMagnetCar1() {
    this.scene.car.magnetActive = true;
    this.scene.hud.showPowerupTimer('magnet', 10000, 0.2, 1);
    const magnet = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (this.scene.car.dead) return;

        for (const roadObject of this.scene.roadObjects) {
          if (roadObject.texture?.key !== 'coin') {
            continue;
          }

          const distance = Phaser.Math.Distance.Between(
            this.scene.car.x,
            this.scene.car.y,
            roadObject.x,
            roadObject.y,
          );

          if (distance < 600) {
            roadObject.x += (this.scene.car.x - roadObject.x) * 0.1;
            roadObject.y += (this.scene.car.y - roadObject.y) * 0.1;
          }
        }
      },
    });

    this.scene.time.delayedCall(10000, () => {
      this.scene.car.magnetActive = false;
      magnet.remove();
    });
  }

  itemMagnetCar2() {
    this.scene.secondCar.magnetActive = true;
    this.scene.hud.showPowerupTimer('magnet', 10000, 0.2, 2);
    const magnet = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (this.scene.secondCar.dead) return;

        for (const roadObject of this.scene.roadObjects) {
          if (roadObject.texture?.key !== 'coin') {
            continue;
          }

          const distance = Phaser.Math.Distance.Between(
            this.scene.secondCar.x,
            this.scene.secondCar.y,
            roadObject.x,
            roadObject.y,
          );

          if (distance < 600) {
            roadObject.x += (this.scene.secondCar.x - roadObject.x) * 0.1;
            roadObject.y += (this.scene.secondCar.y - roadObject.y) * 0.1;
          }
        }
      },
    });

    this.scene.time.delayedCall(10000, () => {
      this.scene.secondCar.magnetActive = false;
      magnet.remove();
    });
  }

  // Checks health for car 1
  lebenCheckCar1(car, object) {
    // Duck check
    if (object.texture.key === 'random-object2') {
      this.yeet(object);
      return;
    }

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

  // Yeets a target
  yeet(target) {
    // Disable collition
    target.body.enable = false;

    // Start coords
    const startX = target.x;
    const startY = target.y;

    // Windows width
    const windowWidth = this.scene.scale.width;

    // Changes texture - TODO
    // target.setTexture('car');

    // Gets tweens
    const tweens = this.scene.tweens;
    // Target
    tweens.add({
      targets: target,
      x: startX > windowWidth / 2 ? startX + 800 : startX - 800,
      duration: 1000,
    });

    // Animation
    tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1000,
      onUpdate: (tween) => {
        const t = tween.getValue();
        target.y = startY + t * 25 - Math.sin(t * Math.PI) * 350;
      },
    });
  }

  itemRandom1() {
    const random = Phaser.Math.Between(1, 5);

    if (random === 1) {
      return this.itemShrinkCar1();
    } else if (random === 2) {
      return this.itemGrowCar1();
    } else if (random === 3) {
      return this.itemShieldCar1();
    } else if (random === 4) {
      return this.itemNausea();
    } else if (random === 5) {
      return this.itemMagnetCar1();
    }
  }

  itemRandom2() {
    const random = Phaser.Math.Between(1, 5);

    if (random === 1) {
      return this.itemShrinkCar2();
    } else if (random === 2) {
      return this.itemGrowCar2();
    } else if (random === 3) {
      return this.itemShieldCar2();
    } else if (random === 4) {
      return this.itemNausea();
    } else if (random === 5) {
      return this.itemMagnetCar2();
    }
  }

  iceEffect(car) {
    if (car.iceTriggered) {
      return;
    }

    car.inputLocked = true;
    car.iceTriggered = true;

    console.log('ice!');

    let direction = Phaser.Math.Between(0, 1) ? 1 : -1;

    let targetLane = Phaser.Math.Clamp(car.currentLane + direction, 0, car.lanes.length - 1);

    car.currentLane = targetLane;

    this.scene.tweens.add({
      targets: car,
      x: car.lanes[targetLane],
      duration: 1250,
    });

    this.scene.time.delayedCall(1500, () => {
      car.iceTriggered = false;
      car.inputLocked = false;
    });
  }

  oilEffect(car) {
    if (car.oilTriggered) {
      return;
    }

    car.oilTriggered = true;
    car.inputLocked = true;

    console.log('oil!');

    let direction = Phaser.Math.Between(0, 1) ? 1 : -1;

    let targetLane = Phaser.Math.Clamp(car.currentLane + direction, 0, car.lanes.length - 1);

    car.currentLane = targetLane;

    this.scene.tweens.add({
      targets: car,
      x: car.lanes[targetLane],
      duration: 1250,
    });

    this.scene.time.delayedCall(1500, () => {
      car.oilTriggered = false;
      car.inputLocked = false;
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
    this.scene.hud.showPowerupTimer('coinMultiplier', 10000, 0.03, 1);

    car.coinMultiplier = 2;
    car.multiplierTimer = this.scene.time.delayedCall(10000, () => {
      car.coinMultiplier = 1;
      console.log('Multiplier disabled');
    });

    item.destroy();
  }

  multiplyCoins2(car, item) {
    if (car.multiplierTimer) {
      car.multiplierTimer.remove();
    }

    console.log('Multiplier enabled');
    this.scene.hud.showPowerupTimer('coinMultiplier', 10000, 0.03, 2);
    car.coinMultiplier = 2;
    car.multiplierTimer = this.scene.time.delayedCall(10000, () => {
      car.coinMultiplier = 1;
      console.log('Multiplier disabled');
    });

    item.destroy();
  }

  itemShop() {
    // Hotkeys Player1
    this.key1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

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

    if (
      Phaser.Input.Keyboard.JustDown(this.key3) &&
      this.coinBudgetPlayer1 >= this.itemHeartPrize
    ) {
      this.itemExtraLifeCar1();
      this.coinBudgetPlayer1 -= this.itemHeartPrize;
    }

    // Hotkeys Player2
    this.numpad1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE);
    this.numpad2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO);
    this.numpad3 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE);

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

    if (
      Phaser.Input.Keyboard.JustDown(this.numpad3) &&
      this.coinBudgetPlayer2 >= this.itemHeartPrize
    ) {
      this.itemExtraLifeCar2();
      this.coinBudgetPlayer2 -= this.itemHeartPrize;
    }
  }
}
