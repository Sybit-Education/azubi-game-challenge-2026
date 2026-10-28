export function preserveNativeKeyboard(scene, element) {
  // Keep native Enter/Space behavior out of Phaser's global key captures.
  const stopPropagation = (event) => event.stopPropagation();
  const events = ['keydown', 'keyup'];
  for (const name of events) element.addEventListener(name, stopPropagation);

  scene.events.once('shutdown', () => {
    for (const name of events) element.removeEventListener(name, stopPropagation);
  });
}
