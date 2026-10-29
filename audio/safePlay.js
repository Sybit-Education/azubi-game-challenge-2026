/**
 * Small helper to make SFX playback more robust:
 * - no-op if sound is locked (before first user gesture)
 * - no-op if the audio key is not in cache
 * - optional cooldown to prevent spamming the same SFX too frequently
 *
 * Usage:
 *   safePlay(this, 'menu-click', { volume: 0.3, cooldownMs: 80 })
 */
export function safePlay(scene, key, config = {}) {
  const { cooldownMs = 0, ...playConfig } = config;

  if (!scene || !scene.sound) return false;

  // Try to unlock/resume audio on first playback attempt.
  // Some browsers report `locked=false` but the AudioContext is still suspended.
  const ctx = scene.sound.context;
  if (ctx && ctx.state === 'suspended' && typeof ctx.resume === 'function') {
    // Fire-and-forget; resume may require a user gesture.
    ctx.resume().catch(() => {});
  }

  if (scene.sound.locked) return false;
  if (ctx && ctx.state === 'suspended') return false;

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
