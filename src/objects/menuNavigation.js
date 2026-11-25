import { playMenuFocus } from '../../audio/sounds.js';

// Feedback when the controller moves to another menu item: the mouse-hover
// sound plus a short buzz on Player 1's controller.
export function menuMoveFeedback(scene) {
  playMenuFocus(scene);
  scene.InputManager?.rumbleP1();
}

// Gamepad navigation for the main menu, matching its on-screen layout:
//
//   [0 Play] ──right──> 2-player option (handled by the scene)
//   [1 Settings]
//   [2 How to play]   [3 Leaderboard]   [4 Credits]   (footer row)
//
// Indexes are positions in the scene's `menuButtons` array.
export const MAIN_MENU_NAVIGATION = [
  { up: 2, down: 1 }, // Play (up wraps to the footer)
  { up: 0, down: 2 }, // Settings
  { up: 1, down: 0, right: 3 }, // How to play
  // Leaderboard and Credits sit off to the side: only left/right, How to play leads back up
  { left: 2, right: 4 }, // Leaderboard
  { left: 3 }, // Credits
];

// Index reached by moving `direction` from `index`; stays put if there is nothing that way.
export function nextMenuIndex(navigation, index, direction) {
  return navigation[index]?.[direction] ?? index;
}
