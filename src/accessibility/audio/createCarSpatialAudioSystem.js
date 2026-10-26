import Phaser from 'phaser';

import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';
import { CarSpatialAudioSystem } from './CarSpatialAudioSystem.js';
import { SpatialEngineSource } from './SpatialEngineSource.js';

export function createCarSpatialAudioSystem(scene, isEnemyCar) {
  const WebAudioSoundManager = Phaser.Sound?.WebAudioSoundManager;

  if (!WebAudioSoundManager || !(scene.sound instanceof WebAudioSoundManager)) {
    return null;
  }

  return new CarSpatialAudioSystem({
    isEnemyCar,
    sourceFactory: (kind) => {
      const frequency =
        kind === 'opponent' ? CAR_AUDIO_CONFIG.opponentFrequency : CAR_AUDIO_CONFIG.enemyFrequency;

      return new SpatialEngineSource(scene.sound.context, scene.sound.destination, frequency);
    },
  });
}
