const KEEP_AWAKE_LEVEL = 0.001;

/**
 * Starts or reuses a low-level DC source to avoid digital silence at the output.
 * The source bypasses game mute and volume controls and lasts until the context
 * closes. A suspended context starts rendering it when resumed. Whether this
 * prevents output-device sleep depends on the device and audio processing.
 *
 * @param {{ context?: AudioContext } | null | undefined} soundManager - Manager owning the audio context.
 * @returns {ConstantSourceNode | null} The shared source, or null without ConstantSource support.
 */
export function keepAudioOutputAwake(soundManager) {
  const context = soundManager?.context;
  if (!context || typeof context.createConstantSource !== 'function') return null;
  if (context.__keepAwakeSource) return context.__keepAwakeSource;

  const source = context.createConstantSource();
  source.offset.value = KEEP_AWAKE_LEVEL;
  source.connect(context.destination);
  source.start();
  context.__keepAwakeSource = source;
  return source;
}
