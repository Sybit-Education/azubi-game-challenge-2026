/* global Phaser */

class Car extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'car');
    scene.add.existing(this);

    this.keys = scene.input.keyboard.addKeys('A,D');
    this.speed = 5;
    this.value = 10;
    this.setScale(0.5);
  }

  move() {
    if (this.keys.A.isDown) {
      this.x -= this.speed;
    }

    if (this.keys.D.isDown) {
      this.x += this.speed;
    }
  }
}

function show_main_menu(scene) {
  const button = scene.add
    .text(400, 300, 'Start Game', {
      fontSize: '32px',
      backgroundColor: '#00000',
      padding: { x: 10, y: 5 },
    })
    .setOrigin(0.5)
    .setInteractive();

  button.on('pointerdown', () => {
    button.destroy();

    scene.car = new Car(scene, scene.scale.width / 2, scene.scale.height / 1.25);

    scene.add
      .text(scene.scale.width - 20, 20, `Score: ${scene.car.value}`, {
        fontSize: '30px',
      })
      .setOrigin(1, 0);
  });
}

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  backgroundColor: '#000000',
  scene: {
    preload() {
      this.load.image('car', 'sprites/race_car.png');
    },

    create() {
      show_main_menu(this);
    },

    update() {
      if (this.car) {
        this.car.move();
      }
    },
  },
};

new Phaser.Game(config);
