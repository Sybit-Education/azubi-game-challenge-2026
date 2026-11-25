import Phaser from 'phaser';

// How long the layers glide to a newly selected button
const FOCUS_DURATION_MS = 400;

/**
 * Parallax for menu backgrounds that works with the mouse and the controller.
 *
 * `layers` is a list of { object, base, factor }:
 *   base(width, height) → [x, y]  the layer's resting position for the screen size
 *   factor                         how far it moves with the focus point (bigger = closer)
 *
 * The mouse moves the layers directly, as before. With a controller, call
 * `focusOn(gameObject)` when the selection changes: the layers glide to where they would
 * be if the mouse pointed at that object, so selecting something on the right shifts the
 * scene to the right.
 */
export function createParallax(scene, layers) {
  const focus = { x: scene.scale.width / 2, y: scene.scale.height / 2 };
  let focusTween = null;
  let focusTarget = null;

  const apply = () => {
    const { width, height } = scene.scale;
    for (const { object, base, factor } of layers) {
      if (!object?.active) continue;
      const [x, y] = base(width, height);
      object.setPosition(x + (focus.x - width / 2) * factor, y + (focus.y - height / 2) * factor);
    }
  };

  const onPointerMove = (pointer) => {
    focusTween?.remove();
    focusTarget = null;
    focus.x = pointer.x;
    focus.y = pointer.y;
    apply();
  };
  scene.input.on('pointermove', onPointerMove);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.input.off('pointermove', onPointerMove);
  });

  return {
    /** Glides the layers towards `target` (anything with getBounds); no-op if unchanged. */
    focusOn(target) {
      if (!target?.getBounds || target === focusTarget) return;
      focusTarget = target;
      const bounds = target.getBounds();
      focusTween?.remove();
      focusTween = scene.tweens.add({
        targets: focus,
        x: bounds.centerX,
        y: bounds.centerY,
        duration: FOCUS_DURATION_MS,
        ease: 'Sine.easeOut',
        onUpdate: apply,
      });
    },
  };
}
