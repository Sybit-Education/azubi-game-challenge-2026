# Spatial Car Audio Example Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox - [ ] syntax for tracking.

**Goal:** Add an opt-in example that spatializes enemy cars and Player 2 around Player 1 with synthesized engine sounds.

**Architecture:** Pure JavaScript functions map Phaser screen coordinates into a listener-relative Web Audio space and select at most three nearby cars. A browser-only engine source builds a small oscillator/filter/gain/panner graph from Phaser's AudioContext, while a testable CarSpatialAudioSystem owns source lifecycle. GameScene creates the system only when the existing accessibility setting is enabled and disposes it on scene shutdown.

**Tech Stack:** Phaser 4.2.1, JavaScript ES modules, Web Audio API, Vite, Node.js 22 built-in test runner

**Spec:** docs/2026-10-21-barrierefreies-3d-audio-design.md

## Global Constraints

- Keep the project on Phaser 4.2.1 and JavaScript ES modules.
- Treat Player 1, this.car, as the listener for this example.
- Spatialize only EnemyCar instances and the living secondCar.
- Create no binary audio assets; synthesize the engine tone with Web Audio nodes.
- Route synthesized audio through scene.sound.destination so Phaser mute and master volume still apply.
- Keep at most three engine sources active.
- Do not change physics, spawning, scoring, controls, or collision behavior.
- If Web Audio is unavailable, leave gameplay running without the example audio.
- Stop and disconnect every created Web Audio node when GameScene shuts down.

---

### Task 1: Pure spatial mapping and car selection

**Files:**

- Create: src/accessibility/audio/carAudioConfig.js
- Create: src/accessibility/audio/carSpatialMath.js
- Create: test/accessibility/carSpatialMath.test.js
- Modify: package.json

**Interfaces:**

- Produces: mapCarToAudioPosition(sourceCar, listenerCar, roadWidth, viewportHeight)
- Produces: selectAudibleCars(candidates, listenerCar, viewportHeight, limit)
- Produces: CAR_AUDIO_CONFIG

- [ ] **Step 1: Add the Node test command**

Add this script to package.json:

```json
"test": "node --test"
```

- [ ] **Step 2: Write failing coordinate and selection tests**

Create test/accessibility/carSpatialMath.test.js:

```js
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mapCarToAudioPosition,
  selectAudibleCars,
} from '../../src/accessibility/audio/carSpatialMath.js';

test('maps a centered car ahead of the listener to negative z', () => {
  const position = mapCarToAudioPosition({ x: 500, y: 200 }, { x: 500, y: 800 }, 800, 1000);

  assert.deepEqual(position, {
    x: 0,
    y: 0,
    z: -18,
    forwardDistance: 600,
  });
});

test('maps one lane to the right onto positive x', () => {
  const position = mapCarToAudioPosition({ x: 700, y: 800 }, { x: 500, y: 800 }, 800, 1000);

  assert.equal(position.x, 2);
});

test('keeps only the three nearest active cars inside the audible window', () => {
  const listener = { x: 500, y: 800 };
  const candidates = [
    { target: { x: 500, y: 700, active: true }, kind: 'enemy' },
    { target: { x: 500, y: 600, active: true }, kind: 'enemy' },
    { target: { x: 500, y: 500, active: true }, kind: 'enemy' },
    { target: { x: 500, y: 400, active: true }, kind: 'enemy' },
    { target: { x: 500, y: 750, active: false }, kind: 'enemy' },
    { target: { x: 500, y: -500, active: true }, kind: 'enemy' },
  ];

  const selected = selectAudibleCars(candidates, listener, 1000, 3);

  assert.deepEqual(
    selected.map(({ target }) => target.y),
    [700, 600, 500],
  );
});
```

- [ ] **Step 3: Run the tests and verify the feature is missing**

Run:

```bash
node --test test/accessibility/carSpatialMath.test.js
```

