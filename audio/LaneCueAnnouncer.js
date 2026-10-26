import { LANE_CUE_CONFIG } from './laneCueConfig.js';

const LANE_NAMES = Object.freeze(['one', 'two', 'three', 'four']);

export class LaneCueAnnouncer {
  constructor({ audioContext, destination, speechSynthesis, Utterance }) {
    this.audioContext = audioContext;
    this.destination = destination;
    this.speechSynthesis = speechSynthesis;
    this.Utterance = Utterance;
    this.activeCues = new Set();
    this.pendingUtterance = null;
    this.englishVoice = this.selectEnglishVoice();
    this.handleVoicesChanged = () => {
      this.englishVoice = this.selectEnglishVoice();
    };
    this.speechSynthesis?.addEventListener?.('voiceschanged', this.handleVoicesChanged);
  }

  announce(laneIndex) {
    const safeLaneIndex = Math.min(LANE_CUE_CONFIG.laneCount - 1, Math.max(0, laneIndex));
    const now = this.audioContext.currentTime;
    const endTime = now + LANE_CUE_CONFIG.laneCueDurationSeconds;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const cue = { oscillator, gain };

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(LANE_CUE_CONFIG.laneCueFrequencies[safeLaneIndex], now);
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

    if (this.speechSynthesis && this.Utterance) {
      this.cancelSpeech();
      const hasEnglishVoice = Boolean(this.englishVoice);
      const utterance = new this.Utterance(
        hasEnglishVoice ? `Lane ${LANE_NAMES[safeLaneIndex]}` : `Lehn ${LANE_NAMES[safeLaneIndex]}`,
      );
      utterance.voice = this.englishVoice;
      utterance.lang = this.englishVoice?.lang ?? 'de-DE';
      utterance.rate = 1.1;
      utterance.volume = 0.75;
      utterance.onend = () => this.finishSpeech(utterance);
      utterance.onerror = () => this.finishSpeech(utterance);
      this.pendingUtterance = utterance;
      this.speechSynthesis.speak(utterance);
    }
  }

  selectEnglishVoice() {
    const voices = this.speechSynthesis?.getVoices?.() ?? [];

    return (
      voices.find(({ lang }) => lang?.toLowerCase() === 'en-us') ??
      voices.find(({ lang }) => lang?.toLowerCase().startsWith('en')) ??
      null
    );
  }

  finishSpeech(utterance) {
    if (this.pendingUtterance === utterance) {
      this.pendingUtterance = null;
    }
  }

  cancelSpeech() {
    if (!this.pendingUtterance) return;

    this.speechSynthesis?.cancel?.();
    this.pendingUtterance = null;
  }

  disconnectCue(cue) {
    if (!this.activeCues.delete(cue)) return;

    cue.oscillator.disconnect();
    cue.gain.disconnect();
  }

  silence() {
    this.cancelSpeech();

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
    this.speechSynthesis?.removeEventListener?.('voiceschanged', this.handleVoicesChanged);
  }
}
