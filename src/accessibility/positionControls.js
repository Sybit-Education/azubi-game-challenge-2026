// Match HTML focus targets to the rendered Phaser objects, including canvas scaling.
export function positionAccessibleControls(scene, controls) {
  const updatePositions = () => {
    const canvas = scene.game.canvas.getBoundingClientRect();
    const camera = scene.cameras.main;
    const scaleX = canvas.width / scene.scale.width;
    const scaleY = canvas.height / scene.scale.height;

    for (const [element, object] of controls) {
      const bounds = object.getBounds();
      const left =
        canvas.left + (camera.x + (bounds.x - camera.worldView.x) * camera.zoom) * scaleX;
      const top = canvas.top + (camera.y + (bounds.y - camera.worldView.y) * camera.zoom) * scaleY;
      Object.assign(element.style, {
        left: `${left}px`,
        top: `${top}px`,
        width: `${bounds.width * camera.zoom * scaleX}px`,
        height: `${bounds.height * camera.zoom * scaleY}px`,
      });
    }
  };

  updatePositions();
  scene.game.events.on('postrender', updatePositions);
  scene.events.once('shutdown', () => {
    scene.game.events.off('postrender', updatePositions);
  });
}
