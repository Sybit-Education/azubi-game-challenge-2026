import Item from '../objects/Item.js';
import { getPickupWarningSeconds } from './warningTiming.js';

export default class ItemAnnouncements {
  constructor(scene) {
    this.scene = scene;
    this.announcedBoxes = new WeakSet();
  }

  getMysteryBoxesAhead() {
    const car = this.scene.car;

    return this.scene.roadObjects.filter((object) => {
      return (
        object instanceof Item &&
        object.active &&
        object.body?.enable &&
        object.body.bottom <= car.body.top
      );
    });
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

    if (
      !scene.registry.get('accessibility enabled') ||
      scene.car.dead ||
      scene.sound.locked ||
      !scene.speech.available
    ) {
      return;
    }

    const next = this.getNextMysteryBox();

    if (!next || next.seconds > getPickupWarningSeconds(next.box.speed)) return;
    if (this.announcedBoxes.has(next.box)) return;

    if (scene.currentLaneDanger || scene.iceWarning.isPlaying || scene.speech.current) {
      return;
    }

    const laneNumber = next.box.lane + 1;

    scene.speech.speak(`Mystery box, lane ${laneNumber}`, { key: 'item' });

    this.announcedBoxes.add(next.box);
  }
}
