// Switch / Joy-Con button prompt images (public/assets/images/button-prompts/).
const BUTTONS = ['a', 'b', 'x', 'y', 'sl', 'sr'];

// Index of each button in InputManager's `padHeld` array
const HELD_INDEX = { a: 0, b: 1, x: 2, y: 3, sl: 4, sr: 5 };

// Default icon height at 1080p; scenes multiply it by their own UI scale.
export const BUTTON_PROMPT_SIZE = 52;

// Pressed look: slightly smaller and darker, exactly while the button is held
const PRESSED_SCALE = 0.85;
const PRESSED_TINT = 0xb0b0b0;

export function buttonPromptKey(button) {
  return `button-prompt-${button}`;
}

export function preloadButtonPrompts(scene) {
  for (const button of BUTTONS) {
    scene.load.image(buttonPromptKey(button), `assets/images/button-prompts/button-${button}.png`);
  }
}

function applyPromptScale(image) {
  const factor = image.getData('pressed') ? PRESSED_SCALE : 1;
  image.setScale((image.getData('size') * factor) / image.height);
}

// Adds a hidden button icon `size` pixels tall. Scenes show it while
// InputManager.showJoyConPrompts is true.
export function addButtonPrompt(scene, button, size) {
  const image = scene.add.image(0, 0, buttonPromptKey(button)).setOrigin(0.5).setDepth(10000);
  image.setData({ button, size, pressed: false });
  applyPromptScale(image);
  return image.setVisible(false);
}

// Shop hotbar: centres of the baked-in "1", "2", "3" (in hotbar image pixels,
// same in hotbar.png and hotbarMultiplayer.png) and the button that buys each item.
const SHOP_SLOTS = [
  { x: 66, y: 44.5, button: 'a' }, // shield
  { x: 235.5, y: 44.5, button: 'b' }, // shrink
  { x: 403.5, y: 44.5, button: 'y' }, // extra life
];
const SHOP_PROMPT_SIZE = 77; // hotbar image pixels, covers the digit

// Adds hidden A / B / Y icons over a hotbar's slot numbers (hotbar origin must be 0, 0).
export function addShopPrompts(scene, hotbar) {
  return SHOP_SLOTS.map(({ x, y, button }) =>
    addButtonPrompt(scene, button, SHOP_PROMPT_SIZE * hotbar.scaleY)
      .setPosition(hotbar.x + x * hotbar.scaleX, hotbar.y + y * hotbar.scaleY)
      .setDepth(hotbar.depth + 1)
      .setScrollFactor(0),
  );
}

// Changes the icon's (unpressed) height, e.g. after a resize.
export function setButtonPromptSize(image, size) {
  if (image.getData('size') === size) return image;
  image.setData('size', size);
  applyPromptScale(image);
  return image;
}

// Unpressed width, for placing the icon next to a button without it jumping when pressed.
export function buttonPromptWidth(image) {
  return (image.getData('size') * image.width) / image.height;
}

// Shows the icon pressed in while its button is held on `controls`' gamepad.
export function updateButtonPromptPressed(image, controls) {
  const pressed = Boolean(controls?.padHeld?.[HELD_INDEX[image.getData('button')]]);
  if (pressed === image.getData('pressed')) return image;

  image.setData('pressed', pressed);
  applyPromptScale(image);
  if (pressed) image.setTint(PRESSED_TINT);
  else image.clearTint();
  return image;
}
