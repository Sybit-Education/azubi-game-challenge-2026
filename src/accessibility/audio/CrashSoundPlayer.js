import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';

export class CrashSoundPlayer {
  constructor(audioContext, destination) {
    this.audioContext = audioContext;
    this.destination = destination;
    this.activeImpacts = new Set();
    this.destroyed = false;
  }

  play({ x, y, z }) {
    if (this.destroyed) return;

    const now = this.audioContext.currentTime;
    const endTime = now + CAR_AUDIO_CONFIG.crashDurationSeconds;
    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();
    const panner = this.audioContext.createPanner();
    const impact = { oscillator, filter, gain, panner };

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(CAR_AUDIO_CONFIG.crashStartFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(CAR_AUDIO_CONFIG.crashEndFrequency, endTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(CAR_AUDIO_CONFIG.crashFilterFrequency, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(
      CAR_AUDIO_CONFIG.crashGain,
      now + CAR_AUDIO_CONFIG.crashAttackSeconds,
    );
    gain.gain.linearRampToValueAtTime(0, endTime);

    panner.panningModel = 'HRTF';
    panner.distanceModel = 'linear';
    panner.refDistance = 1;
    panner.maxDistance = CAR_AUDIO_CONFIG.maxLongitudinalUnits;
    panner.rolloffFactor = 1;
    panner.positionX.setValueAtTime(x, now);
    panner.positionY.setValueAtTime(y, now);
    panner.positionZ.setValueAtTime(z, now);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.destination);
    oscillator.onended = () => this.disconnectImpact(impact);
    this.activeImpacts.add(impact);
    oscillator.start(now);
    oscillator.stop(endTime);
  }

  disconnectImpact(impact) {
    if (!this.activeImpacts.delete(impact)) return;

    impact.oscillator.disconnect();
    impact.filter.disconnect();
    impact.gain.disconnect();
    impact.panner.disconnect();
  }

  destroy() {
    this.destroyed = true;
  }
}
