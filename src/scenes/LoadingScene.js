export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
}

preload() {

}

create() {

    this.cameras.main.setBackgroundColor("#6f3198")

    // Navigation and orientation variables
    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    this.add.text(centerX, centerY - 250, "SYBIT KART", {
        fontFamily: "Tiny5",
        fontSize: "96px",
        color: "#ffffff"
    })
    .setOrigin(0.5);

    this.add.text(centerX, centerY + 200, "Preparing SyCity for high speeds...", {
        fontFamily: "Tiny5",
        fontSize: "72px",
        color: "#ffffff",
    })
    .setOrigin(0.5);
}

}