Expected: FAIL because src/accessibility/audio/carSpatialMath.js does not exist.

- [ ] **Step 4: Add centralized audio constants**

Create src/accessibility/audio/carAudioConfig.js:

```js
export const CAR_AUDIO_CONFIG = Object.freeze({
  laneCount: 4,
  audioUnitsPerLane: 2,
  maxHorizontalUnits: 6,
  maxLongitudinalUnits: 30,
  audibleAheadFactor: 1.2,
  audibleBehindFactor: 0.2,
  maxSources: 3,
  enemyFrequency: 72,
  opponentFrequency: 108,
  baseGain: 0.08,
  smoothingSeconds: 0.04,
});
```

- [ ] **Step 5: Implement spatial mapping and selection**

Create src/accessibility/audio/carSpatialMath.js:

```js
import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function mapCarToAudioPosition(sourceCar, listenerCar, roadWidth, viewportHeight) {
  const laneWidth = roadWidth / CAR_AUDIO_CONFIG.laneCount;
  const horizontalOffset = sourceCar.x - listenerCar.x;
  const forwardDistance = listenerCar.y - sourceCar.y;

  return {
    x: clamp(
      (horizontalOffset / laneWidth) * CAR_AUDIO_CONFIG.audioUnitsPerLane,
      -CAR_AUDIO_CONFIG.maxHorizontalUnits,
      CAR_AUDIO_CONFIG.maxHorizontalUnits,
    ),
    y: 0,
    z: -clamp(
      (forwardDistance / viewportHeight) * CAR_AUDIO_CONFIG.maxLongitudinalUnits,
      -CAR_AUDIO_CONFIG.maxLongitudinalUnits,
      CAR_AUDIO_CONFIG.maxLongitudinalUnits,
    ),
    forwardDistance,
  };
}

export function selectAudibleCars(
  candidates,
  listenerCar,
  viewportHeight,
  limit = CAR_AUDIO_CONFIG.maxSources,
) {
  const minimumDistance = -viewportHeight * CAR_AUDIO_CONFIG.audibleBehindFactor;
  const maximumDistance = viewportHeight * CAR_AUDIO_CONFIG.audibleAheadFactor;

  return candidates
    .filter(({ target }) => {
      const distance = listenerCar.y - target.y;
      return (
        target.active && !target.dead && distance >= minimumDistance && distance <= maximumDistance
      );
    })
    .sort(
      (left, right) =>
        Math.abs(listenerCar.y - left.target.y) - Math.abs(listenerCar.y - right.target.y),
    )
    .slice(0, limit);
}
```

- [ ] **Step 6: Run the focused tests**

Run:

```bash
node --test test/accessibility/carSpatialMath.test.js
```

Expected: 3 tests pass.

---

### Task 2: Synthesized spatial engine source

**Files:**

- Create: src/accessibility/audio/SpatialEngineSource.js
- Create: test/accessibility/SpatialEngineSource.test.js

**Interfaces:**

- Consumes: CAR_AUDIO_CONFIG
- Produces: new SpatialEngineSource(audioContext, destination, frequency)
- Produces: setPosition(position), destroy()

- [ ] **Step 1: Write a failing lifecycle test with a Web Audio boundary fake**

Create test/accessibility/SpatialEngineSource.test.js. The fake implements the complete node surface used by SpatialEngineSource: createOscillator, createBiquadFilter, createGain, createPanner, connect, disconnect, start, stop, and AudioParam scheduling methods.

The tests must assert:

```js
assert.equal(context.panner.panningModel, 'HRTF');
assert.deepEqual(context.panner.positionX.lastTarget, [2, 5, 0.04]);
assert.deepEqual(context.panner.positionZ.lastTarget, [-12, 5, 0.04]);
assert.equal(context.oscillator.stopped, true);
assert.equal(context.panner.disconnected, true);
```

- [ ] **Step 2: Run the source test and verify the module is missing**

