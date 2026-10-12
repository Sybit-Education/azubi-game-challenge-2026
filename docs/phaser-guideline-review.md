# Phaser Coding Guidelines: Review Findings

**Review date:** 2026-10-12  
**Scope:** Phaser bootstrap, scenes, input, Arcade Physics, responsive layout, and game-object lifecycle.  
**Guideline basis:** The local Phaser 3 Game Development guide (version 1.3.0) and its scene, physics, performance, and project-setup guides. These files are present only in the working environment and are not included in this PR.

## Prioritized TODO List

Work from top to bottom. P1 items affect runtime consistency or make the game unplayable on touch-only devices; P2 items fix concrete gameplay or performance defects; P3 items are larger guideline-alignment improvements.

- [ ] **P1: Align the Phaser runtime and dependency.** Choose Phaser 3 or 4, use one pinned version for both the Vite bundle and browser runtime, and remove or replace the Phaser 3 prototype patch.
- [ ] **P1: Add visible touch controls for gameplay.** Support steering and acceleration on touch-only devices and verify the controls on a real mobile viewport.
- [ ] **P2: Dispose of dynamic Arcade colliders.** Retain and destroy collider handles when road objects are collected or despawn, or use persistent group colliders with pooled objects.
- [ ] **P2: Handle viewport resizing.** Recalculate scene geometry and UI in response to resize events, then verify the play area at portrait and landscape sizes.
- [ ] **P2: Restore each car's base scale after power-ups.** Capture the initial scale and use it when timed effects expire; verify at different viewport heights.
- [ ] **P3: Centralize game state, events, and tuning values.** Introduce the guide's `GameState`, `EventBus`, and `Constants` incrementally, with restart and event-cleanup tests.
- [ ] **P3: Consolidate asset loading and frequent object creation.** Move shared assets to a preloader, then evaluate atlases and pooling for spawned road objects.
- [ ] **P3: Plan a TypeScript migration.** Add compiler/typecheck coverage once the runtime dependency is aligned.

## Findings

### [P1] Use one pinned Phaser runtime and dependency

[`index.html`](../index.html#L6) loads Phaser 3 from jsDelivr, while [`package.json`](../package.json#L15-L17) declares Phaser `^4.2.1`. [`src/main.js`](../src/main.js#L11-L27) also patches a Phaser 3 prototype and consumes the global `Phaser` object. Vite therefore builds the game code without bundling the Phaser package that `npm ci` installs; the browser instead runs a separately versioned CDN dependency.

This makes the lockfile and CI dependency version a poor description of the runtime, permits the CDN's Phaser 3 release to move independently, and makes the game unavailable when the CDN cannot be reached. It also leaves Phaser 4 migration work untested.

**Recommendation:** Choose the intended Phaser major, import it from the npm dependency through Vite, and pin the runtime to the same version. Remove or replace the Phaser 3 prototype patch with a fix supported by that version.

### [P1] Add visible touch controls for gameplay

[`src/objects/InputManager.js`](../src/objects/InputManager.js#L12-L23) binds gameplay movement to keyboard keys; its control state combines those keys with gamepad input ([lines 79-99](../src/objects/InputManager.js#L79-L99)). The HTML controls cover menu and dialog actions, but there are no touch controls for steering or accelerating during a race.

On touch-only devices the player cannot control the game, contrary to the guide's requirement that games work on mobile and show touch controls rather than relying on invisible touch zones.

**Recommendation:** Add visible, appropriately sized touch controls and merge their state into the same source-agnostic input state used by keyboard and gamepad input.

### [P2] Remove Arcade colliders when road objects despawn

[`GameScene.createRoadObject`](../src/scenes/GameScene.js#L173-L220) creates new overlap/collider instances for individual coins, items, and obstacles. Those road objects are later destroyed when collected or when they leave the screen, but the collider handles are not retained or destroyed. Phaser's Arcade Physics API exposes `Collider.destroy()` to remove a collider from the world ([API reference](https://docs.phaser.io/api-documentation/class/physics-arcade-collider)).

Because the scene continuously spawns objects, the world's collider list can grow for the lifetime of a run and keep adding collision work after the associated objects are gone.

**Recommendation:** Prefer persistent colliders against physics groups or pooled objects; otherwise retain each collider and destroy it when its road object is destroyed.

### [P2] Re-layout active scenes on resize

The game opts into `Phaser.Scale.RESIZE` in [`src/main.js`](../src/main.js#L29-L34), but layout is computed only during scene creation. For example, [`GameScene`](../src/scenes/GameScene.js#L131-L155) positions the track and walls once, and [`Track`](../src/objects/Track.js#L7-L12) derives its scale once. The background is also sized once ([`GameScene.setBackground`](../src/scenes/GameScene.js#L62-L65)). The car limits then use the new scale dimensions while the road geometry remains at its old size.

Resizing the browser can therefore leave the play area, boundaries, and background inconsistent. Phaser provides a Scale Manager resize event for updating content ([API reference](https://docs.phaser.io/api-documentation/event/scale-events)).

**Recommendation:** Recalculate positions and dimensions from a scene resize handler, or use a fixed design size with a scale mode that preserves the intended layout.

### [P2] Restore power-ups to each car's actual base scale

[`Car`](../src/objects/Car.js#L31) sets its initial scale based on the scene height. The shrink/grow effects in [`ItemManager`](../src/objects/ItemManager.js#L17-L58) later restore every car to the hard-coded value `0.66` instead of its original scale.

At viewport heights other than 1200 pixels, collecting a size power-up permanently changes the car's size after the effect expires, affecting its appearance and collision size.

**Recommendation:** Capture the car's base scale when it is created and restore that value after each effect.

## Additional guideline gaps

These are architectural or performance deviations from the supplied guide rather than independently verified release-blocking defects:

- The project uses JavaScript and has no TypeScript compiler/typecheck, despite the guide's TypeScript-first and Vite + TypeScript setup requirements.
- There is no `src/core` layer containing the prescribed `EventBus`, `GameState.reset()`, and `Constants`. State is distributed across scene fields and the Phaser registry, while gameplay values are embedded in scene and object code. The prescribed spectacle event hooks are also absent.
- Assets are loaded in individual scene `preload()` methods rather than a shared preloader, and the frequently spawned road objects are not pooled. This increases duplicated setup and per-run object/collider churn; see the dynamic collider finding above.

A gradual migration is preferable to introducing all of these abstractions in one change. The repository's existing menus and game flow are left intact by this review.

## Verification

- `npx eslint src`: passed.
- `npm run build -- --outDir /tmp/azubi-phaser-review-dist`: passed; Vite emitted a warning that the configured `base` should start with `/`.
- `npm run lint`: failed on 38 `Phaser is not defined` errors in the existing generated `dist` bundle; source-only lint passed.
- `npm run format:check`: reported 55 files in untracked local Phaser-guideline mirrors as unformatted. Those files were not changed or included in this PR.
- No automated gameplay, touch-device, or resize tests are present, so those behaviors were assessed from the source rather than browser interaction.
