export default class FlickerEffect {
    constructor(scene, normalBg, flashBg) {
        this.scene = scene;
        this.normalBg = normalBg;
        this.flashBg = flashBg;
}

start() {
        this.scene.time.addEvent({
            delay: 3000,
            loop: true,
            callback: () => {
                this.flicker();
            }
        });
    }
}

flicker() {
    this.flashBg.setVisible(true);
    this.scene.time.delayedCall(100, () => {
        this.flashBg.setVisible(false);
    });
}


    