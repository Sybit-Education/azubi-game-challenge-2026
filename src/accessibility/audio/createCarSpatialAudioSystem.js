import Phaser from 'phaser';

import { CarSpatialAudioSystem } from './CarSpatialAudioSystem.js';
import { CrashSoundPlayer } from './CrashSoundPlayer.js';
import { getEngineVoice } from './engineVoice.js';
import { LaneCueAnnouncer } from './LaneCueAnnouncer.js';
import { ScrapeSoundPlayer } from './ScrapeSoundPlayer.js';
import { SpatialEngineSource } from './SpatialEngineSource.js';

export function createCarSpatialAudioSystem(scene, isEnemyCar) {
  const WebAudioSoundManager = Phaser.Sound?.WebAudioSoundManager;

  if (!WebAudioSoundManager || !(scene.sound instanceof WebAudioSoundManager)) {
    return null;
  }

  return new CarSpatialAudioSystem({
    crashSound: new CrashSoundPlayer(scene.sound.context, scene.sound.destination),
    isEnemyCar,
    laneCue: new LaneCueAnnouncer({
      audioContext: scene.sound.context,
      destination: scene.sound.destination,
      speechSynthesis: globalThis.speechSynthesis,
      Utterance: globalThis.SpeechSynthesisUtterance,
    }),
    scrapeSound: new ScrapeSoundPlayer(scene.sound.context, scene.sound.destination),
    sourceFactory: (kind) => {
      const { frequency, targetGain } = getEngineVoice(kind);

      return new SpatialEngineSource(scene.sound.context, scene.sound.destination, frequency, {
        targetGain,
      });
    },
  });
}
