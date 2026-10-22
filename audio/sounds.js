import menuClickUrl from './menu/menuclick.mp3?url';
import menuFocusUrl from './menu/menu-focus.ogg?url';
import collectCoinUrl from './gameplay/collect-coin.mp3?url';
import collectExtraLifeUrl from './gameplay/collect-extra-life.mp3?url';
import countdownUrl from './gameplay/countdown.mp3?url';
import sensorBeepUrl from './gameplay/sensor-beep.wav?url';
import carPassByUrl from './gameplay/car-pass-by-spatial.wav?url';
import carPassByJohnnyUrl from './gameplay/car-pass-by-johnnyfarmer-spatial.wav?url';
import carPassByHighwayUrl from './gameplay/car-pass-by-961-studios-spatial.wav?url';
import plantGrowUrl from './gameplay/plant-grow.wav?url';
import collisionHitUrl from './gameplay/collision-hit.wav?url';
import collisionImpactUrl from './gameplay/collision-impact.mp3?url';
import collisionBangUrl from './gameplay/collision-bang.mp3?url';
import roadEdgeHitUrl from './gameplay/road-edge-hit.wav?url';
import roadEdgeScrapeUrl from './gameplay/road-edge-scrape.wav?url';
import iceWarningUrl from './gameplay/ice-warning.wav?url';

function loadSound(scene, key, fileUrl) {
  if (scene.cache.audio.exists(key)) return;

  // Vite supplies an asset path. Use a complete URL so Phaser cannot prefix
  // its loader base and accidentally turn / + /audio into //audio.
  const url = new URL(fileUrl, document.baseURI).href;
  scene.load.audio(key, url);
}

export function preloadCountdownSound(scene) {
  loadSound(scene, 'countdown', countdownUrl);
}

export function preloadGameplaySounds(scene) {
  loadSound(scene, 'collect-coin', collectCoinUrl);
  loadSound(scene, 'collect-extra-life', collectExtraLifeUrl);
  loadSound(scene, 'car-sensor', sensorBeepUrl);
  loadSound(scene, 'car-pass-by', carPassByUrl);
  loadSound(scene, 'car-pass-by-johnnyfarmer', carPassByJohnnyUrl);
  loadSound(scene, 'car-pass-by-961-studios', carPassByHighwayUrl);
  loadSound(scene, 'plant-grow', plantGrowUrl);
  loadSound(scene, 'collision-hit', collisionHitUrl);
  loadSound(scene, 'collision-impact', collisionImpactUrl);
  loadSound(scene, 'collision-bang', collisionBangUrl);
  loadSound(scene, 'road-edge-hit', roadEdgeHitUrl);
  loadSound(scene, 'road-edge-scrape', roadEdgeScrapeUrl);
  loadSound(scene, 'ice-warning', iceWarningUrl);
}

export function preloadMenuSounds(scene) {
  loadSound(scene, 'menu-click', menuClickUrl);
  loadSound(scene, 'menu-focus', menuFocusUrl);
}

export function playMenuClick(scene) {
  if (!scene.cache.audio.exists('menu-click')) return;
  // Phaser's sound manager belongs to the game, so scene changes do not cut off clicks.
  scene.sound.play('menu-click', { volume: 0.3 });
}

export function bindMenuFocusSounds(scene, elementIds) {
  const elements = elementIds.map((id) => document.getElementById(id));
  let lastFocusTime = -Infinity;
  const playFocus = () => {
    // Mouse and keyboard can reach the same control in quick succession.
    // A short minimum interval prevents duplicate focus sounds.
    const now = performance.now();
    if (now - lastFocusTime < 80) return;
    lastFocusTime = now;
    // Browser audio may stay locked until the first user interaction.
    if (!scene.sound.locked && scene.cache.audio.exists('menu-focus')) {
      scene.sound.play('menu-focus', { volume: 0.12 });
    }
  };
  for (const element of elements) element.addEventListener('focus', playFocus);
  const buttons = scene.children.list.filter(
    (object) => object.input && (object.type === 'Image' || object.type === 'Text'),
  );
  for (const button of buttons) button.on('pointerover', playFocus);
  // HTML elements survive scene changes, so their listeners must be removed.
  scene.events.once('shutdown', () => {
    for (const element of elements) element.removeEventListener('focus', playFocus);
    for (const button of buttons) button.off('pointerover', playFocus);
  });
}
