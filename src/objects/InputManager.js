import Phaser from 'phaser';

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    // Track previous frame states for edge-triggering buttons
    this.previousButtonP1 = [false, false, false, false];
    this.previousButtonP2 = [false, false, false, false];
    this.previousSpace = false;
    this.hasUpdated = false;
  }

  create() {
    this.keys = this.scene.input.keyboard.addKeys({
      upP1: Phaser.Input.Keyboard.KeyCodes.W,
      downP1: Phaser.Input.Keyboard.KeyCodes.S,
      leftP1: Phaser.Input.Keyboard.KeyCodes.A,
      rightP1: Phaser.Input.Keyboard.KeyCodes.D,
      upP2: Phaser.Input.Keyboard.KeyCodes.UP,
      downP2: Phaser.Input.Keyboard.KeyCodes.DOWN,
      leftP2: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightP2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      select: Phaser.Input.Keyboard.KeyCodes.ENTER,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
  }

  resetButtonStates() {
    this.previousButtonP1.fill(false);
    this.previousButtonP2.fill(false);
    this.previousSpace = false;
    this.hasUpdated = false;
  }

  update() {
    const gamepad = this.scene.input.gamepad;
    const gamepadP1 = gamepad && gamepad.enabled ? gamepad.getPad(0) : null;
    const gamepadP2 = gamepad && gamepad.enabled ? gamepad.getPad(1) : null;
    const padP1 = gamepadP1?.pad?.connected ? gamepadP1 : null;
    const padP2 = gamepadP2?.pad?.connected ? gamepadP2 : null;

    // Check axis values for both players, defaulting to 0 if the gamepad isn't connected
    const axisX1 = padP1?.axes?.[0]?.getValue() ?? 0;
    const axisY1 = padP1?.axes?.[1]?.getValue() ?? 0;
    const axisX2 = padP2?.axes?.[0]?.getValue() ?? 0;
    const axisY2 = padP2?.axes?.[1]?.getValue() ?? 0;

    const dpadLeftP1 = padP1?.buttons?.[14]?.pressed ?? false;
    const dpadRightP1 = padP1?.buttons?.[15]?.pressed ?? false;
    const dpadUpP1 = padP1?.buttons?.[12]?.pressed ?? false;
    const dpadDownP1 = padP1?.buttons?.[13]?.pressed ?? false;
    const dpadLeftP2 = padP2?.buttons?.[14]?.pressed ?? false;
    const dpadRightP2 = padP2?.buttons?.[15]?.pressed ?? false;
    const dpadUpP2 = padP2?.buttons?.[12]?.pressed ?? false;
    const dpadDownP2 = padP2?.buttons?.[13]?.pressed ?? false;

    // Check button states for both players, defaulting to false if the gamepad isn't connected
    const button1P1 = padP1?.buttons?.[0]?.pressed ?? false;
    const button2P1 = padP1?.buttons?.[1]?.pressed ?? false;
    const button3P1 = (padP1?.buttons?.[2]?.pressed ?? false) || this.keys.select.isDown;
    const button4P1 = (padP1?.buttons?.[3]?.pressed ?? false) || this.keys.escape.isDown;
    const button1P2 = padP2?.buttons?.[0]?.pressed ?? false;
    const button2P2 = padP2?.buttons?.[1]?.pressed ?? false;
    const button3P2 = padP2?.buttons?.[2]?.pressed ?? false;
    const button4P2 = padP2?.buttons?.[3]?.pressed ?? false;
    const deadzone = 0.2;
    const spaceIsDown = this.hasUpdated && this.keys.space.isDown && !this.previousSpace;

    // Determine "just pressed" states (true only on the exact frame the button goes down)
    const button1P1isDown = this.hasUpdated && button1P1 && !this.previousButtonP1[0];
    const button2P1isDown = this.hasUpdated && button2P1 && !this.previousButtonP1[1];
    const button3P1isDown = this.hasUpdated && button3P1 && !this.previousButtonP1[2];
    const button4P1isDown = this.hasUpdated && button4P1 && !this.previousButtonP1[3];

    const button1P2isDown = this.hasUpdated && button1P2 && !this.previousButtonP2[0];
    const button2P2isDown = this.hasUpdated && button2P2 && !this.previousButtonP2[1];
    const button3P2isDown = this.hasUpdated && button3P2 && !this.previousButtonP2[2];
    const button4P2isDown = this.hasUpdated && button4P2 && !this.previousButtonP2[3];

    this.getControlsP1 = {
      left: this.keys.leftP1.isDown || axisX1 < -deadzone || dpadLeftP1,
      right: this.keys.rightP1.isDown || axisX1 > deadzone || dpadRightP1,
      up: this.keys.upP1.isDown || axisY1 < -deadzone || dpadUpP1,
      down: this.keys.downP1.isDown || axisY1 > deadzone || dpadDownP1,
      accelerate: this.keys.upP1.isDown || axisY1 < -deadzone,
      brake: this.keys.downP1.isDown || axisY1 > deadzone,
      button1: button1P1isDown,
      button2: button2P1isDown,
      button3: button3P1isDown,
      button4: button4P1isDown,
      space: spaceIsDown,
    };

    this.getControlsP2 = {
      left: this.keys.leftP2.isDown || axisX2 < -deadzone || dpadLeftP2,
      right: this.keys.rightP2.isDown || axisX2 > deadzone || dpadRightP2,
      up: this.keys.upP2.isDown || axisY2 < -deadzone || dpadUpP2,
      down: this.keys.downP2.isDown || axisY2 > deadzone || dpadDownP2,
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
    this.previousSpace = this.keys.space.isDown;
    this.hasUpdated = true;
  }
}
