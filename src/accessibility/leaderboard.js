import { positionAccessibleControls } from './positionControls.js';
import { preserveNativeKeyboard } from './nativeKeyboard.js';
import { bindMenuFocusSounds } from '../../audio/sounds.js';

export function bindLeaderboardControls(scene, entries, focusTarget) {
  const layer = document.getElementById('leaderboard-ui');
  const rows = document.getElementById('leaderboard-entries');
  const home = document.getElementById('leaderboard-home');
  rows.replaceChildren();

  if (entries.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = 'No entries yet';
    row.append(cell);
    rows.append(row);
  }

  entries.forEach((entry, index) => {
    const row = document.createElement('tr');
    const displayName = entry.isTampered ? `${entry.name} ⚠ manipuliert` : entry.name;
    [index + 1, displayName, `${entry.distance} km`].forEach((value) => {
      const cell = document.createElement('td');
      // Player names come from storage; insert them as text, never HTML.
      cell.textContent = String(value);
      row.append(cell);
    });
    rows.append(row);
  });

  const goHome = () => scene.goHome();
  const handleEscape = (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    goHome();
  };

  home.addEventListener('click', goHome);
  layer.addEventListener('keydown', handleEscape);
  preserveNativeKeyboard(scene, layer);
  layer.hidden = false;
  positionAccessibleControls(scene, [[home, scene.backButton]]);
  bindMenuFocusSounds(scene, ['leaderboard-home']);
  document.getElementById(focusTarget ?? 'leaderboard-title').focus();

  scene.events.once('shutdown', () => {
    home.removeEventListener('click', goHome);
    layer.removeEventListener('keydown', handleEscape);
    layer.hidden = true;
    rows.replaceChildren();
  });
}
