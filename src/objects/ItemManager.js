import Phaser from 'phaser';
import InputManager from './InputManager.js';

const MAGNET_DURATION_MS = 10000;
const MAGNET_RANGE = 600;

export default class ItemManager {
  constructor(scene) {
    this.scene = scene;
    this.inputManager = new InputManager(scene);
    this.inputManager.create();
    scene.InputManager = this.inputManager;

    this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    this.key4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.numpad1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE);
    this.numpad2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO);
    this.numpad3 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE);
    this.numpad4 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR);

    this.coinBudgetPlayer1 = 0;
    this.coinBudgetPlayer2 = 0;

    this.coinMultiplierOnP1 = false;
    this.coinMultiplierOnP2 = false;

    this.itemShieldPrize = 35;
    this.itemShrinkPrize = 25;
    this.itemHeartPrize = 40;
    this.itemMagnetPrize = 35;

    if (this.scene.isMultiplayer) {
      this.itemShieldPrize = 25;
      this.itemShrinkPrize = 15;
      this.itemHeartPrize = 30;
    }

    this.nauseaTweenActive = false;
    this.nauseaCount = 0;
    this.schildAktivCar1 = false;
    this.schildAktivCar2 = false;

    this.extraLifeActiveCar1 = false;
    this.extraLifeActiveCar2 = false;
    this.invulnerableCar1 = false;
    this.invulnerableCar2 = false;

    this.carshrinkP1 = false;
    this.carshrinkP2 = false;
    this.cargrowP1 = false;
    this.cargrowP2 = false;
    this.originScale = this.scene.car.scale;
    this.carScaleTweens = new WeakMap();
  }

  animateCarScale(car, scale) {
    this.carScaleTweens.get(car)?.stop();

    const tween = this.scene.tweens.add({
      targets: car,
      scaleX: scale,
      scaleY: scale,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.carScaleTweens.set(car, tween);
  }

  removeOldPowerupTimer(texture, player) {
    const list = player === 1 ? this.scene.hud.activePowerupsP1 : this.scene.hud.activePowerupsP2;

    const index = list.findIndex((powerup) => powerup.type === texture);

    if (index !== -1) {
      const oldPowerup = list[index];

      oldPowerup.icon.destroy();
      oldPowerup.overlay.destroy();

      list.splice(index, 1);
      this.scene.hud.layoutPowerups();
    }
  }

  itemShrink(player) {
    console.log('shrink');
    const texture = 'shrink';
    let car = this.scene.car;

    if (player === 1) {
      this.carshrinkP1 = true;
    } else {
      this.carshrinkP2 = true;
      car = this.scene.secondCar;
    }

    this.removeOldPowerupTimer(texture, player);

    this.scene.hud.showPowerupTimer(texture, 10000, 0.1, player);

    if (car.growTimer) {
      car.growTimer.remove();
      car.growTimer = null;
      if (player === 1) {
        this.cargrowP1 = false;
      } else {
        this.cargrowP2 = false;
      }
    }

    if (car.shrinkTimer) {
      car.shrinkTimer.remove();
    }

    this.animateCarScale(car, this.originScale * 0.5);
    this.scene.sound.play('change-size', { volume: 0.3 });

    car.shrinkTimer = this.scene.time.delayedCall(10100, () => {
      this.animateCarScale(car, this.originScale);
      this.scene.sound.play('restore-size', { volume: 0.3 });
      car.shrinkTimer = null;

      if (player === 1) {
        this.carshrinkP1 = false;
      } else {
        this.carshrinkP2 = false;
      }
    });
  }

  itemGrow(player) {
    console.log('grow');
    const texture = 'grow';
    let car = this.scene.car;

    if (player === 1) {
      this.cargrowP1 = true;
    } else {
      this.cargrowP2 = true;
      car = this.scene.secondCar;
    }

    this.removeOldPowerupTimer(texture, player);

    this.scene.hud.showPowerupTimer(texture, 10000, 0.04, player);

    if (car.shrinkTimer) {
      car.shrinkTimer.remove();
      car.shrinkTimer = null;
      if (player === 1) {
        this.carshrinkP1 = false;
      } else {
        this.carshrinkP2 = false;
      }
    }

    if (car.growTimer) {
      car.growTimer.remove();
    }

    this.animateCarScale(car, this.originScale * 1.5);
    this.scene.sound.play('change-size', { volume: 0.3 });

    car.growTimer = this.scene.time.delayedCall(10000, () => {
      this.animateCarScale(car, this.originScale);
      this.scene.sound.play('restore-size', { volume: 0.3 });
      car.growTimer = null;

      if (player === 1) {
        this.cargrowP1 = false;
      } else {
        this.cargrowP2 = false;
      }
    });
  }

  itemExtraLife(player) {
    console.log('extralife collected');
    this.scene.hud.displayExtraLife(player);
    this.scene.sound.play('collect-extra-life', { volume: 0.3 });

    if (player === 1) {
      this.extraLifeActiveCar1 = true;
    } else {
      this.extraLifeActiveCar2 = true;
    }
  }

  useExtraLife(car, player) {
    if (player === 1) {
      this.extraLifeActiveCar1 = false;
      this.invulnerableCar1 = true;
    } else {
      this.extraLifeActiveCar2 = false;
      this.invulnerableCar2 = true;
    }

    car.setTint(0xff0000);
    this.scene.hud.deactivateExtraLife(player);

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
      if (player === 1) {
        this.invulnerableCar1 = false;
      } else {
        this.invulnerableCar2 = false;
      }
      car.clearTint();
    });

    console.log('extra life used');
    return;
  }

  itemShield(player) {
    const texture = 'shield';
    let car = this.scene.car;
    let carTexture = 'car';
    let shieldTexture = 'carShield';

    if (player === 2) {
      car = this.scene.secondCar;
      carTexture = 'car2';
      shieldTexture = 'carShield2';
    }

    this.removeOldPowerupTimer(texture, player);
    this.scene.hud.showPowerupTimer(texture, 8000, 0.04, player);

    if (car.shieldTimer) {
      car.shieldTimer.remove();
    }

    if (car.shieldBlinkTimer) {
      car.shieldBlinkTween?.stop();
      car.shieldBlinkTween = null;
      car.shieldBlinkTimer.remove();
    }

    car.alpha = 1;

    if (player === 1) {
      this.schildAktivCar1 = true;
    } else {
      this.schildAktivCar2 = true;
    }
    car.setTexture(shieldTexture);
    this.scene.sound.play('shield-collected', { volume: 0.3 });

    car.shieldBlinkTimer = this.scene.time.delayedCall(4500, () => {
      car.shieldBlinkTween?.stop();
      car.shieldBlinkTween = null;
      car.shieldBlinkTween = this.scene.tweens.add({
        targets: car,
        alpha: 0.2,
        duration: 700,
        yoyo: true,
        repeat: -1,
      });
    });

    car.shieldTimer = this.scene.time.delayedCall(8000, () => {
      car.shieldBlinkTween?.stop();
      car.shieldBlinkTween = null;
      if (player === 1) {
        this.schildAktivCar1 = false;
      } else {
        this.schildAktivCar2 = false;
      }
      car.alpha = 1;
      car.setTexture(carTexture);

      this.scene.sound.play('shield-over', { volume: 0.3 });

      car.shieldTimer = null;
      car.shieldBlinkTimer = null;
    });
  }

  activateMagnet(car, player) {
    if (!car || !car.active || car.dead) {
      return false;
    }

    const texture = 'magnet';
    this.removeOldPowerupTimer(texture, player);
    this.scene.hud.showPowerupTimer(texture, MAGNET_DURATION_MS, 0.2, player);
    this.scene.sound.play('collect-magnet', { volume: 0.3 });

    const timerKey = player === 1 ? 'magnetTimerP1' : 'magnetTimerP2';
    const eventKey = player === 1 ? 'magnetEventP1' : 'magnetEventP2';

    this[timerKey]?.remove();
    this[eventKey]?.remove();

    car.magnetActive = true;

    this[eventKey] = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (!car.active || car.dead) {
          return;
        }
        this.updateMagnet(car);
      },
    });

    this[timerKey] = this.scene.time.delayedCall(MAGNET_DURATION_MS, () => {
      car.magnetActive = false;
      this[eventKey]?.remove();
      this[eventKey] = null;
      this[timerKey] = null;
    });

    return true;
  }

  updateMagnet(car) {
    for (const object of this.scene.roadObjects) {
      if (!object.active || object.texture?.key !== 'coin') {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(car.x, car.y, object.x, object.y);

      if (distance < MAGNET_RANGE) {
        object.x += (car.x - object.x) * 0.1;
        object.y += (car.y - object.y) * 0.1;
      }
    }
  }

  // Checks health for a car
  lebenCheck(car, object) {
    // Duck check
    if (object.texture.key === 'random-object2') {
      this.yeet(object);
      return;
    }

    let player = 1;
    let invulnerable = this.invulnerableCar1;
    let schildAktiv = this.schildAktivCar1;
    let extraLifeActive = this.extraLifeActiveCar1;

    if (car === this.scene.secondCar) {
      player = 2;
      invulnerable = this.invulnerableCar2;
      schildAktiv = this.schildAktivCar2;
      extraLifeActive = this.extraLifeActiveCar2;
    }

    if (invulnerable) {
      return;
    }

    if (schildAktiv) {
      return;
    }

    if (extraLifeActive) {
      this.useExtraLife(car, player);
      return;
    }
    this.scene.gameOver(car);
  }

  itemNausea() {
    console.log('Nausea');

    if (this.nauseaTweenActive) {
      this.nauseaCount++;
      return;
    }

    this.startNauseaTween();
  }

  startNauseaTween() {
    this.nauseaTweenActive = true;

    this.scene.tweens.add({
      targets: this.scene.cameras.main,
      rotation: 0.05,
      zoom: 1.2,
      duration: 500,
      yoyo: true,
      repeat: 2.5,
      onComplete: () => {
        this.scene.cameras.main.rotation = 0;
        this.scene.cameras.main.zoom = 1;

        if (this.nauseaCount > 0) {
          this.nauseaCount--;
          this.startNauseaTween();
        } else {
          this.nauseaTweenActive = false;
        }
      },
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

  itemRandom(player) {
    const random = Phaser.Math.Between(1, 5);
    const car = player === 1 ? this.scene.car : this.scene.secondCar;

    if (random === 1) {
      return this.itemShrink(player);
    } else if (random === 2) {
      return this.itemGrow(player);
    } else if (random === 3) {
      return this.itemShield(player);
    } else if (random === 4) {
      return this.itemNausea();
    } else if (random === 5) {
      return this.activateMagnet(car, player);
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

    let targetLane = Phaser.Math.Clamp(car.currentLane + direction, -1, car.lanes.length);

    // lane -1 or 4 doesn't exist, so the car slides into the wall instead
    // bumpWall blocks lane changes on its own until the car is back, so no input lock needed
    if (targetLane === -1) {
      car.inputLocked = false;
      car.bumpWall('left');
    } else if (targetLane === car.lanes.length) {
      car.inputLocked = false;
      car.bumpWall('right');
    } else {
      car.currentLane = targetLane;

      this.scene.tweens.add({
        targets: car,
        x: car.lanes[targetLane],
        duration: 1250,
      });
    }

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

    let targetLane = Phaser.Math.Clamp(car.currentLane + direction, -1, car.lanes.length);

    // lane -1 or 4 doesn't exist, so the car slides into the wall instead
    // bumpWall blocks lane changes on its own until the car is back, so no input lock needed
    if (targetLane === -1) {
      car.inputLocked = false;
      car.bumpWall('left');
    } else if (targetLane === car.lanes.length) {
      car.inputLocked = false;
      car.bumpWall('right');
    } else {
      car.currentLane = targetLane;

      this.scene.tweens.add({
        targets: car,
        x: car.lanes[targetLane],
        duration: 1250,
      });
    }

    this.scene.time.delayedCall(1500, () => {
      car.oilTriggered = false;
      car.inputLocked = false;
    });
  }

  coinBudgetPlus(player, multiplier = 1) {
    if (player === 1) {
      this.coinBudgetPlayer1 += multiplier;
      console.log('Spieler1 has collected ' + this.coinBudgetPlayer1 + ' Coins');
    } else {
      this.coinBudgetPlayer2 += multiplier;
      console.log('Spieler2 has collected ' + this.coinBudgetPlayer2 + ' Coins');
    }
    console.log('multiplier: ' + multiplier);
  }

  multiplyCoins(car, item) {
    const texture = 'coinMultiplier';
    let player = 1;

    if (car === this.scene.secondCar) {
      player = 2;
    }

    this.removeOldPowerupTimer(texture, player);

    this.scene.sound.play('coin-multiplier-picked-up', {
      volume: player === 1 ? 0.6 : 0.3,
    });

    console.log('Multiplier enabled');

    this.scene.hud.showPowerupTimer(texture, 10000, 0.03, player);

    car.multiplierTimer?.remove();

    car.coinMultiplier = 2;

    car.multiplierTimer = this.scene.time.delayedCall(10000, () => {
      car.coinMultiplier = 1;
      car.multiplierTimer = null;

      console.log('Multiplier disabled');
    });

    item.destroy();
  }

  itemShop() {
    const controlsP1 = this.inputManager.getControlsP1;
    const controlsP2 = this.inputManager.getControlsP2;

    if (
      (Phaser.Input.Keyboard.JustDown(this.key1) || controlsP1.button1) &&
      this.coinBudgetPlayer1 >= this.itemShieldPrize
    ) {
      this.itemShield(1);
      this.coinBudgetPlayer1 -= this.itemShieldPrize;
    }

    if (
      (Phaser.Input.Keyboard.JustDown(this.key2) || controlsP1.button2) &&
      this.coinBudgetPlayer1 >= this.itemShrinkPrize
    ) {
      this.itemShrink(1);
      this.coinBudgetPlayer1 -= this.itemShrinkPrize;
    }

    if (
      (Phaser.Input.Keyboard.JustDown(this.key3) || controlsP1.button3) &&
      this.coinBudgetPlayer1 >= this.itemHeartPrize &&
      !this.extraLifeActiveCar1
    ) {
      this.itemExtraLife(1);
      this.coinBudgetPlayer1 -= this.itemHeartPrize;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.key4) &&
      this.coinBudgetPlayer1 >= this.itemMagnetPrize &&
      this.activateMagnet(this.scene.car, 1)
    ) {
      this.coinBudgetPlayer1 -= this.itemMagnetPrize;
    }

    if (
      (Phaser.Input.Keyboard.JustDown(this.numpad1) || controlsP2.button1) &&
      this.coinBudgetPlayer2 >= this.itemShieldPrize
    ) {
      this.itemShield(2);
      this.coinBudgetPlayer2 -= this.itemShieldPrize;
    }

    if (
      (Phaser.Input.Keyboard.JustDown(this.numpad2) || controlsP2.button2) &&
      this.coinBudgetPlayer2 >= this.itemShrinkPrize
    ) {
      this.itemShrink(2);
      this.coinBudgetPlayer2 -= this.itemShrinkPrize;
    }

    if (
      (Phaser.Input.Keyboard.JustDown(this.numpad3) || controlsP2.button3) &&
      this.coinBudgetPlayer2 >= this.itemHeartPrize &&
      !this.extraLifeActiveCar2
    ) {
      this.itemExtraLife(2);
      this.coinBudgetPlayer2 -= this.itemHeartPrize;
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.numpad4) &&
      this.coinBudgetPlayer2 >= this.itemMagnetPrize &&
      this.activateMagnet(this.scene.secondCar, 2)
    ) {
      this.coinBudgetPlayer2 -= this.itemMagnetPrize;
    }
  }
}
