import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';

/**
 * Synthetischer Schleif-/Reibungs-Sound für den Straßenrand.
 * Spielt nur fuer Spieler 1, ansonsten bleibt er stumm.
 */
export class ScrapeSoundPlayer {
  constructor(audioContext, destination) {
    this.ctx = audioContext;
    this.destination = destination;
    this.active = false;
    this.osc = null;
    this.filter = null;
    this.gain = null;
    this.panner = null;
    this.lastPan = 0;
  }

  /**
   * Startet Schleifton an der gewünschten Straßenrandseite (pan: -1 = links, 1 = rechts).
   */
  start(pan = 0) {
    if (this.active) {
      this.setPan(pan);
      return;
    }
    this.active = true;

    this.osc = this.ctx.createOscillator();
    this.filter = this.ctx.createBiquadFilter();
    this.gain = this.ctx.createGain();
    this.panner = this.ctx.createStereoPanner();

    this.osc.type = 'triangle';
    this.osc.frequency.value = CAR_AUDIO_CONFIG.scrapeFrequency;
    this.filter.type = 'highpass';
    this.filter.frequency.value = CAR_AUDIO_CONFIG.scrapeFilterFrequency;
    this.gain.gain.value = 0.0;
    this.panner.pan.value = pan * CAR_AUDIO_CONFIG.scrapePanAmount;
    this.lastPan = pan;

    this.osc.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.panner);
    this.panner.connect(this.destination);

    this.osc.start();

    // Sanftes Einblenden
    this.gain.gain.linearRampToValueAtTime(
      CAR_AUDIO_CONFIG.scrapeGain,
      this.ctx.currentTime + CAR_AUDIO_CONFIG.fadeInSeconds,
    );
  }

  /**
   * Beendet Schleifton mit Ausblenden.
   */
  stop() {
    if (!this.active) return;
    this.active = false;
    const now = this.ctx.currentTime;
    this.gain.gain.linearRampToValueAtTime(0, now + CAR_AUDIO_CONFIG.fadeOutSeconds);
    this.osc.stop(now + CAR_AUDIO_CONFIG.fadeOutSeconds);
    this.osc.onended = () => this.cleanup();
  }

  /**
   * Aktualisiere Stereopan, z.B. bei Spurwechsel.
   */
  setPan(pan = 0) {
    if (!this.active || !this.panner) return;
    if (pan === this.lastPan) return;
    this.panner.pan.linearRampToValueAtTime(
      pan * CAR_AUDIO_CONFIG.scrapePanAmount,
      this.ctx.currentTime + 0.03,
    );
    this.lastPan = pan;
  }

  cleanup() {
    try {
      this.osc?.disconnect();
      this.filter?.disconnect();
      this.gain?.disconnect();
      this.panner?.disconnect();
    } catch {
      // ignore disconnect errors during teardown
    }
    this.osc = this.filter = this.gain = this.panner = null;
  }

  /**
   * Unbedingt aufräumen beim Szenenende.
   */
  destroy() {
    this.stop();
    this.cleanup();
  }
}
