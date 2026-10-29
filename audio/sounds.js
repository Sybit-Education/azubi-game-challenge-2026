import menuClickUrl from './menu/menuclick.mp3?url';
import menuFocusUrl from './menu/menu-focus.ogg?url';
import typingClick1Url from './menu/typing-click-1.wav?url';
import typingClick2Url from './menu/typing-click-2.wav?url';
import typingClick3Url from './menu/typing-click-3.wav?url';
import typingClick4Url from './menu/typing-click-4.wav?url';
import christmasModeSound from './menu/christmas-whoosh.mp3?url';
import secondChristmasSound from './menu/winter-wind.mp3?url';
import normalMenuMusicUrl from './music/normalMenu.mp3?url';
import christmasMenuMusicUrl from './music/christmasMenu.mp3?url';
import christmasGameplayMusicUrl from './music/christmasGameplay.mp3?url';
import normalGameplayMusicUrl from './music/normal-gameplay.mp3?url';
import collectCoinUrl from './gameplay/collect-coin.mp3?url';
import collectExtraLifeUrl from './gameplay/collect-extra-life.mp3?url';
import coinMultiplierPickedUpUrl from './gameplay/coin-multiplier-picked-up.mp3?url';
import restoreSizeUrl from './gameplay/restore-size.mp3?url';
import collectMagnetUrl from './gameplay/collect-magnet.wav?url';
import shieldCollectedUrl from './gameplay/shield-collected.mp3?url';
import shieldOverUrl from './gameplay/shield-over.mp3?url';

import countdownUrl from './gameplay/countdown.mp3?url';
import sensorBeepUrl from './gameplay/sensor-beep.wav?url';
import carPassByUrl from './gameplay/car-pass-by-spatial.wav?url';
import carPassByJohnnyUrl from './gameplay/car-pass-by-johnnyfarmer-spatial.wav?url';
import carPassByHighwayUrl from './gameplay/car-pass-by-961-studios-spatial.wav?url';
import changeSizeUrl from './gameplay/change-size.wav?url';
import collisionHitUrl from './gameplay/collision-hit.wav?url';
import collisionImpactUrl from './gameplay/collision-impact.mp3?url';
import collisionBangUrl from './gameplay/collision-bang.mp3?url';
import roadEdgeHitUrl from './gameplay/road-edge-hit.wav?url';
import roadEdgeScrapeUrl from './gameplay/road-edge-scrape.wav?url';
import iceWarningUrl from './gameplay/ice-warning.wav?url';
import duckQuack1Url from './gameplay/duck-quack-1.mp3?url';
import duckQuack2Url from './gameplay/duck-quack-2.mp3?url';
import duckQuack3Url from './gameplay/duck-quack-3.mp3?url';

const duckQuackSounds = [
  { key: 'duck-quack-1', url: duckQuack1Url },
  { key: 'duck-quack-2', url: duckQuack2Url },
  { key: 'duck-quack-3', url: duckQuack3Url },
];

const typingSounds = [
  { key: 'typing-click-1', url: typingClick1Url },
  { key: 'typing-click-2', url: typingClick2Url },
  { key: 'typing-click-3', url: typingClick3Url },
  { key: 'typing-click-4', url: typingClick4Url },
];

export const TYPING_SOUND_KEYS = typingSounds.map((sound) => sound.key);

export function preloadTypingSounds(scene) {
  for (const sound of typingSounds) loadSound(scene, sound.key, sound.url);
}

export const DUCK_QUACK_SOUND_KEYS = duckQuackSounds.map((sound) => sound.key);

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

export function preloadSceneMusic(scene, key) {
  if (key === 'normal-menu-music') loadSound(scene, key, normalMenuMusicUrl);
  if (key === 'christmas-menu-music') loadSound(scene, key, christmasMenuMusicUrl);
  if (key === 'christmas-gameplay-music') loadSound(scene, key, christmasGameplayMusicUrl);
  if (key === 'normal-gameplay-music') loadSound(scene, key, normalGameplayMusicUrl);
}

export function playSceneMusic(scene, key, volume) {
  const music = scene.sound.add(key, { loop: true, volume });
  const startMusic = () => music.play();

  // The first menu may open before the browser allows audio playback.
  if (scene.sound.locked) {
    scene.sound.once('unlocked', startMusic);
  } else {
    startMusic();
  }

  scene.events.once('shutdown', () => {
    scene.sound.off('unlocked', startMusic);
    music.destroy();
  });
}

export function preloadGameplaySounds(scene) {
  loadSound(scene, 'collect-coin', collectCoinUrl);
  loadSound(scene, 'collect-extra-life', collectExtraLifeUrl);
  loadSound(scene, 'coin-multiplier-picked-up', coinMultiplierPickedUpUrl);
  loadSound(scene, 'restore-size', restoreSizeUrl);
  loadSound(scene, 'collect-magnet', collectMagnetUrl);
  loadSound(scene, 'shield-collected', shieldCollectedUrl);
  loadSound(scene, 'shield-over', shieldOverUrl);
  loadSound(scene, 'car-sensor', sensorBeepUrl);
  loadSound(scene, 'car-pass-by', carPassByUrl);
  loadSound(scene, 'car-pass-by-johnnyfarmer', carPassByJohnnyUrl);
  loadSound(scene, 'car-pass-by-961-studios', carPassByHighwayUrl);
  loadSound(scene, 'change-size', changeSizeUrl);
  loadSound(scene, 'collision-hit', collisionHitUrl);
  loadSound(scene, 'collision-impact', collisionImpactUrl);
  loadSound(scene, 'collision-bang', collisionBangUrl);
  loadSound(scene, 'road-edge-hit', roadEdgeHitUrl);
  loadSound(scene, 'road-edge-scrape', roadEdgeScrapeUrl);
  loadSound(scene, 'ice-warning', iceWarningUrl);
  for (const sound of duckQuackSounds) {
    loadSound(scene, sound.key, sound.url);
  }
}

export function preloadMenuSounds(scene) {
  loadSound(scene, 'menu-click', menuClickUrl);
  loadSound(scene, 'menu-focus', menuFocusUrl);
  loadSound(scene, 'christmas-whoosh', christmasModeSound);
  loadSound(scene, 'winter-wind', secondChristmasSound);
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
