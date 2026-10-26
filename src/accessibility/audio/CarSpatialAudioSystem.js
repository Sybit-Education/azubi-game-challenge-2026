import { mapCarToAudioPosition, selectAudibleCars } from './carSpatialMath.js';

export class CarSpatialAudioSystem {
  constructor({ sourceFactory, isEnemyCar }) {
    this.sourceFactory = sourceFactory;
    this.isEnemyCar = isEnemyCar;
    this.candidates = [];
    this.sources = new Map();
  }

  update({ listenerCar, roadObjects, opponentCar, roadWidth, viewportHeight }) {
    if (!listenerCar?.active || listenerCar.dead) {
      this.clear();
      return;
    }

    this.candidates.length = 0;

    for (const roadObject of roadObjects) {
      if (this.isEnemyCar(roadObject)) {
        this.candidates.push({ target: roadObject, kind: 'enemy' });
      }
    }

    if (opponentCar && opponentCar !== listenerCar) {
      this.candidates.push({ target: opponentCar, kind: 'opponent' });
    }

    const selected = selectAudibleCars(this.candidates, listenerCar, viewportHeight);

    this.synchronizeSources(selected, listenerCar, roadWidth, viewportHeight);
  }

  synchronizeSources(selected, listenerCar, roadWidth, viewportHeight) {
    const selectedTargets = new Set();

    for (const { target, kind } of selected) {
      selectedTargets.add(target);

      let source = this.sources.get(target);
      if (!source) {
        source = this.sourceFactory(kind);
        this.sources.set(target, source);
      }

      source.setPosition(mapCarToAudioPosition(target, listenerCar, roadWidth, viewportHeight));
    }

    for (const [target, source] of this.sources) {
      if (!selectedTargets.has(target)) {
        source.destroy();
        this.sources.delete(target);
      }
    }
  }

  clear() {
    for (const source of this.sources.values()) {
      source.destroy();
    }

    this.sources.clear();
  }

  destroy() {
    this.clear();
  }
}
