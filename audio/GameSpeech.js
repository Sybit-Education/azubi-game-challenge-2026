export default class GameSpeech {
  constructor({
    speechSynthesis = globalThis.speechSynthesis,
    Utterance = globalThis.SpeechSynthesisUtterance,
  } = {}) {
    this.synthesis = speechSynthesis;
    this.Utterance = Utterance;
    this.current = null;
    this.pending = [];
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

  speak(text, { key, interrupt = false, isValid = null }) {
    if (!this.available || (isValid && !isValid())) return;

    if (this.current && !interrupt) {
      // Keep only the latest message of each kind, such as coins or items.
      this.savePending(key, text, isValid);
      return;
    }

    if (this.current) {
      if (
        this.current.key !== key &&
        !this.pending.some((message) => message.key === this.current.key)
      ) {
        this.savePending(this.current.key, this.current.text, this.current.isValid);
      }
      this.cancelCurrent();
    }
    this.removePending(key);
    this.start(key, text, isValid);
  }

  start(key, text, isValid = null) {
    const utterance = new this.Utterance(text);
    utterance.voice = this.voice;
    utterance.lang = this.voice?.lang ?? 'en-US';
    utterance.rate = 1.1;
    utterance.volume = 0.75;
    this.current = { key, text, utterance, isValid };
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

  savePending(key, text, isValid) {
    const message = { key, text, isValid };
    const index = this.pending.findIndex((entry) => entry.key === key);

    // Replace an older message of the same kind without changing its queue position.
    if (index >= 0) {
      this.pending[index] = message;
    } else {
      this.pending.push(message);
    }
  }

  removePending(key) {
    this.pending = this.pending.filter((message) => message.key !== key);
  }

  playNext() {
    while (this.pending.length > 0) {
      const message = this.pending.shift();
      // A box may have been collected while a lane announcement was speaking.
      if (message.isValid && !message.isValid()) continue;
      this.start(message.key, message.text, message.isValid);
      return;
    }
  }

  cancelCurrent() {
    if (!this.current) return;
    this.current = null;
    this.synthesis.cancel();
  }

  cancel(key) {
    this.removePending(key);
    if (this.current?.key !== key) return;
    this.cancelCurrent();
    this.playNext();
  }

  silence() {
    this.pending = [];
    this.cancelCurrent();
  }

  destroy() {
    this.silence();
    this.synthesis?.removeEventListener?.('voiceschanged', this.handleVoicesChanged);
  }
}
