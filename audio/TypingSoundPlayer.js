import { TYPING_SOUND_KEYS } from './sounds.js';

export default class TypingSoundPlayer {
  constructor(scene) {
    this.scene = scene;
    this.lastSound = null;
    this.sounds = TYPING_SOUND_KEYS.map((key) => scene.sound.add(key, { volume: 0.3 }));
    scene.events.once('shutdown', () => {
      for (const sound of this.sounds) sound.destroy();
    });
  }

  play() {
    if (this.scene.sound.locked) return;

    // Different recorded clicks keep consecutive characters from sounding identical.
    const choices = this.sounds.filter((sound) => sound !== this.lastSound);
    const sound = choices[Math.floor(Math.random() * choices.length)];
    if (sound.play()) this.lastSound = sound;
  }
}
