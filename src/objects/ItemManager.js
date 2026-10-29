import Phaser from 'phaser';

const MAGNET_DURATION_MS = 10000;
const MAGNET_RANGE = 600;

export default class ItemManager {
  constructor(scene) {
    this.scene = scene;

    this.coinBudgetPlayer1 = 35;
    this.coinBudgetPlayer2 = 0;

    this.coinMultiplierOnP1 = false;
    this.coinMultiplierOnP2 = false;

    this.itemShieldPrize = 35;
    this.itemShrinkPrize = 25;
    this.itemHeartPrize = 40;
    this.itemMagnetPrize = 35;

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
      this.scene.sound.play('restore-size', { volume: 0.3 });
    });
  }

  itemShrinkCar2() {
    console.log('Shrink 2');
    this.scene.hud.showPowerupTimer('shrink', 10000, 0.1, 2);
    const car = this.scene.secondCar;

    car.setScale(this.originScale * 0.5);

    this.scene.time.delayedCall(10000, () => {
      car.setScale(this.originScale);
      this.scene.sound.play('restore-size', { volume: 0.3 });
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
      this.scene.sound.play('restore-size', { volume: 0.3 });
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
      this.scene.sound.play('restore-size', { volume: 0.3 });
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
    console.log('shield!');
    this.scene.hud.showPowerupTimer('shield', 4500, 0.04, 1);

    if (!this.schildAktivCar1) {
      this.schildAktivCar1 = true;
      this.scene.sound.play('shield-collected', { volume: 0.3 });
      
      const oldWidth = this.scene.car.displayWidth;
      const oldHeight = this.scene.car.displayHeight;
     
      if (this.scene.registry.get("gameMode") === 'christmas') {
        this.scene.car.setTexture('carShieldChristmas')
        this.scene.car.setDisplaySize(oldWidth, oldHeight);
      } else {
        this.scene.car.setTexture('carShield')
        this.scene.car.setDisplaySize(oldWidth, oldHeight);
      }

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

        if (this.scene.registry.get("gameMode") === 'christmas') {
          this.scene.car.setTexture('winter-car');
          this.scene.car.setDisplaySize(oldWidth, oldHeight);
        } else {
          this.scene.car.setTexture('car');
          this.scene.car.setDisplaySize(oldWidth, oldHeight);
        }

      });
    }
  }

  itemShieldCar2() {
    this.scene.hud.showPowerupTimer('shield', 4500, 0.04, 2);
    if (!this.schildAktivCar2) {
      this.schildAktivCar2 = true;
      this.scene.sound.play('shield-collected', { volume: 0.3 });
      const car = this.scene.secondCar;
      const oldWidth = car.displayWidth;
      const oldHeight = car.displayHeight;

      if (this.scene.registry.get("gameMode") === 'christmas') {
        car.setTexture('carShieldChristmas2');
      } else {
        car.setTexture('carShield2');
      }
      car.setDisplaySize(oldWidth, oldHeight);

      this.scene.time.delayedCall(4500, () => {
        this.scene.tweens.add({
          targets: car,
          alpha: 0.2,
          duration: 700,
          yoyo: true,
          repeat: -1,
        });
      });

      this.scene.time.delayedCall(8000, () => {
        this.schildAktivCar2 = false;
        this.scene.sound.play('shield-over', { volume: 0.3 });

        this.scene.tweens.killTweensOf(car);
        car.alpha = 1;
        
        if (this.scene.registry.get("gameMode") === 'christmas') {
          car.setTexture('winter-car2');
        } else {
          car.setTexture('car2');
        }
        car.setDisplaySize(oldWidth, oldHeight);
      });
    }
  }

  itemMagnetCar1() {
    return this.activateMagnet(this.scene.car, 1);
  }

  itemMagnetCar2() {
    return this.activateMagnet(this.scene.secondCar, 2);
  }

  activateMagnet(car, player) {
    if (!car || !car.active || car.dead || car.magnetActive) return false;

    car.magnetActive = true;
    this.scene.sound.play('collect-magnet', { volume: 0.3 });
    this.scene.hud.showPowerupTimer('magnet', MAGNET_DURATION_MS, 0.2, player);

    const magnet = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (!car.active || car.dead) return;
        for (const object of this.scene.roadObjects) {
          if (!object.active || object.texture?.key !== 'coin') continue;

          const distance = Phaser.Math.Distance.Between(car.x, car.y, object.x, object.y);
          if (distance < MAGNET_RANGE) {
            object.x += (car.x - object.x) * 0.1;
            object.y += (car.y - object.y) * 0.1;
          }
        }
      },
    });

    this.scene.time.delayedCall(MAGNET_DURATION_MS, () => {
      car.magnetActive = false;
      magnet.remove();
    });
    return true;
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

    this.scene.sound.play('coin-multiplier-picked-up', { volume: 0.6 });
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

    this.scene.sound.play('coin-multiplier-picked-up', { volume: 0.3 });
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
    this.key4 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);

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

    if (
      Phaser.Input.Keyboard.JustDown(this.key4) &&
      this.coinBudgetPlayer1 >= this.itemMagnetPrize &&
      this.itemMagnetCar1()
    ) {
      this.coinBudgetPlayer1 -= this.itemMagnetPrize;
    }

    // Hotkeys Player2
    this.numpad1 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE);
    this.numpad2 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO);
    this.numpad3 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE);
    this.numpad4 = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR);

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

    if (
      Phaser.Input.Keyboard.JustDown(this.numpad4) &&
      this.coinBudgetPlayer2 >= this.itemMagnetPrize &&
      this.itemMagnetCar2()
    ) {
      this.coinBudgetPlayer2 -= this.itemMagnetPrize;
    }
  }
}
