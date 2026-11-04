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

  getPlayerCar(player) {
    return player === 1 ? this.scene.car : this.scene.secondCar;
  }

  itemShrink(player) {
    console.log('shrink');
    const texture = 'shrink';
    const playerNumber = player === 1 ? 1 : 2;
    const car = this.getPlayerCar(player);
    this[`carshrinkP${playerNumber}`] = true;

    this.removeOldPowerupTimer(texture, player);

    this.scene.hud.showPowerupTimer(texture, 10000, 0.1, player);

    if (car.growTimer) {
      car.growTimer.remove();
      car.growTimer = null;
      this[`cargrowP${playerNumber}`] = false;
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
      this[`carshrinkP${playerNumber}`] = false;
    });
  }

  itemGrow(player) {
    console.log('grow');
    const texture = 'grow';
    const playerNumber = player === 1 ? 1 : 2;
    const car = this.getPlayerCar(player);
    this[`cargrowP${playerNumber}`] = true;

    this.removeOldPowerupTimer(texture, player);

    this.scene.hud.showPowerupTimer(texture, 10000, 0.04, player);

    if (car.shrinkTimer) {
      car.shrinkTimer.remove();
      car.shrinkTimer = null;
      this[`carshrinkP${playerNumber}`] = false;
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
      this[`cargrowP${playerNumber}`] = false;
    });
  }

  itemExtraLife(player) {
    console.log('extralife collected');
    this.scene.hud.displayExtraLife(player);
    this.scene.sound.play('collect-extra-life', { volume: 0.3 });

    this[`extraLifeActiveCar${player === 1 ? 1 : 2}`] = true;
  }

  useExtraLife(car, player) {
    const playerNumber = player === 1 ? 1 : 2;
    this[`extraLifeActiveCar${playerNumber}`] = false;
    this[`invulnerableCar${playerNumber}`] = true;

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
      this[`invulnerableCar${playerNumber}`] = false;
      car.clearTint();
    });

    console.log('extra life used');
    return;
  }

  itemShield(player) {
    const texture = 'shield';
    const christmas = this.scene.registry.get('gameMode') === 'christmas';
    const car = player === 2 ? this.scene.secondCar : this.scene.car;
    let carTexture = christmas ? 'winter-car' : 'car';
    let shieldTexture = christmas ? 'carShieldChristmas' : 'carShield';

    if (player === 2) {
      carTexture = christmas ? 'winter-car2' : 'car2';
      shieldTexture = christmas ? 'carShieldChristmas2' : 'carShield2';
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
    const playerNumber = player === 1 ? 1 : 2;
    this[`schildAktivCar${playerNumber}`] = true;

    // shield texture has a different size, so keep the car as big as it was
    const oldWidth = car.displayWidth;
    const oldHeight = car.displayHeight;
    car.setTexture(shieldTexture);
    car.setDisplaySize(oldWidth, oldHeight);
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
      this[`schildAktivCar${playerNumber}`] = false;
      car.alpha = 1;

      // size is checked again here in case the car shrank or grew during the shield
      const width = car.displayWidth;
      const height = car.displayHeight;
      car.setTexture(carTexture);
      car.setDisplaySize(width, height);

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

  lebenCheck(car, object) {
    // Duck check
    if (object.texture.key === 'random-object2') {
      this.yeet(object);
      return;
    }

    const player = car === this.scene.secondCar ? 2 : 1;
    const playerNumber = player === 1 ? 1 : 2;

    if (this[`invulnerableCar${playerNumber}`]) {
      return;
    }

    if (this[`schildAktivCar${playerNumber}`]) {
      return;
    }

    if (this[`extraLifeActiveCar${playerNumber}`]) {
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

  yeet(target) {
    target.body.enable = false;

    const startX = target.x;
    const startY = target.y;

    const windowWidth = this.scene.scale.width;

    const tweens = this.scene.tweens;
    tweens.add({
      targets: target,
      x: startX > windowWidth / 2 ? startX + 800 : startX - 800,
      duration: 1000,
    });

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
    const car = this.getPlayerCar(player);

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
    const playerNumber = player === 1 ? 1 : 2;
    const budgetKey = `coinBudgetPlayer${playerNumber}`;
    this[budgetKey] += multiplier;
    console.log(`Spieler${playerNumber} has collected ${this[budgetKey]} Coins`);
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
    const players = [
      {
        number: 1,
        controls: controlsP1,
        keys: [this.key1, this.key2, this.key3, this.key4],
        car: this.scene.car,
        budgetKey: 'coinBudgetPlayer1',
        extraLifeKey: 'extraLifeActiveCar1',
      },
      {
        number: 2,
        controls: controlsP2,
        keys: [this.numpad1, this.numpad2, this.numpad3, this.numpad4],
        car: this.scene.secondCar,
        budgetKey: 'coinBudgetPlayer2',
        extraLifeKey: 'extraLifeActiveCar2',
      },
    ];

    for (const { number, controls, keys, car, budgetKey, extraLifeKey } of players) {
      const getBudget = () => this[budgetKey];
      const spend = (price) => {
        this[budgetKey] -= price;
      };

      if (
        (Phaser.Input.Keyboard.JustDown(keys[0]) || controls.button1) &&
        getBudget() >= this.itemShieldPrize
      ) {
        this.itemShield(number);
        spend(this.itemShieldPrize);
      }

      if (
        (Phaser.Input.Keyboard.JustDown(keys[1]) || controls.button2) &&
        getBudget() >= this.itemShrinkPrize
      ) {
        this.itemShrink(number);
        spend(this.itemShrinkPrize);
      }

      if (
        (Phaser.Input.Keyboard.JustDown(keys[2]) || controls.button3) &&
        getBudget() >= this.itemHeartPrize &&
        !this[extraLifeKey]
      ) {
        this.itemExtraLife(number);
        spend(this.itemHeartPrize);
      }

      if (
        Phaser.Input.Keyboard.JustDown(keys[3]) &&
        getBudget() >= this.itemMagnetPrize &&
        this.activateMagnet(car, number)
      ) {
        spend(this.itemMagnetPrize);
      }
    }
  }
}
