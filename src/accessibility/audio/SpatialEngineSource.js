import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';

export class SpatialEngineSource {
  constructor(
    audioContext,
    destination,
    frequency,
    { targetGain = CAR_AUDIO_CONFIG.baseGain } = {},
  ) {
    this.audioContext = audioContext;
    this.targetGain = targetGain;
    this.destroyed = false;
    this.audible = false;
    this.disconnected = false;
    this.fadeInStartTime = null;

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
    this.oscillator.onended = () => this.disconnectNodes();
    this.oscillator.start();
  }

  setPosition({ x, y, z }) {
    if (this.destroyed) return;

    const now = this.audioContext.currentTime;
    const smoothing = CAR_AUDIO_CONFIG.smoothingSeconds;

    this.panner.positionX.setTargetAtTime(x, now, smoothing);
    this.panner.positionY.setTargetAtTime(y, now, smoothing);
    this.panner.positionZ.setTargetAtTime(z, now, smoothing);

    if (!this.audible) {
      this.audible = true;
      this.fadeInStartTime = now;
      this.setGainAt(0, now);
      this.gain.gain.linearRampToValueAtTime(this.targetGain, now + CAR_AUDIO_CONFIG.fadeInSeconds);
    }
  }

  setFrequency(frequency) {
    if (this.destroyed) return;

    this.oscillator.frequency.setTargetAtTime(
      frequency,
      this.audioContext.currentTime,
      CAR_AUDIO_CONFIG.frequencySmoothingSeconds,
    );
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    const now = this.audioContext.currentTime;
    const stopTime = now + CAR_AUDIO_CONFIG.fadeOutSeconds;
    const currentGain = this.getCurrentGain(now);

    this.setGainAt(currentGain, now);
    this.gain.gain.linearRampToValueAtTime(0, stopTime);
    this.oscillator.stop(stopTime);
  }

  getCurrentGain(time) {
    if (!this.audible || this.fadeInStartTime === null) return 0;

    const fadeProgress = Math.min(
      1,
      Math.max(0, (time - this.fadeInStartTime) / CAR_AUDIO_CONFIG.fadeInSeconds),
    );

    return this.targetGain * fadeProgress;
  }

  setGainAt(value, time) {
    this.gain.gain.cancelScheduledValues(time);
    this.gain.gain.setValueAtTime(value, time);
  }

  disconnectNodes() {
    if (this.disconnected) return;

    this.disconnected = true;
    this.oscillator.disconnect();
    this.filter.disconnect();
    this.gain.disconnect();
    this.panner.disconnect();
  }
}
