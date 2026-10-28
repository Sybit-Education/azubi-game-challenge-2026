import { LANE_CUE_CONFIG } from './laneCueConfig.js';
import GameSpeech from './GameSpeech.js';

const LANE_NAMES = Object.freeze(['one', 'two', 'three', 'four']);

export class LaneCueAnnouncer {
  constructor({ audioContext, destination, speechSynthesis, Utterance, speech }) {
    this.audioContext = audioContext;
    this.destination = destination;
    this.ownsSpeech = !speech;
    this.speech = speech ?? new GameSpeech({ speechSynthesis, Utterance });
    this.activeCues = new Set();
  }

  announce(laneIndex) {
    const safeLaneIndex = Math.min(LANE_CUE_CONFIG.laneCount - 1, Math.max(0, laneIndex));
    this.playTone(safeLaneIndex);
    this.speech.speak(`Lane ${LANE_NAMES[safeLaneIndex]}`, { key: 'lane', interrupt: true });
  }

  playTone(laneIndex) {
    if (!this.audioContext || !this.destination) return;
    const now = this.audioContext.currentTime;
    const endTime = now + LANE_CUE_CONFIG.laneCueDurationSeconds;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const cue = { oscillator, gain };

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(LANE_CUE_CONFIG.laneCueFrequencies[laneIndex], now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(
      LANE_CUE_CONFIG.laneCueGain,
      now + LANE_CUE_CONFIG.laneCueAttackSeconds,
    );
    gain.gain.linearRampToValueAtTime(0, endTime);

    oscillator.connect(gain);
    gain.connect(this.destination);
    oscillator.onended = () => this.disconnectCue(cue);
    this.activeCues.add(cue);
    oscillator.start(now);
    oscillator.stop(endTime);
  }

  disconnectCue(cue) {
    if (!this.activeCues.delete(cue)) return;

    cue.oscillator.disconnect();
    cue.gain.disconnect();
  }

  silence() {
    this.speech.cancel('lane');

    for (const cue of this.activeCues) {
      cue.oscillator.onended = null;
      cue.oscillator.stop();
      cue.oscillator.disconnect();
      cue.gain.disconnect();
    }

    this.activeCues.clear();
  }

  destroy() {
    this.silence();
    if (this.ownsSpeech) this.speech.destroy();
  }
}
