import { positionAccessibleControls } from './positionControls.js';
import { preserveNativeKeyboard } from './nativeKeyboard.js';
import { bindMenuFocusSounds, playMenuClick } from '../../audio/sounds.js';

const SEARCH_PATTERN = /[^A-Z0-9]/g;

const FILTER_NAMES = { all: 'All', blinded: 'Blinded', 'non-blinded': 'Sighted' };
const SORT_NAMES = { distance: 'Distance', score: 'Score' };

export function bindLeaderboardControls(scene, entries, focusTarget, isTampered = false) {
  const layer = document.getElementById('leaderboard-ui');
  const title = document.getElementById('leaderboard-title');
  const home = document.getElementById('leaderboard-home');
  const search = document.getElementById('leaderboard-search');
  title.textContent = isTampered ? 'Leaderboard - manipuliert' : 'Leaderboard';
  renderLeaderboardEntries(entries, scene.leaderboardTable.currentSort, false);

  const rows = document.getElementById('leaderboard-entries');
  const dropdowns = [
    {
      trigger: document.getElementById('leaderboard-filter'),
      group: document.getElementById('leaderboard-filter-options'),
      label: 'Filter',
      names: FILTER_NAMES,
      dropdown: () => scene.filterDropdown,
      current: () => scene.leaderboardTable.currentFilter,
      choose: (value) => scene.changeFilter(value),
      button: () => scene.filterButton,
    },
    {
      trigger: document.getElementById('leaderboard-sort'),
      group: document.getElementById('leaderboard-sort-options'),
      label: 'Sort',
      names: SORT_NAMES,
      dropdown: () => scene.sortDropdown,
      current: () => scene.leaderboardTable.currentSort,
      choose: (value) => scene.changeSort(value),
      button: () => scene.sortButton,
    },
  ];

  const goHome = () => scene.goHome();
  const abort = new AbortController();
  const { signal } = abort;

  // Mirror the Phaser dropdown state onto the HTML controls.
  const sync = () => {
    for (const { trigger, group, label, names, dropdown, current } of dropdowns) {
      const open = dropdown().isOpen;
      const value = current();
      trigger.setAttribute('aria-expanded', String(open));
      trigger.setAttribute('aria-label', `${label}: ${names[value]}`);
      group.hidden = !open;
      for (const option of group.querySelectorAll('button')) {
        option.disabled = !open;
        option.setAttribute('aria-checked', String(option.dataset.value === value));
      }
    }
  };
  scene.syncAccessibleControls = sync;

  const handleEscape = (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    const openEntry = dropdowns.find(({ dropdown }) => dropdown().isOpen);
    if (openEntry) {
      scene.toggleDropdown(openEntry.dropdown());
      openEntry.trigger.focus();
      return;
    }
    goHome();
  };

  home.addEventListener('click', goHome, { signal });
  layer.addEventListener('keydown', handleEscape, { signal });

  for (const entry of dropdowns) {
    const options = [...entry.group.querySelectorAll('button')];
    entry.trigger.addEventListener(
      'click',
      () => {
        playMenuClick(scene);
        scene.toggleDropdown(entry.dropdown());
        // Move focus into the opened menu so screen readers announce the options.
        if (entry.dropdown().isOpen) {
          (options.find((o) => o.dataset.value === entry.current()) ?? options[0]).focus();
        }
      },
      { signal },
    );
    entry.trigger.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        if (!entry.dropdown().isOpen) scene.toggleDropdown(entry.dropdown());
        options[event.key === 'ArrowDown' ? 0 : options.length - 1].focus();
      },
      { signal },
    );
    entry.group.addEventListener(
      'keydown',
      (event) => {
        const index = options.indexOf(document.activeElement);
        const target = {
          ArrowDown: options[(index + 1) % options.length],
          ArrowUp: options[(index - 1 + options.length) % options.length],
          Home: options[0],
          End: options[options.length - 1],
        }[event.key];
        if (!target) return;
        event.preventDefault();
        target.focus();
      },
      { signal },
    );
    for (const option of options) {
      option.addEventListener(
        'click',
        () => {
          playMenuClick(scene);
          entry.choose(option.dataset.value);
          // The option disappears after choosing, so keep focus on its trigger.
          entry.trigger.focus();
        },
        { signal },
      );
    }
  }

  search.value = scene.searchQuery;
  search.addEventListener(
    'input',
    () => {
      const query = search.value.toUpperCase().replace(SEARCH_PATTERN, '').slice(0, 45);
      scene.setSearchQuery(query);
    },
    { signal },
  );

  preserveNativeKeyboard(scene, layer);
  layer.hidden = false;
  sync();
  const controls = [[home, scene.returnButton]];
  controls.push([search, scene.searchBackground]);
  for (const { trigger, button, group, dropdown } of dropdowns) {
    controls.push([trigger, button()]);
    const options = group.querySelectorAll('button');
    dropdown().items.forEach((item, index) => controls.push([options[index], item.row]));
  }
  positionAccessibleControls(scene, controls);
  bindMenuFocusSounds(scene, [
    'leaderboard-home',
    'leaderboard-search',
    ...dropdowns.flatMap(({ trigger, group }) => [
      trigger.id,
      ...[...group.querySelectorAll('button')].map((option) => option.id),
    ]),
  ]);
  document.getElementById(focusTarget ?? 'leaderboard-title').focus();

  scene.events.once('shutdown', () => {
    abort.abort();
    scene.syncAccessibleControls = null;
    layer.hidden = true;
    rows.replaceChildren();
    search.value = '';
    for (const { trigger, group } of dropdowns) {
      trigger.setAttribute('aria-expanded', 'false');
      group.hidden = true;
    }
  });
}

export function renderLeaderboardEntries(entries, sort = 'distance', announce = true) {
  const rows = document.getElementById('leaderboard-entries');
  document.getElementById('leaderboard-caption').textContent = `Top 10 by ${sort}`;
  rows.replaceChildren();
  if (entries.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No entries yet';
    row.append(cell);
    rows.append(row);
  }

  entries.forEach((entry, index) => {
    const row = document.createElement('tr');
    const name = entry.name || 'Unbekannt';
    const displayName = entry.isTampered ? `${name} ⚠ manipuliert` : name;
    const blindStatus = entry.blind === true ? 'Yes' : entry.blind === false ? 'No' : 'Unknown';
    [index + 1, displayName, `${entry.distance} km`, entry.score ?? 0, blindStatus].forEach(
      (value) => {
        const cell = document.createElement('td');
        // Player names come from storage; insert them as text, never HTML.
        cell.textContent = String(value);
        row.append(cell);
      },
    );
    rows.append(row);
  });

  if (announce) {
    document.getElementById('leaderboard-status').textContent =
      entries.length === 0
        ? 'No entries found'
        : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} shown`;
  }
}
