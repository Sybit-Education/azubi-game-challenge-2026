import { LaneCueAnnouncer } from './LaneCueAnnouncer.js';

export default class LaneAnnouncements {
  constructor(scene) {
    this.scene = scene;
    this.currentLane = null;
    this.announcer =
      scene.sound.context && scene.sound.destination
        ? new LaneCueAnnouncer({
            audioContext: scene.sound.context,
            destination: scene.sound.destination,
            speechSynthesis: globalThis.speechSynthesis,
            Utterance: globalThis.SpeechSynthesisUtterance,
          })
        : null;

    const silence = () => this.silence();
    scene.events.on('pause', silence);
    scene.events.on('sleep', silence);
    scene.events.once('shutdown', () => {
      scene.events.off('pause', silence);
      scene.events.off('sleep', silence);
      this.announcer?.destroy();
    });
  }

  get speaks() {
    return Boolean(this.announcer?.speechSynthesis && this.announcer?.Utterance);
  }

  update() {
    if (
      !this.scene.registry.get('accessibility enabled') ||
      this.scene.car.dead ||
      this.scene.sound.locked ||
      this.scene.sound.context?.state !== 'running'
    ) {
      this.silence();
      return;
    }
    if (!this.announcer) return;

    const lane = this.scene.getPlayerLane(this.scene.car);
    if (lane === this.currentLane) return;
    this.currentLane = lane;
    this.announcer.announce(lane);
  }

  silence() {
    if (this.currentLane === null) return;
    this.currentLane = null;
    this.announcer?.silence();
  }
}
