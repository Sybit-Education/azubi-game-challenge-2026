import {
  mapCarToAudioPosition,
  mapSpeedToListenerFrequency,
  resolveRoadLane,
  selectAudibleCars,
} from './carSpatialMath.js';

export class CarSpatialAudioSystem {
  constructor({ sourceFactory, isEnemyCar, laneCue = null, crashSound = null }) {
    this.sourceFactory = sourceFactory;
    this.isEnemyCar = isEnemyCar;
    this.laneCue = laneCue;
    this.crashSound = crashSound;
    this.candidates = [];
    this.sources = new Map();
    this.listenerSource = null;
    this.currentLane = null;
    this.listenerCar = null;
    this.roadWidth = null;
    this.viewportHeight = null;
  }

  update({
    listenerCar,
    roadObjects,
    opponentCar,
    roadLeftEdge,
    roadWidth,
    viewportHeight,
    gameSpeed,
  }) {
    if (!listenerCar?.active || listenerCar.dead) {
      this.clear();
      return;
    }

    this.listenerCar = listenerCar;
    this.roadWidth = roadWidth;
    this.viewportHeight = viewportHeight;
    this.updateListener(listenerCar, roadLeftEdge, roadWidth, gameSpeed);
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

  playCrash(crashedCar) {
    if (!this.crashSound || !this.listenerCar) return;

    this.crashSound.play(
      mapCarToAudioPosition(crashedCar, this.listenerCar, this.roadWidth, this.viewportHeight),
    );
  }

  updateListener(listenerCar, roadLeftEdge, roadWidth, gameSpeed) {
    if (!this.listenerSource) {
      this.listenerSource = this.sourceFactory('listener');
      this.listenerSource.setPosition({ x: 0, y: 0, z: 0 });
    }

    this.listenerSource.setFrequency(mapSpeedToListenerFrequency(gameSpeed));

    if (!this.laneCue || !Number.isFinite(roadLeftEdge)) return;

    const nextLane = resolveRoadLane(listenerCar.x, roadLeftEdge, roadWidth, this.currentLane);

    if (nextLane !== this.currentLane) {
      this.currentLane = nextLane;
      this.laneCue.announce(nextLane);
    }
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
    this.listenerSource?.destroy();
    this.listenerSource = null;
    this.currentLane = null;
    this.laneCue?.silence();

    for (const source of this.sources.values()) {
      source.destroy();
    }

    this.sources.clear();
  }

  destroy() {
    this.clear();
    this.listenerCar = null;
    this.roadWidth = null;
    this.viewportHeight = null;
    this.laneCue?.destroy();
    this.crashSound?.destroy();
  }
}