Run:

```bash
node --test test/accessibility/SpatialEngineSource.test.js
```

Expected: FAIL because SpatialEngineSource.js does not exist.

- [ ] **Step 3: Implement the Web Audio graph**

Create src/accessibility/audio/SpatialEngineSource.js with this graph:

```text
OscillatorNode -> BiquadFilterNode -> GainNode -> PannerNode -> Phaser destination
```

Configure it as follows:

```js
this.oscillator.type = 'sawtooth';
this.oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
this.filter.type = 'lowpass';
this.filter.frequency.setValueAtTime(240, audioContext.currentTime);
this.gain.gain.setValueAtTime(0, audioContext.currentTime);
this.panner.panningModel = 'HRTF';
this.panner.distanceModel = 'linear';
this.panner.refDistance = 1;
this.panner.maxDistance = CAR_AUDIO_CONFIG.maxLongitudinalUnits;
this.panner.rolloffFactor = 1;
```

setPosition must smooth positionX, positionY, positionZ, and gain toward CAR_AUDIO_CONFIG.baseGain with setTargetAtTime. destroy must stop the oscillator once and disconnect every node.

- [ ] **Step 4: Run the focused tests**

Run:

```bash
node --test test/accessibility/SpatialEngineSource.test.js
```

Expected: all source tests pass.

---

### Task 3: Car source lifecycle system

**Files:**

- Create: src/accessibility/audio/CarSpatialAudioSystem.js
- Create: src/accessibility/audio/createCarSpatialAudioSystem.js
- Create: test/accessibility/CarSpatialAudioSystem.test.js

**Interfaces:**

- Consumes: mapCarToAudioPosition, selectAudibleCars, SpatialEngineSource
- Produces: CarSpatialAudioSystem.update(frame), CarSpatialAudioSystem.destroy()
- Produces: createCarSpatialAudioSystem(scene, isEnemyCar)

- [ ] **Step 1: Write failing system behavior tests**

Use plain object cars and a sourceFactory that returns real lightweight test sources with setPosition and destroy methods. Verify:

```js
assert.equal(createdKinds[0], 'enemy');
assert.equal(createdKinds[1], 'opponent');
assert.deepEqual(enemySource.positions[0], {
  x: 0,
  y: 0,
  z: -18,
  forwardDistance: 600,
});
assert.equal(enemySource.destroyed, true);
```

The first update contains one active enemy and Player 2. The second update contains neither, proving that stale sources are destroyed.

- [ ] **Step 2: Run the system test and verify the module is missing**

Run:

```bash
node --test test/accessibility/CarSpatialAudioSystem.test.js
```

Expected: FAIL because CarSpatialAudioSystem.js does not exist.

- [ ] **Step 3: Implement source ownership**

CarSpatialAudioSystem must:

```js
update({ listenerCar, roadObjects, opponentCar, roadWidth, viewportHeight }) {
  if (!listenerCar?.active || listenerCar.dead) {
    this.clear();
    return;
  }

  this.candidates.length = 0;

  for (const roadObject of roadObjects) {
    if (this.isEnemyCar(roadObject)) {
      this.candidates.push({ target: roadObject, kind: 'enemy' });
    }
  }

  if (opponentCar && opponentCar !== listenerCar) {
    this.candidates.push({ target: opponentCar, kind: 'opponent' });
  }

  const selected = selectAudibleCars(
    this.candidates,
    listenerCar,
    viewportHeight,
  );

  this.synchronizeSources(selected, listenerCar, roadWidth, viewportHeight);
}
```

Use the target car object as the Map key, so no IDs need to be added to existing Phaser objects. Create no more sources than selectAudibleCars returns. Remove and destroy sources whose targets leave the selected set.

- [ ] **Step 4: Add the Phaser/Web Audio factory**

createCarSpatialAudioSystem must return null unless scene.sound is a Phaser.Sound.WebAudioSoundManager. Otherwise it creates CarSpatialAudioSystem with a sourceFactory that uses:

