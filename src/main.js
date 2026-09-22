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
            this.x -= 20
        });
        this.scene.input.keyboard.on('keydown-D', () => {
            this.x += 20
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
}

let width = window.innerWidth;
let height = width * 9 / 16;
if (height > window.innerHeight) {
    height = window.innerHeight;
    width = height * 16 / 9;
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight
    },
    backgroundColor: '#fffff',
    scene: {
        preload() {
            this.load.image('car', 'sprites/car2.png');
        },
        create() {
            show_main_menu(this);
        }
    }
};

new Phaser.Game(config);