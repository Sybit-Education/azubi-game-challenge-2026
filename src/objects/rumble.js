// Controller vibration mixer.
//
// Effects are played per player (1 or 2) and mixed into each physical controller's
// two motors every frame (InputManager.update() drives it), so effects blend instead of
// cutting each other off: a coin during a wall scrape, or both players on one merged
// "Joy-Con L+R" pad.
//
// Patterns are lists of steps played back to back:
//   { ms, strong, weak }   strong = deep low rumble, weak = sharp high buzz (0–1 each)
//   { ms }                 a pause
// Holds are continuous effects (wall scrape, dizziness, engine idle) that run while the game keeps
// reporting them each frame.

// Holds are sent a little longer than needed so the motors keep running until the next
// frame re-sends them (a hiccup between frames would be felt as a gap). Pattern steps
// don't need it: a timer wakes the mixer exactly at each step boundary.
const FRAME_SLACK_MS = 40;
const MAX_EFFECT_MS = 150;
// A hold keeps running this long after the game last reported it
const HOLD_GRACE_MS = 60;

// Continuous effects: motor levels `t` ms after the hold started
const HOLDS = {
  // Grinding along the wall: a hard contact spike, then grainy random texture over a
  // slow wobble, like tyres and bodywork dragging on concrete
  scrape(t, now) {
    if (t < 60) return { strong: 0.6, weak: 0.85 };
    const wobble = 0.5 + 0.5 * Math.sin(now / 45);
    return {
      strong: 0.18 + 0.14 * wobble + Math.random() * 0.14,
      weak: 0.3 + Math.random() * 0.45,
    };
  },
  // Dizzy (nausea item): deliberately off. A slow seasick swell drifts between the deep
  // and the sharp motor, two out-of-step wobbles make it beat irregularly, and now and
  // then the stomach drops with a sudden lurch.
  dizzy(t, now) {
    const fadeIn = Math.min(1, t / 250);
    const swellLevel = 0.5 + 0.5 * Math.sin(now / 260);
    const wobble = Math.sin(now / 37) * Math.sin(now / 91 + 1.3);
    const lurch = Math.sin(now / 613) * Math.sin(now / 389 + 0.7) > 0.75;
    const strong = 0.16 + 0.65 * swellLevel * Math.max(0, wobble) + (lurch ? 0.5 : 0);
    const weak = 0.1 + 0.65 * (1 - swellLevel) * Math.max(0, -wobble) + (lurch ? 0.3 : 0);
    return { strong: fadeIn * Math.min(1, strong), weak: fadeIn * Math.min(1, weak) };
  },
  // Engine idling on the starting grid: a low, lumpy burble (uneven firing like a
  // big engine with a race cam)
  idle(t, now) {
    const lope = Math.sin(now / 22) > 0.35 ? 1 : 0;
    return { strong: 0.12 + 0.1 * lope, weak: 0.03 * lope };
  },
};

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

// On a merged pad the left Joy-Con is driven by the strong (low-frequency) channel, which
// feels far heavier than the right Joy-Con's weak channel at the same value. This scales it
// down so both players' Joy-Cons feel about the same; tune by feel.
const LEFT_JOYCON_GAIN = 0.4;

// Folds a player's motor levels onto their side of the controller. A merged Joy-Con pad
// has one actuator: Chrome drives the left Joy-Con with the strong magnitude and the
// right one with the weak magnitude, so each half only uses its own channel.
function onSide(side, { strong, weak }) {
  const peak = Math.max(strong, weak);
  if (side === 'right') return { strong: 0, weak: peak };
  if (side === 'left') return { strong: peak * LEFT_JOYCON_GAIN, weak: 0 };
  return { strong, weak };
}

function stop(actuator) {
  if (typeof actuator.reset === 'function') {
    Promise.resolve(actuator.reset()).catch(() => {});
  } else {
    actuator
      .playEffect('dual-rumble', { duration: 1, strongMagnitude: 0, weakMagnitude: 0 })
      .catch(() => {});
  }
}

class RumbleMixer {
  constructor() {
    this.patterns = { 1: [], 2: [] };
    this.holds = { 1: {}, 2: {} };
    this.pads = { 1: null, 2: null };
    this.running = new Set(); // controllers currently sent a non-zero effect
    this.timer = null; // wakes the mixer at the next step boundary
    // Vibration setting: 'full', 'reduced' (only the highlights: crashes, the GO launch,
    // item box results, heart and 2x star) or 'off'
    this.level = 'full';
  }

