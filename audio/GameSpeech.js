export default class GameSpeech {
  constructor({
    speechSynthesis = globalThis.speechSynthesis,
    Utterance = globalThis.SpeechSynthesisUtterance,
  } = {}) {
    this.synthesis = speechSynthesis;
    this.Utterance = Utterance;
    this.current = null;
    this.pending = new Map();
    this.voice = this.selectVoice();
    this.handleVoicesChanged = () => {
      this.voice = this.selectVoice();
    };
    this.synthesis?.addEventListener?.('voiceschanged', this.handleVoicesChanged);
  }

  get available() {
    return Boolean(this.synthesis && this.Utterance);
  }

  selectVoice() {
    const voices = this.synthesis?.getVoices?.() ?? [];
    return (
      voices.find(({ lang }) => lang?.toLowerCase() === 'en-us') ??
      voices.find(({ lang }) => lang?.toLowerCase().startsWith('en')) ??
      null
    );
  }

  speak(text, { key, interrupt = false }) {
    if (!this.available) return;

    if (this.current && !interrupt) {
      // Keep only the latest balance instead of building a queue of stale amounts.
      this.pending.set(key, text);
      return;
    }

    if (this.current) {
      if (this.current.key !== key && !this.pending.has(this.current.key)) {
        this.pending.set(this.current.key, this.current.text);
      }
      this.cancelCurrent();
    }
    this.pending.delete(key);
    this.start(key, text);
  }

  start(key, text) {
    const utterance = new this.Utterance(text);
    utterance.voice = this.voice;
    utterance.lang = this.voice?.lang ?? 'en-US';
    utterance.rate = 1.1;
    utterance.volume = 0.75;
    this.current = { key, text, utterance };
    const finish = () => {
      // A cancelled utterance may report its completion after its replacement starts.
      if (this.current?.utterance !== utterance) return;
      this.current = null;
      this.playNext();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    this.synthesis.speak(utterance);
  }

  playNext() {
    const next = this.pending.entries().next();
    if (next.done) return;
    const [key, text] = next.value;
    this.pending.delete(key);
    this.start(key, text);
  }

  cancelCurrent() {
    if (!this.current) return;
    this.current = null;
    this.synthesis.cancel();
  }

  cancel(key) {
    this.pending.delete(key);
    if (this.current?.key !== key) return;
    this.cancelCurrent();
    this.playNext();
  }

  silence() {
    this.pending.clear();
    this.cancelCurrent();
  }

  destroy() {
    this.silence();
    this.synthesis?.removeEventListener?.('voiceschanged', this.handleVoicesChanged);
  }
}
