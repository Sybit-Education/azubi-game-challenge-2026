/* global Phaser */

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    this.load.image('SYBIT KART', 'sprites/Homepage/Default Homepage/SYBIT KART.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#6f3198');

    // Navigation, orientation, progress and scaling variables
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const barWidth = width / 2.5;
    const height = this.cameras.main.height;
    const barHeight = 45;
    const spacing = height * 0.15;
    const uiScale = Math.min(width / 195, height / 1080);

    // Background image
    this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'homepage-hintergrund')
      .setDisplaySize(this.scale.width, this.scale.height);

    // SYBIT KART Logo placeholder
    this.add
      .image(this.scale.width / 2, this.scale.height / 4, 'homepage-title')
      .setOrigin(0.5)
      .setScale(0.5);

    // Loading bar

    const loadingBar = this.add.rectangle(centerX, centerY - spacing, barWidth, barHeight, 0x000000);
    loadingBar.setRounded(40);

    const fillBar = this.add.rectangle(
    centerX - barWidth / 2,
    centerY - spacing,
    barWidth,
    barHeight - 4,
    0xcbfc2a
    );
    fillBar.setOrigin(0, 0.5);
    fillBar.setRounded(20);
    
    const maskShape = this.add.rectangle(
      centerX - barWidth / 2,
      centerY - spacing,
      0,
      barHeight
  );
   
  maskShape.setO
   
  const mask = maskShape.createGeometryMask();
  fillBar.setMask(mask);

    this.tweens.add({
    targets: maskShape,
    width: barWidth,
    duration: 3000
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start('StartScene');
    });

    this.add
      .text(centerX, centerY + spacing * 2, 'Press SPACE to skip', {
        fontFamily: 'Tiny5',
        fontSize: `${32 * uiScale}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Funny comment, randomly selected
    this.add
      .text(centerX, centerY + spacing, 'Preparing SyCity for high speeds...', {
        fontFamily: 'Tiny5',
        fontSize: '72px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
  }
}
