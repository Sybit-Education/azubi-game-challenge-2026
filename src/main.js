
class Car extends Phaser.GameObjects.Image{
    constructor(scene, x, y) {
        super(scene, x, y,`car`);
        scene.add.existing(this);
        this.value = 10
        this.setScale(0.25);
        this.setAngle(180);
    }
    move(){
        this.scene.input.keyboard.on('keydown-A', () => {
            this.x -= 5
        });
        this.scene.input.keyboard.on('keydown-D', () => {
            this.x += 5
        });  
    }
}


function show_main_menu(scene){
    const button = scene.add.text(400, 300, "Start Game", {
        
        fontSize: "32px",
        backgroundColor: "#00000",
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();

    button.on("pointerdown", () => {
        button.setVisible(false);
        const car = new Car(scene, scene.scale.width / 2, scene.scale.height / 1.25);

        car.move();
        
        scene.add.text(scene.scale.width - 20, 20, `Score: ${car.value}`, {
            fontSize: "30px"
        }).setOrigin(1,0);
    });

    this.scene.input.keyboard.on('keydown-D', () => {
      if (this.lane < lanes.length - 1) {
        this.lane++;
        this.x = lanes[this.lane];
      }
    });
  }


class Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'obstacle-car');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.3);
  }
}

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.NONE,
    width: 800,
    height: 600,
  },
  backgroundColor: '#fffff',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload() {
      this.load.image('obstacle-car', '../../sprites/obstacleCar.png');
    },

    create() {
      const car = new Car(this, lanes[1], 500, 150, 75, 0xffffff);
      car.move();

      this.add
        .text(this.scale.width - 20, 20, `Score: ${car.value}`, {
          fontSize: '30px',
        })
        .setOrigin(1, 0);

      const spawnObstacle = () => {
        const obstacle = new Obstacle(this, Phaser.Math.RND.pick(lanes), 50);

        obstacle.body.setVelocityY(200);
      };

      this.time.addEvent({
        delay: 2000,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true,
      });
    },
  },
};

new Phaser.Game(config);
