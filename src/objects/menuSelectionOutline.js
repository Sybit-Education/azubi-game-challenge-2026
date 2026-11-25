// Pulsing outline around the button a gamepad / Joy-Con currently has selected,
// so it is easy to see where the controller is in a menu.
const OUTLINE_COLOR = 0xc8ff16;

export function createSelectionOutline(scene) {
  return scene.add.graphics().setDepth(1000);
}

// Redraws the outline around `target`; hidden when `visible` is false.
export function updateSelectionOutline(scene, graphics, target, visible) {
  if (!graphics) return;
  graphics.clear();
  if (!visible || !target?.visible) return;

  const scale = Math.min(scene.scale.width / 1920, scene.scale.height / 1080);
  const padding = 10 * scale;
  const bounds = target.getBounds();
  const alpha = 0.7 + 0.3 * Math.sin(scene.time.now / 160);

  graphics.lineStyle(Math.max(2, 5 * scale), OUTLINE_COLOR, alpha);
  graphics.strokeRoundedRect(
    bounds.x - padding,
    bounds.y - padding,
    bounds.width + padding * 2,
    bounds.height + padding * 2,
    14 * scale,
  );
}
