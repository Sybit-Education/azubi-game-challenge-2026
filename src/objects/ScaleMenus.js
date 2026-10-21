//function to resize the MenuScene
export function ScaleMenu(scene, gameSize) {
  //Scale Positioning
  const width = gameSize.width;
  const height = gameSize.height;
  const scaleFactor = Math.min(width / 1920, height / 1080);

  scene.buttonScale = 0.3 * scaleFactor;
  scene.twoPlayerOffset = 325 * (scene.buttonScale / 0.3);

  scene.homepageHintergrund.setPosition(width / 2, height / 2).setDisplaySize(width, height);

  scene.motto.setPosition(width / 2, height / 1.08);

  scene.title.setPosition(width / 2, height / 4);

  scene.playButton.setPosition(width / 5.7, height / 2.2);
  scene.playButton.setScale(scene.buttonScale);
  scene.settingsButton.setScale(scene.buttonScale);

  scene.creditsButton.setPosition(width / 1.14, height / 1.17);

  scene.twoPlayerButton.setPosition(scene.playButton.x, scene.playButton.y);
  scene.accessibilityButton.setPosition(width / 8, height / 1.17);
  scene.car.setPosition(width, height / 1.5);

  if (scene.scene.key === 'ChristmasScene') {
    scene.accessibilityButton.setPosition(width / 2, height / 1.17);
    scene.title.setPosition(width / 2, height / 3);
    scene.motto.setPosition(width / 1.3, (height / 1.17) * 1.1);
    scene.lights.setPosition(width / 2, height / 6);

    scene.trees.setPosition(width / 3, height * 0.84);

    scene.playButton.setPosition(width / 5.7, height / 1.9);
    scene.twoPlayerButton.setPosition(scene.playButton.x, scene.playButton.y);
  } else {
    scene.title.setPosition(width / 2, height / 4);

    scene.motto.setPosition(width / 2, height / 1.08);
  }

  if (scene.trees) {
    scene.trees.setScale(0.33 * scaleFactor);
  }

  //Scale Sizes
  scene.creditsButton.setScale(scene.buttonScale);
  scene.title.setScale(0.4 * scaleFactor);
  scene.car.setScale(0.3 * scaleFactor);
  scene.accessibilityButton.setScale(scene.buttonScale);

  //Scale Gap between Playbtn and Settingsbtn
  const verticalGap = scene.playButton.displayHeight * 0.3;
  scene.settingsButton.setPosition(
    scene.playButton.x,
    scene.playButton.y +
      scene.playButton.displayHeight / 2 +
      scene.settingsButton.displayHeight / 2 +
      verticalGap,
  );

  //Scale Positioning for tween
  scene.twoPlayerButtonScale = 0.278 * scaleFactor;

  scene.twoPlayerButton.setScale(scene.twoPlayerButtonScale);
  scene.playOriginalY = scene.playButton.y;
  scene.settingsOriginalY = scene.settingsButton.y;
  scene.creditsOriginalY = scene.creditsButton.y;

  if (!scene.twoPlayerButton.visible) {
    scene.twoPlayerButton.setPosition(scene.playButton.x, scene.playButton.y);
  }
}