```js
const frequency =
  kind === 'opponent' ? CAR_AUDIO_CONFIG.opponentFrequency : CAR_AUDIO_CONFIG.enemyFrequency;

return new SpatialEngineSource(scene.sound.context, scene.sound.destination, frequency);
```

- [ ] **Step 5: Run all audio unit tests**

Run:

```bash
node --test test/accessibility/*.test.js
```

Expected: all tests pass.

---

### Task 4: Integrate the example into GameScene

**Files:**

- Modify: src/scenes/GameScene.js

**Interfaces:**

- Consumes: createCarSpatialAudioSystem(scene, isEnemyCar)
- Calls: CarSpatialAudioSystem.update(frame) once per GameScene update
- Calls: CarSpatialAudioSystem.destroy() on Phaser.Scenes.Events.SHUTDOWN

- [ ] **Step 1: Add imports and enablement**

Import createCarSpatialAudioSystem. After createTrack(), read the existing setting with compatibility for both registry keys:

```js
const accessibilityEnabled =
  this.registry.get('accessibilityMode') ?? this.registry.get('accessibility enabled') ?? false;

this.carSpatialAudio = accessibilityEnabled
  ? createCarSpatialAudioSystem(this, (roadObject) => roadObject instanceof EnemyCar)
  : null;
```

- [ ] **Step 2: Wire restart-safe cleanup**

Register one shutdown handler in create():

```js
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.carSpatialAudio?.destroy();
  this.carSpatialAudio = null;
});
```

- [ ] **Step 3: Update positions after cars and road objects move**

At the end of update(), call:

```js
this.carSpatialAudio?.update({
  listenerCar: this.car,
  roadObjects: this.roadObjects,
  opponentCar: this.secondCar,
  roadWidth: this.track1.displayWidth,
  viewportHeight: this.scale.height,
});
```

- [ ] **Step 4: Run unit tests, lint, and build**

Run:

```bash
node --test
node node_modules/eslint/bin/eslint.js .
node node_modules/vite/bin/vite.js build
```

Expected: tests and lint pass; Vite builds successfully with only the existing font and chunk-size warnings.

---

### Task 5: Align the design document and verify the branch

**Files:**

- Modify: docs/2026-10-21-barrierefreies-3d-audio-design.md

**Interfaces:**

- Documents the exact JavaScript modules and GameScene integration delivered by Tasks 1 through 4.

- [ ] **Step 1: Replace TypeScript examples with project JavaScript**

Update section 11 to:

- name Phaser 4.2.1, JavaScript ES modules, Vite, GameScene, EnemyCar, this.car, this.secondCar, roadObjects, and track1.displayWidth;
- show imports ending in .js;
- show the synthesized SpatialEngineSource instead of nonexistent MP3 files;
- state clearly that Player 1 is the listener in this example;
- explain that accessibilityMode and accessibility enabled are both read for compatibility;
- use Node's built-in node:test instead of Vitest.

- [ ] **Step 2: Run the complete verification set**

Run:

```bash
node --test
node node_modules/eslint/bin/eslint.js .
node node_modules/prettier/bin/prettier.cjs --check .
node node_modules/vite/bin/vite.js build
git diff --check
```

Expected: all tests pass, lint and formatting pass, build exits zero with only the known baseline warnings, and git diff reports no whitespace errors.

- [ ] **Step 3: Review only feature-owned changes**

Run:

```bash
git status --short
git diff -- src/accessibility/audio src/scenes/GameScene.js test/accessibility package.json docs
```

Confirm that no physics, scoring, control, image, or LFS asset files changed.

- [ ] **Step 4: Commit the feature**

Stage only:

```bash
git add package.json src/accessibility/audio src/scenes/GameScene.js test/accessibility docs
git commit -m "feat: add spatial car audio example"
```
