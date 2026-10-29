/**
 * Small helper to make SFX playback more robust:
 * - no-op before the first user gesture
 * - schedules sounds even while a suspended AudioContext is resuming
 * - no-op if the audio key is not in cache
 * - optional cooldown to prevent spamming the same SFX too frequently
 *
 * A true result only means the request was forwarded to Phaser, not that playback
 * succeeded or was audible. Resume failures are intentionally ignored.
 *
 * @param {import('phaser').Scene | null | undefined} scene - Scene providing the sound manager and audio cache.
 * @param {string} key - Key of a preloaded audio asset.
 * @param {import('phaser').Types.Sound.SoundConfig & { cooldownMs?: number }} [config={}] - Playback settings and optional per-scene cooldown.
 * @returns {boolean} Whether the request passed the guards and was forwarded to Phaser.
 * @example
 * safePlay(this, 'menu-click', { volume: 0.3, cooldownMs: 80 });
 */
export function safePlay(scene, key, config = {}) {
  const { cooldownMs = 0, ...playConfig } = config;

  if (!scene || !scene.sound) return false;

  const userActivation = globalThis.navigator?.userActivation;
  if (userActivation ? !userActivation.hasBeenActive : scene.sound.locked) return false;

  const ctx = scene.sound.context;
  if (ctx && ctx.state !== 'running' && typeof ctx.resume === 'function') {
    ctx.resume().catch(() => {});
  }

  if (!scene.cache?.audio?.exists?.(key)) return false;

  if (cooldownMs > 0) {
    if (!scene.__sfxCooldowns) scene.__sfxCooldowns = new Map();
    const now = performance.now();
    const last = scene.__sfxCooldowns.get(key) ?? -Infinity;
    if (now - last < cooldownMs) return false;
    scene.__sfxCooldowns.set(key, now);
  }

  scene.sound.play(key, playConfig);
  return true;
}
