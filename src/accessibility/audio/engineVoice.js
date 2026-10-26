import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';

export function getEngineVoice(kind) {
  if (kind === 'listener') {
    return {
      frequency: CAR_AUDIO_CONFIG.listenerFrequencyMin,
      targetGain: CAR_AUDIO_CONFIG.listenerGain,
    };
  }

  return {
    frequency:
      kind === 'opponent' ? CAR_AUDIO_CONFIG.opponentFrequency : CAR_AUDIO_CONFIG.enemyFrequency,
    targetGain: CAR_AUDIO_CONFIG.baseGain,
  };
}
