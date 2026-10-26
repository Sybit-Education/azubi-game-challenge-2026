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

    // Oszillator-Sound (wie zuvor)
    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();
    const panner = this.audioContext.createPanner();

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

    // White Noise Component
    const bufferSize = this.audioContext.sampleRate * CAR_AUDIO_CONFIG.crashDurationSeconds;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(CAR_AUDIO_CONFIG.crashNoiseFilterFrequency, now);

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(
      CAR_AUDIO_CONFIG.crashNoiseGain,
      now + CAR_AUDIO_CONFIG.crashAttackSeconds,
    );
    noiseGain.gain.linearRampToValueAtTime(0, endTime);

    const noisePanner = this.audioContext.createPanner();
    noisePanner.panningModel = 'HRTF';
    noisePanner.distanceModel = 'linear';
    noisePanner.refDistance = 1;
    noisePanner.maxDistance = CAR_AUDIO_CONFIG.maxLongitudinalUnits;
    noisePanner.rolloffFactor = 1;
    noisePanner.positionX.setValueAtTime(x, now);
    noisePanner.positionY.setValueAtTime(y, now);
    noisePanner.positionZ.setValueAtTime(z, now);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(noisePanner);
    noisePanner.connect(this.destination);

    // Impact objects
    const impact = { oscillator, filter, gain, panner, noiseSource, noiseGain, noisePanner };

    oscillator.onended = () => this.disconnectImpact(impact);

    this.activeImpacts.add(impact);
    oscillator.start(now);
    oscillator.stop(endTime);
    noiseSource.start(now);
    noiseSource.stop(endTime);
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
