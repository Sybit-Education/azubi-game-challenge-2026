import Phaser from 'phaser';
import './style.css';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 540,
  backgroundColor: '#0f172a',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

let submarine;
let cursors;
let keySonar;
let keyShield;
let statusText;

function preload() {
  // Platzhalter für spätere Assets
}

function create() {
  const scene = this;

  submarine = scene.add.rectangle(150, 270, 80, 30, 0x0284c7);
  scene.physics.add.existing(submarine);
  submarine.body.setCollideWorldBounds(true);

  scene.add.text(20, 20, 'Steuerung: Pfeiltasten | S (Sonar) | Leertaste (Schild)', {
    font: '16px Arial',
    fill: '#38bdf8',
  });

  const instructions = scene.add.text(20, 50, 'Pilot: mit Pfeiltasten bewegen, Sonar und Schild mit Buttons oder Tastatur aktivieren.', {
    font: '14px Arial',
    fill: '#e2e8f0',
  });
  instructions.setDepth(1);

  statusText = document.getElementById('game-status');

  cursors = scene.input.keyboard.createCursorKeys();
  keySonar = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyShield = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  keySonar.on('down', triggerSonar);
  keyShield.on('down', triggerShield);

  document.getElementById('btn-sonar').addEventListener('click', triggerSonar);
  document.getElementById('btn-shield').addEventListener('click', triggerShield);
}

function update() {
  if (!submarine || !submarine.body) return;

  submarine.body.setVelocity(0);

  if (cursors.up.isDown) {
    submarine.body.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    submarine.body.setVelocityY(200);
  }

  if (cursors.left.isDown) {
    submarine.body.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    submarine.body.setVelocityX(200);
  }
}

function triggerSonar() {
  const scene = game.scene.keys[Object.keys(game.scene.keys)[0]];

  if (!scene || !submarine) return;

  const pulse = scene.add.circle(submarine.x, submarine.y, 10, 0x38bdf8, 0.7);
  scene.tweens.add({
    targets: pulse,
    radius: 180,
    alpha: 0,
    duration: 800,
    onComplete: () => pulse.destroy(),
  });

  playTone(587.33, 0.15);
  announceStatus('Sonar-Ping aktiviert.');

  if ('vibrate' in navigator) {
    navigator.vibrate(120);
  }
}

function triggerShield() {
  const scene = game.scene.keys[Object.keys(game.scene.keys)[0]];

  if (!scene || !submarine) return;

  const shield = scene.add.circle(submarine.x, submarine.y, 50, 0x0d9488, 0.4);
  scene.tweens.add({
    targets: shield,
    alpha: 0,
    duration: 500,
    onComplete: () => shield.destroy(),
  });

  playTone(293.66, 0.3);
  announceStatus('Schutzschild aktiviert.');

  if ('vibrate' in navigator) {
    navigator.vibrate([80, 40, 80]);
  }
}

function announceStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function playTone(frequency, duration) {
  try {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtor();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (error) {
    console.warn('AudioContext wird vom Browser blockiert:', error);
  }
}
