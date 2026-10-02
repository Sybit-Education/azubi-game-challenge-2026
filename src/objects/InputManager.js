/* global Phaser */

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    // Track previous frame states for edge-triggering buttons
    this.previousButtonP1 = [false, false, false, false];
    this.previousButtonP2 = [false, false, false, false];
  }

  create() {
    this.keys = this.scene.input.keyboard.addKeys({
      upP1: Phaser.Input.Keyboard.KeyCodes.UP,
      downP1: Phaser.Input.Keyboard.KeyCodes.DOWN,
      leftP1: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightP1: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      upP2: Phaser.Input.Keyboard.KeyCodes.W,
      downP2: Phaser.Input.Keyboard.KeyCodes.S,
      leftP2: Phaser.Input.Keyboard.KeyCodes.A,
      rightP2: Phaser.Input.Keyboard.KeyCodes.D,
      select: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });
  }

  update() {
    const gamepad = this.scene.input.gamepad;
    const padP1 = gamepad && gamepad.enabled ? gamepad.getPad(0) : null;
    const padP2 = gamepad && gamepad.enabled ? gamepad.getPad(1) : null;

    // Check axis values for both players, defaulting to 0 if the gamepad isn't connected
    const axisX1 = padP1 ? padP1.getAxisValue(0) : 0;
    const axisY1 = padP1 ? padP1.getAxisValue(1) : 0;
    const axisX2 = padP2 ? padP2.getAxisValue(0) : 0;
    const axisY2 = padP2 ? padP2.getAxisValue(1) : 0;

    // Check button states for both players, defaulting to false if the gamepad isn't connected
    let button1P1 = false,
      button2P1 = false,
      button3P1 = false,
      button4P1 = false;
    let button1P2 = false,
      button2P2 = false,
      button3P2 = false,
      button4P2 = false;

    if (padP1) {
      button1P1 = padP1.buttons[0] ? padP1.buttons[0].pressed : false;
      button2P1 = padP1.buttons[1] ? padP1.buttons[1].pressed : false;
      button3P1 = padP1.buttons[2] ? padP1.buttons[2].pressed : false;
      button4P1 = padP1.buttons[3] ? padP1.buttons[3].pressed : false;
    }

    if (padP2) {
      button1P2 = padP2.buttons[0] ? padP2.buttons[0].pressed : false;
      button2P2 = padP2.buttons[1] ? padP2.buttons[1].pressed : false;
      button3P2 = padP2.buttons[2] ? padP2.buttons[2].pressed : false;
      button4P2 = padP2.buttons[3] ? padP2.buttons[3].pressed : false;
    }
    const deadzone = 0.2;

    // Determine "just pressed" states (true only on the exact frame the button goes down)
    const button1P1isDown = button1P1 && !this.previousButtonP1[0];
    const button2P1isDown = button2P1 && !this.previousButtonP1[1];
    const button3P1isDown = button3P1 && !this.previousButtonP1[2];
    const button4P1isDown = button4P1 && !this.previousButtonP1[3];

    const button1P2isDown = button1P2 && !this.previousButtonP2[0];
    const button2P2isDown = button2P2 && !this.previousButtonP2[1];
    const button3P2isDown = button3P2 && !this.previousButtonP2[2];
    const button4P2isDown = button4P2 && !this.previousButtonP2[3];

    this.getControlsP1 = {
      left: this.keys.leftP1.isDown || axisX1 < -deadzone,
      right: this.keys.rightP1.isDown || axisX1 > deadzone,
      accelerate: this.keys.upP1.isDown || axisY1 < -deadzone,
      brake: this.keys.downP1.isDown || axisY1 > deadzone,
      button1: button1P1isDown,
      button2: button2P1isDown,
      button3: button3P1isDown,
      button4: button4P1isDown,
    };

    this.getControlsP2 = {
      left: this.keys.leftP2.isDown || axisX2 < -deadzone,
      right: this.keys.rightP2.isDown || axisX2 > deadzone,
      accelerate: this.keys.upP2.isDown || axisY2 < -deadzone,
      brake: this.keys.downP2.isDown || axisY2 > deadzone,
      button1: button1P2isDown,
      button2: button2P2isDown,
      button3: button3P2isDown,
      button4: button4P2isDown,
    };

    // Save current states into previous states for the next frame check
    this.previousButtonP1[0] = button1P1;
    this.previousButtonP1[1] = button2P1;
    this.previousButtonP1[2] = button3P1;
    this.previousButtonP1[3] = button4P1;

    this.previousButtonP2[0] = button1P2;
    this.previousButtonP2[1] = button2P2;
    this.previousButtonP2[2] = button3P2;
    this.previousButtonP2[3] = button4P2;
  }
}
