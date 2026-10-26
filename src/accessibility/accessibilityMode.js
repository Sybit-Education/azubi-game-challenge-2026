const ACCESSIBILITY_MODE_KEY = 'accessibilityMode';
const LEGACY_ACCESSIBILITY_MODE_KEY = 'accessibility enabled';

export function getAccessibilityMode(registry) {
  return (
    registry.get(ACCESSIBILITY_MODE_KEY) ?? registry.get(LEGACY_ACCESSIBILITY_MODE_KEY) ?? false
  );
}

export function setAccessibilityMode(registry, enabled) {
  const normalizedValue = Boolean(enabled);

  registry.set(ACCESSIBILITY_MODE_KEY, normalizedValue);
  registry.set(LEGACY_ACCESSIBILITY_MODE_KEY, normalizedValue);

  return normalizedValue;
}
