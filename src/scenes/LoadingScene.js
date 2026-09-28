/* global Phaser */
/* global Phaser */

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
}

preload() {

}

create() {

    this.cameras.main.setBackgroundColor("#6f3198")

    // Navigation, orientation, progress and scaling variables
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const barWidth = width / 2.5;
    const height = this.cameras.main.height;
    const barHeight = 45
    const spacing = height * 0.15;
    const uiScale = Math.min(
      width / 1920,
      height / 1080
    );

    // SYBIT KART Logo placeholder
    this.add.text(centerX, height * 0.10, 'SYBIT KART', {
      fontFamily: 'Tiny5',
      fontSize: `${175 * uiScale}px`,
      color: '#ffffff'
    })
      .setOrigin(0.5);

    
    // Loading bar
    const barBg = this.add.rectangle(centerX, centerY - spacing, barWidth, barHeight, 0xffffff)
    const fillBar = this.add.rectangle(centerX - barWidth / 2, centerY - spacing, 0, barHeight - 4, 0xcbfc2a).setOrigin(0.0,0.5);

    this.tweens.add({
        targets: fillBar,
        width: barWidth,
        duration: 3000,

        onComplete: () => {
            this.scene.start("GameScene")
        }
    });

    this.input.keyboard.on("keydown-SPACE", () => {
        this.scene.start("GameScene")
    })

    this.add.text(centerX, centerY + spacing * 2, "Press SPACE to skip", {
        fontFamily: "Tiny5",
        fontSize: `${32 * uiScale}px`,
        color: "#ffffff"
    }).setOrigin(0.5);


    // Funny comment, randomly selected
    this.add.text(centerX, centerY + spacing, "Preparing SyCity for high speeds...", {
        fontFamily: "Tiny5",
        fontSize: "72px",
        color: "#ffffff",
    })
    .setOrigin(0.5);
}

}
