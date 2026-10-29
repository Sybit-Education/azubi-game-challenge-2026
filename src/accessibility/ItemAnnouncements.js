import Item from '../objects/Item.js';
import { getPickupWarningSeconds } from './warningTiming.js';

export default class ItemAnnouncements {
  constructor(scene) {
    this.scene = scene;
    this.announcedBoxes = new WeakSet();
    this.currentBox = null;
  }

  isBoxAhead(box) {
    const car = this.scene.car;
    return Boolean(
      box instanceof Item &&
      box.active &&
      box.body?.enable &&
      box.body.bottom <= car.body.top &&
      this.scene.roadObjects.includes(box),
    );
  }

  getMysteryBoxesAhead() {
    return this.scene.roadObjects.filter((object) => this.isBoxAhead(object));
  }

  getTimeUntilBox(box) {
    const car = this.scene.car;
    const distance = car.body.top - box.body.bottom;

    const heightFactor = this.scene.scale.height / 1200;
    const boxSpeed = box.speed * heightFactor;
    const closingSpeed = boxSpeed - car.body.velocity.y;

    if (!Number.isFinite(closingSpeed) || closingSpeed <= 0) {
      return Infinity;
    }

    return Math.max(0, distance) / closingSpeed;
  }

  getNextMysteryBox() {
    const boxes = this.getMysteryBoxesAhead();
    let next = null;

    for (const box of boxes) {
      if (this.announcedBoxes.has(box)) continue;
      const seconds = this.getTimeUntilBox(box);

      if (!Number.isFinite(seconds)) continue;

      if (next === null || seconds < next.seconds) {
        next = { box, seconds };
      }
    }

    return next;
  }

  update() {
    const scene = this.scene;

    // Cancel even a running announcement once its target is no longer ahead.
    if (this.currentBox && !this.isBoxAhead(this.currentBox)) {
      scene.speech.cancel('item');
      this.currentBox = null;
    }

    if (
      !scene.registry.get('accessibility enabled') ||
      scene.car.dead ||
      scene.sound.locked ||
      !scene.speech.available
    ) {
      scene.speech.cancel('item');
      this.currentBox = null;
      return;
    }

    const next = this.getNextMysteryBox();

    if (!next || next.seconds > getPickupWarningSeconds(next.box.speed)) return;

    if (scene.currentLaneDanger || scene.iceWarning.isPlaying || scene.speech.current) {
      return;
    }

    const laneNumber = next.box.lane + 1;

    this.currentBox = next.box;
    scene.speech.speak(`Mystery box, lane ${laneNumber}`, {
      key: 'item',
      // GameSpeech rechecks this before resuming an interrupted announcement.
      isValid: () =>
        scene.registry.get('accessibility enabled') && !scene.car.dead && this.isBoxAhead(next.box),
    });

    this.announcedBoxes.add(next.box);
  }
}