  // Applies the vibration setting; anything no longer allowed stops right away.
  setLevel(level) {
    this.level = level;
    if (level === 'full') return;
    for (const player of [1, 2]) {
      this.holds[player] = {}; // continuous effects are never essential
      if (level === 'off') this.patterns[player] = [];
      else this.patterns[player] = this.patterns[player].filter((effect) => effect.essential);
    }
    this.flush(now());
  }

  // Plays a pattern on `player`'s controller, on top of anything already running.
  // Essential patterns (the highlights, see InputManager) still play on 'reduced'.
  play(player, pattern, essential = false) {
    if (this.level === 'off' || (this.level === 'reduced' && !essential)) return;
    const time = now();
    this.patterns[player].push({ pattern, start: time, essential });
    this.flush(time);
  }

  // Keeps the continuous effect `kind` (see HOLDS) running for `player`; call every frame.
  // Only on the 'full' setting.
  hold(player, kind) {
    if (this.level !== 'full') return;
    const time = now();
    const hold = this.holds[player][kind];
    if (hold && time < hold.until) hold.until = time + HOLD_GRACE_MS;
    else this.holds[player][kind] = { since: time, until: time + HOLD_GRACE_MS };
  }

  // Called every frame with the current virtual pads (see gamepadPadSelection.js).
  update(pads) {
    this.pads = { 1: pads.player1, 2: pads.player2 };
    this.flush(now());
  }

  // Motor levels for one player right now, how long they stay valid and whether a
  // frame-driven hold is part of them.
  levels(player, time) {
    let strong = 0;
    let weak = 0;
    let validFor = Infinity;
    let continues = false;
    const add = (levels, msLeft, more) => {
      strong = Math.max(strong, levels.strong ?? 0);
      weak = Math.max(weak, levels.weak ?? 0);
      validFor = Math.min(validFor, msLeft);
      continues ||= more;
    };

    this.patterns[player] = this.patterns[player].filter((effect) => {
      let t = time - effect.start;
      for (const step of effect.pattern) {
        if (t < step.ms) {
          add(step, step.ms - t, false);
          return true;
        }
        t -= step.ms;
      }
      return false; // finished
    });

    for (const [kind, hold] of Object.entries(this.holds[player])) {
      if (time >= hold.until) {
        delete this.holds[player][kind];
        continue;
      }
      add(HOLDS[kind](time - hold.since, time), hold.until - time, true);
    }

    return { strong, weak, validFor, continues };
  }

  flush(time) {
    // Mix both players per physical controller (a merged Joy-Con pad is shared)
    const outputs = new Map();
    let nextChange = Infinity;
    for (const player of [1, 2]) {
      const levels = this.levels(player, time);
      nextChange = Math.min(nextChange, levels.validFor);
      const { gamepad, side } = this.pads[player]?.rumble ?? {};
      const actuator = gamepad?.vibrationActuator;
      if (typeof actuator?.playEffect !== 'function') continue;

      const key = gamepad.index ?? gamepad.id;
      const output = outputs.get(key) ?? {
        actuator,
        strong: 0,
        weak: 0,
        validFor: Infinity,
        continues: false,
      };
      const motors = onSide(side, levels);
      output.strong = Math.max(output.strong, motors.strong);
      output.weak = Math.max(output.weak, motors.weak);
      output.validFor = Math.min(output.validFor, levels.validFor);
      output.continues ||= levels.continues;
      outputs.set(key, output);
    }

    for (const [key, output] of outputs) {
      if (output.strong === 0 && output.weak === 0) {
        // Nothing playing, or a pause step: stop the motors once
        if (this.running.delete(key)) stop(output.actuator);
        continue;
      }
      const slack = output.continues ? FRAME_SLACK_MS : 0;
      const duration = Math.min(MAX_EFFECT_MS, Math.max(1, Math.ceil(output.validFor + slack)));
      output.actuator
        .playEffect('dual-rumble', {
          duration,
          strongMagnitude: Math.min(1, output.strong),
          weakMagnitude: Math.min(1, output.weak),
        })
        .catch(() => {}); // unsupported, disconnected or replaced by the next frame's effect
      this.running.add(key);
    }

    // Wake up exactly when the next step starts (or an effect ends), between frames too
    clearTimeout(this.timer);
    this.timer =
      nextChange === Infinity
        ? null
        : setTimeout(() => this.flush(now()), Math.max(1, Math.ceil(nextChange)));
  }
}

// One mixer for the whole game, so effects survive scene changes
export const rumble = new RumbleMixer();
