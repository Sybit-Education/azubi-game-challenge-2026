import menuClickUrl from './menuclick.mp3?url';
import menuFocusUrl from './menu-focus.ogg?url';
import collectCoinUrl from './collect-coin.mp3?url';

// Phaser prefixes relative URLs with its loader baseURL. A complete URL prevents
// two leading slashes from turning a local asset into a request to another host.
const audioUrl = (url) => new URL(url, document.baseURI).href;

export function preloadGameplaySounds(scene) {
  if (!scene.cache.audio.exists('collect-coin')) {
    scene.load.audio('collect-coin', audioUrl(collectCoinUrl));
  }
}

export function preloadMenuSounds(scene) {
  if (!scene.cache.audio.exists('menu-click')) {
    scene.load.audio('menu-click', audioUrl(menuClickUrl));
  }
  if (!scene.cache.audio.exists('menu-focus')) {
    scene.load.audio('menu-focus', audioUrl(menuFocusUrl));
  }
}

export function playMenuClick(scene) {
  if (!scene.cache.audio.exists('menu-click')) return;
  // Sounds belong to the game sound manager, so a scene change won't cut off a click.
  scene.sound.play('menu-click', { volume: 0.3 });
}

export function bindMenuFocusSounds(scene, elementIds) {
  const elements = elementIds.map((id) => document.getElementById(id));
  let lastFocusSound = -Infinity;
  const playFocus = () => {
    if (performance.now() - lastFocusSound < 80) return;
    lastFocusSound = performance.now();
    // Don't queue initial focus announcements before the first user interaction.
    if (!scene.sound.locked && scene.cache.audio.exists('menu-focus')) {
      scene.sound.play('menu-focus', { volume: 0.12 });
    }
  };
  for (const element of elements) element.addEventListener('focus', playFocus);
  const buttons = scene.children.list.filter(
    (object) => object.input && (object.type === 'Image' || object.type === 'Text'),
  );
  for (const button of buttons) button.on('pointerover', playFocus);
  scene.events.once('shutdown', () => {
    for (const element of elements) element.removeEventListener('focus', playFocus);
    for (const button of buttons) button.off('pointerover', playFocus);
  });
}
