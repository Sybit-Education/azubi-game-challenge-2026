import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';

export class SpatialEngineSource {
  constructor(audioContext, destination, frequency) {
    this.audioContext = audioContext;
    this.destroyed = false;

    this.oscillator = audioContext.createOscillator();
    this.filter = audioContext.createBiquadFilter();
    this.gain = audioContext.createGain();
    this.panner = audioContext.createPanner();

    this.oscillator.type = 'sawtooth';
    this.oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(240, audioContext.currentTime);

    this.gain.gain.setValueAtTime(0, audioContext.currentTime);

    this.panner.panningModel = 'HRTF';
    this.panner.distanceModel = 'linear';
    this.panner.refDistance = 1;
    this.panner.maxDistance = CAR_AUDIO_CONFIG.maxLongitudinalUnits;
    this.panner.rolloffFactor = 1;

    this.oscillator.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.panner);
    this.panner.connect(destination);
    this.oscillator.start();
  }

  setPosition({ x, y, z }) {
    if (this.destroyed) return;

    const now = this.audioContext.currentTime;
    const smoothing = CAR_AUDIO_CONFIG.smoothingSeconds;

    this.panner.positionX.setTargetAtTime(x, now, smoothing);
    this.panner.positionY.setTargetAtTime(y, now, smoothing);
    this.panner.positionZ.setTargetAtTime(z, now, smoothing);
    this.gain.gain.setTargetAtTime(CAR_AUDIO_CONFIG.baseGain, now, smoothing);
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    this.oscillator.stop();
    this.oscillator.disconnect();
    this.filter.disconnect();
    this.gain.disconnect();
    this.panner.disconnect();
  }
}
