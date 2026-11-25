const STORAGE_KEY = 'sybitkart:settings';

export const DEFAULT_SETTINGS = Object.freeze({
  accessibilityMode: false,
  gameMode: 'standard', // 'standard' | 'christmas'
  vibration: 'full', // 'full' | 'reduced' (highlights only) | 'off'
});

export const VIBRATION_LEVELS = Object.freeze(['full', 'reduced', 'off']);

function isValidGameMode(value) {
  return value === 'standard' || value === 'christmas';
}

function isValidVibration(value) {
  return VIBRATION_LEVELS.includes(value);
}

function normalizeSettings(settings) {
  const normalized = {
    accessibilityMode:
      typeof settings?.accessibilityMode === 'boolean'
        ? settings.accessibilityMode
        : DEFAULT_SETTINGS.accessibilityMode,
    gameMode: isValidGameMode(settings?.gameMode) ? settings.gameMode : DEFAULT_SETTINGS.gameMode,
    vibration: isValidVibration(settings?.vibration)
      ? settings.vibration
      : DEFAULT_SETTINGS.vibration,
  };

  return normalized;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return normalizeSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  const normalized = normalizeSettings(settings);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function setSetting(key, value) {
  const current = loadSettings();
  const next = saveSettings({ ...current, [key]: value });
  return next;
}
