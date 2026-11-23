import { safePlay } from '../../audio/safePlay.js';
import { LaneCueAnnouncer } from '../../audio/LaneCueAnnouncer.js';
import { playMenuClick } from '../../audio/sounds.js';

const LANE_COUNT = 4;

// A sound example is a button label plus a function that plays it.
// "context" holds the running GameScene and the lane cue announcer.
const soundFile = (label, key, volume = 0.3) => ({
  label,
  play: ({ scene }) => safePlay(scene, key, { volume }),
});

const spoken = (label, text) => ({
  label,
  play: ({ scene }) => scene.speech.speak(text, { key: 'how-to-play', interrupt: true }),
});

const laneCue = (lane) => ({
  label: `Lane ${lane + 1}`,
  play: ({ laneCues }) => laneCues.announce(lane),
});

// Steps with "accessibilityOnly" are skipped unless accessibility mode is on.
const STEPS = [
  {
    title: 'Welcome to the practice drive',
    text: 'Nothing is saved here, and a crash does not end the practice. Use Next to learn the basics.',
  },
  {
    title: 'Steering',
    text: 'Use W, A, S and D to drive. Player 2 uses the arrow keys. Try all four directions.',
  },
  {
    title: 'Coins',
    text: 'Drive over coins to collect points. Every coin is worth 50 points.',
    sounds: [soundFile('Coin collected', 'collect-coin')],
  },
  {
    title: 'Other cars',
    text: 'Stay away from other cars. In a real race, a crash ends the game. Here you only hear it.',
    sounds: [
      soundFile('Crash', 'collision-hit'),
      soundFile('Crash bang', 'collision-bang'),
      soundFile('Crash impact', 'collision-impact'),
    ],
    accessibilityOnly: true,
  },
  {
    title: 'Parking sensor',
    text: 'A beep warns you about cars close to you. The faster the beeps, the closer the danger. The sound comes from the left or the right, where the car is.',
    sounds: [soundFile('Sensor beep', 'car-sensor', 0.18)],
    accessibilityOnly: true,
  },
  {
    title: 'Lanes',
    text: 'The road has four lanes. Whenever you change lanes you hear a tone and a spoken lane number. Left lanes sound lower, right lanes sound higher.',
    sounds: Array.from({ length: LANE_COUNT }, (_, lane) => laneCue(lane)),
    accessibilityOnly: true,
  },
  {
    title: 'Road edge',
    text: 'You hear a sound when you touch the left or right edge of the road.',
    sounds: [
      soundFile('Edge hit', 'road-edge-hit', 0.25),
      soundFile('Edge scrape', 'road-edge-scrape', 0.2),
    ],
    accessibilityOnly: true,
  },
  {
    title: 'Coin count and mystery boxes',
    text: 'The game announces your coins every five coins. It also warns you about a mystery box before you reach it.',
    sounds: [spoken('Coin count', '10 coins'), spoken('Mystery box', 'Mystery box, lane 2')],
    accessibilityOnly: true,
  },
  {
    title: 'Ice warning',
    text: 'A warning sound tells you that ice is coming.',
    sounds: [soundFile('Ice warning', 'ice-warning')],
    accessibilityOnly: true,
  },
  {
    title: 'Ready for a real race?',
    text: 'Choose Repeat practice to drive again, or go back to the main menu and press play.',
    final: true,
  },
];

export function bindHowToPlay(scene) {
  const ui = document.getElementById('how-to-play-ui');
  const progress = document.getElementById('how-to-play-progress');
  const title = document.getElementById('how-to-play-title');
  const text = document.getElementById('how-to-play-text');
  const soundsBox = document.getElementById('how-to-play-sounds');
  const soundList = document.getElementById('how-to-play-sound-list');
  const back = document.getElementById('how-to-play-back');
  const next = document.getElementById('how-to-play-next');
  const repeat = document.getElementById('how-to-play-repeat');
  const exit = document.getElementById('how-to-play-exit');

  const accessibilityEnabled = scene.registry.get('accessibility enabled') === true;
  const steps = STEPS.filter((step) => accessibilityEnabled || !step.accessibilityOnly);
  const laneCues = new LaneCueAnnouncer({
    audioContext: scene.sound.context,
    destination: scene.sound.destination,
    speech: scene.speech,
  });
  const context = { scene, laneCues };
  let index = 0;
  let leaving = false;

  const render = (moveFocus) => {
    const step = steps[index];
    progress.textContent = `Step ${index + 1} of ${steps.length}`;
    title.textContent = step.title;
    text.textContent = step.text;

    // Sound examples exist only in accessibility mode.
    const sounds = accessibilityEnabled ? (step.sounds ?? []) : [];
    soundsBox.hidden = sounds.length === 0;
    soundList.replaceChildren(
      ...sounds.map((sound) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = sound.label;
        button.addEventListener('click', () => sound.play(context));
        return button;
      }),
    );

    back.disabled = index === 0;
    next.hidden = Boolean(step.final);
    repeat.hidden = !step.final;
    if (moveFocus) title.focus({ preventScroll: true });
  };

  const goTo = (newIndex) => {
    index = Math.min(steps.length - 1, Math.max(0, newIndex));
    render(true);
  };

  const leave = (sceneKey, data) => {
    if (leaving) return;
    leaving = true;
    playMenuClick(scene);
    scene.scene.start(sceneKey, data);
  };

  const onBack = () => goTo(index - 1);
  const onNext = () => goTo(index + 1);
  const onRepeat = () => leave('GameScene', { isMultiplayer: false, isTestGame: true });
  const onExit = () =>
    leave(scene.registry.get('gameMode') === 'christmas' ? 'ChristmasScene' : 'MenuScene', {
      focusTarget: 'how-to-play',
    });
  const onEscape = (event) => {
    if (event.key === 'Escape') onExit();
  };
  // Phaser captures Enter and Space for the game; keep them working on the panel's buttons.
  const keepEnterAndSpace = (event) => {
    if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
  };

  back.addEventListener('click', onBack);
  next.addEventListener('click', onNext);
  repeat.addEventListener('click', onRepeat);
  exit.addEventListener('click', onExit);
  document.addEventListener('keydown', onEscape);
  ui.addEventListener('keydown', keepEnterAndSpace);
  ui.addEventListener('keyup', keepEnterAndSpace);

  ui.hidden = false;
  // Screen reader users hear the first step right away; everyone else keeps the game focus.
  render(accessibilityEnabled);

  scene.events.once('shutdown', () => {
    back.removeEventListener('click', onBack);
    next.removeEventListener('click', onNext);
    repeat.removeEventListener('click', onRepeat);
    exit.removeEventListener('click', onExit);
    document.removeEventListener('keydown', onEscape);
    ui.removeEventListener('keydown', keepEnterAndSpace);
    ui.removeEventListener('keyup', keepEnterAndSpace);
    laneCues.silence();
    soundList.replaceChildren();
    ui.hidden = true;
  });
}
