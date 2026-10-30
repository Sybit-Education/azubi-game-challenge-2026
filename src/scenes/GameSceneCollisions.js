import Phaser from 'phaser';

import { DUCK_QUACK_SOUND_KEYS } from '../../audio/sounds.js';

const DUCK_SOUND_DURATION = 0.8;
const DUCK_SOUND_VOLUME = 0.12;
const QUIET_DUCK_SOUND_VOLUME = 0.04;

function playDuckSound(scene, obstacle) {
  if (!obstacle.isDuck || obstacle.duckSoundPlayed) return;

  obstacle.duckSoundPlayed = true;
  const soundIndex = Phaser.Math.Between(0, DUCK_QUACK_SOUND_KEYS.length - 1);
  const soundKey = DUCK_QUACK_SOUND_KEYS[soundIndex];
  const accessibilityEnabled = scene.registry.get('accessibility enabled');

  scene.sound.play(soundKey, {
    name: 'short-quack',
    start: 0,
    duration: DUCK_SOUND_DURATION,
    config: {
      volume: accessibilityEnabled ? QUIET_DUCK_SOUND_VOLUME : DUCK_SOUND_VOLUME,
      loop: false,
    },
  });
}

export function hitRandomObstacle(scene, car, obstacle) {
  if (car.dead || !obstacle.active) return;

  // A duck only quacks once, even when the collision lasts a few frames.
  playDuckSound(scene, obstacle);

  if (car === scene.car || car === scene.secondCar) {
    scene.ItemManager.lebenCheck(car, obstacle);
  }
}
