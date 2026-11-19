import Phaser from 'phaser';

export default class Nametag {
  constructor(scene, car, player) {
    this.scene = scene;
    this.car = car;
    const playerNumber = player === 1 ? 1 : 2;
    const name = localStorage.getItem(`Playername${playerNumber === 1 ? '' : '2'}`);
    const fallback = `PLAYER ${playerNumber}`;

    this.arrow = scene.add
      .image(0, 0, `p${playerNumber}-nametag-arrow`)
      .setOrigin(0.5, 1.2)
      .setDepth(12)
      .setAlpha(0.5)
      .setScale(0.5);

    this.label = scene.add
      .text(0, 0, name?.trim() || fallback, {
        fontFamily: 'Silkscreen',
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 1.2)
      .setDepth(13);

    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.update();
  }

  update() {
    const visible = this.car.active && !this.car.dead;
    this.arrow.setVisible(visible);
    this.label.setVisible(visible);

    if (!this.car.active) return;

    this.arrow.setPosition(this.car.x, this.car.y - this.car.displayHeight / 2);
    this.label.setPosition(this.arrow.x, this.arrow.y - this.label.displayHeight - 4);
  }

  destroy() {
    this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.update, this);
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.arrow.destroy();
    this.label.destroy();
  }
}
