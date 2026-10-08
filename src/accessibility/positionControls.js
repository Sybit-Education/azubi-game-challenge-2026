// Match HTML focus targets to the rendered Phaser objects, including canvas scaling.
export function getAccessibleBounds(scene, object) {
  const canvas = scene.game.canvas.getBoundingClientRect();
  const camera = scene.cameras.main;
  const scaleX = canvas.width / scene.scale.width;
  const scaleY = canvas.height / scene.scale.height;
  const bounds = object.getBounds();
  return {
    left: canvas.left + (camera.x + (bounds.x - camera.worldView.x) * camera.zoom) * scaleX,
    top: canvas.top + (camera.y + (bounds.y - camera.worldView.y) * camera.zoom) * scaleY,
    width: bounds.width * camera.zoom * scaleX,
    height: bounds.height * camera.zoom * scaleY,
  };
}

export function positionAccessibleControls(scene, controls) {
  // Keep Phaser's window-level key captures from cancelling native button activation
  // or consuming arrows intended for a select/checkbox.
  const keepNativeKeyboardInput = (event) => event.stopPropagation();
  for (const [element] of controls) {
    element.addEventListener('keydown', keepNativeKeyboardInput);
    element.addEventListener('keyup', keepNativeKeyboardInput);
  }
  const updatePositions = () => {
    for (const [element, object] of controls) {
      const bounds = getAccessibleBounds(scene, object);
      Object.assign(element.style, {
        left: `${bounds.left}px`,
        top: `${bounds.top}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
      });
    }
  };

  updatePositions();
  scene.game.events.on('postrender', updatePositions);
  scene.events.once('shutdown', () => {
    scene.game.events.off('postrender', updatePositions);
    for (const [element] of controls) {
      element.removeEventListener('keydown', keepNativeKeyboardInput);
      element.removeEventListener('keyup', keepNativeKeyboardInput);
    }
  });
}
