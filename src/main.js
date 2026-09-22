class Coin {
  constructor(scene, x, y) {
    this.sprite = scene.add.circle(x, y, 20, 0xffff00);
    this.value = 10;
  }
}

class Circle {
  constructor(scene, x, y) {
    this.sprite = scene.add.circle(x, y, 50, 0xffffff);
    this.value = 10;
  }
}

const lanes = [200, 400, 600];

class Car extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width = 50, height = 100, color = 0xff0000) {
    super(scene, x, y, width, height, color);
    scene.add.existing(this);
    this.value = 10
    this.lane = 1

  }


  move() {

    this.scene.input.keyboard.on('keydown-A', () => {
      if (this.lane > 0) {
        this.lane--
        this.x = lanes[this.lane]
      }
    });

    this.scene.input.keyboard.on('keydown-D', () => {
      if (this.lane < lanes.length - 1) {
        this.lane++
        this.x = lanes[this.lane]
      }
    });
  }
}

class Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y,) {
    super(scene, x, y, 'obstacle-car');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.3);
  }
}

function show_main_menu() {

}


const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.NONE,
    width: 800,
    height: 600
  },
  backgroundColor: '#fffff',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload() {
      this.load.image('obstacle-car', '../../sprites/obstacleCar.png');
    },

    create() {
      const car = new Car(this, lanes[1], 500, 150, 75, 0xffffff);
      car.move();

      this.add.text(this.scale.width - 20, 20, `Score: ${car.value}`, {
        fontSize: "30px"
      }).setOrigin(1, 0);

      const spawnObstacle = () => {
        const obstacle = new Obstacle(
          this,
          Phaser.Math.RND.pick(lanes),
          50,
        );

        obstacle.body.setVelocityY(200);
      };


      this.time.addEvent({
        delay: 2000,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
      })

    }

  }

};

new Phaser.Game(config);