import { tutorialSteps } from './steps.js';
import { getAccessibleBounds } from '../accessibility/positionControls.js';
import './tutorial.css';

const directions = {
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
  ArrowUp: 'up',
  ArrowLeft: 'left',
  ArrowDown: 'down',
  ArrowRight: 'right',
};

export class Tutorial {
  constructor() {
    this.dialog = document.getElementById('tutorial-dialog');
    this.panel = this.dialog.querySelector('.tutorial-panel');
    this.content = this.dialog.querySelector('.tutorial-content');
    this.highlight = document.getElementById('tutorial-highlight');
    this.title = document.getElementById('tutorial-title');
    this.description = document.getElementById('tutorial-description');
    this.location = document.getElementById('tutorial-location');
    this.progress = document.getElementById('tutorial-progress');
    this.progressBar = document.getElementById('tutorial-progress-bar');
    this.practice = document.getElementById('tutorial-practice');
    this.feedback = document.getElementById('tutorial-feedback');
    this.back = document.getElementById('tutorial-back');
    this.next = document.getElementById('tutorial-next');
    this.updatePosition = this.updatePosition.bind(this);
    this.handleReady = this.handleReady.bind(this);

    this.back.addEventListener('click', () => this.showStep(this.index - 1));
    this.next.addEventListener('click', () => {
      if (this.index === tutorialSteps.length - 1) this.close(true);
      else this.showStep(this.index + 1);
    });
    document.getElementById('tutorial-close').addEventListener('click', () => this.close());
    this.dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.close();
    });
    this.practice.addEventListener('click', (event) => {
      const button = event.target.closest('[data-direction]');
      if (button) this.move(button.dataset.direction);
    });
    this.dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Tab' && !event.altKey && !event.ctrlKey && !event.metaKey) {
        const buttons = [...this.dialog.querySelectorAll('button:not(:disabled)')].filter(
          (button) => button.getClientRects().length > 0,
        );
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === this.title)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === this.title)
        ) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const direction = directions[event.key.length === 1 ? event.key.toLowerCase() : event.key];
      if (direction && tutorialSteps[this.index]?.practice && this.practiceScene) {
        event.preventDefault();
        this.move(direction);
      }
    });
  }

  open(scene, targets, startGame) {
    if (this.dialog.open) return;
    this.menuScene = scene;
    this.game = scene.game;
    this.targets = targets;
    this.startGame = startGame;
    this.returnFocus = document.getElementById('tutorial-btn');
    this.previousKeyboardEnabled = this.game.input.keyboard.enabled;
    // Phaser's global key captures must not swallow HTML keyboard interaction.
    this.game.input.keyboard.enabled = false;
    scene.scene.pause();
    this.game.events.on('postrender', this.updatePosition);
    this.game.events.on('tutorial-ready', this.handleReady);
    this.dialog.showModal();
    this.showStep(0);
  }

  showStep(index) {
    if (!this.dialog.open || index < 0 || index >= tutorialSteps.length) return;
    this.index = index;
    const step = tutorialSteps[index];
    this.title.textContent = step.title;
    this.description.textContent = step.description;
    this.location.textContent = step.location;
    this.progress.textContent = `Schritt ${index + 1} von ${tutorialSteps.length}`;
    this.progressBar.max = tutorialSteps.length;
    this.progressBar.value = index + 1;
    this.back.disabled = index === 0;
    this.next.textContent = index === tutorialSteps.length - 1 ? 'Rennen starten' : 'Weiter';
    this.next.disabled = false;
    this.feedback.textContent = '';
    this.usedDirections = new Set();
    this.taskComplete = false;
    this.practice.hidden = !step.practice;

    if (index >= 3) {
      if (this.practiceScene) this.preparePractice();
      else {
        this.feedback.textContent = 'Die Übungsstrecke wird geladen …';
        this.practice.hidden = true;
        this.next.disabled = true;
        // Keep the paused menu alive so closing and going back restore the same menu.
        if (!this.loadingPractice) {
          this.loadingPractice = true;
          this.game.scene.start('GameScene', { isTutorial: true });
        }
      }
    } else {
      this.stopPractice();
    }
    this.content.scrollTop = 0;
    this.title.focus({ preventScroll: true });
    this.updatePosition();
  }

  handleReady(scene) {
    if (!this.dialog.open) return;
    this.loadingPractice = false;
    this.practiceScene = scene;
    // Creating a Car also enables Phaser's keyboard manager; keep the dialog in control.
    this.game.input.keyboard.enabled = false;
    this.game.scene.bringToTop('GameScene');
    this.showStep(this.index);
  }

  preparePractice() {
    const task = tutorialSteps[this.index].practice;
    this.practiceScene.prepareTutorial(task);
    if (task) {
      this.feedback.textContent =
        task === 'steering'
          ? 'Schon ausprobiert: 0 von 4 Richtungen. Du kannst die Übung auch überspringen.'
          : 'Probiere es aus oder überspringe die Übung.';
      this.next.textContent = 'Übung überspringen';
    }
  }

  move(direction) {
    const task = tutorialSteps[this.index]?.practice;
    if (!this.practiceScene || !task) return;
    const result = this.practiceScene.moveTutorial(direction, task);
    this.usedDirections.add(direction);
    if (task === 'steering') {
      this.taskComplete = this.usedDirections.size === 4;
      const label = { up: 'vorne', down: 'hinten', left: 'links', right: 'rechts' }[direction];
      this.feedback.textContent = this.taskComplete
        ? 'Super! Du hast alle vier Richtungen ausprobiert. Weiter zur Münze!'
        : `Du fährst nach ${label}. Schon ausprobiert: ${this.usedDirections.size} von 4 Richtungen.`;
    } else if (result === 'collected') {
      this.taskComplete = true;
      this.feedback.textContent =
        'Münze eingesammelt! Du hast jetzt 50 Punkte. Oben rechts siehst du deinen Score.';
    } else if (result === 'avoided') {
      this.taskComplete = true;
      this.feedback.textContent = 'Gut ausgewichen! Dein Auto ist jetzt neben dem Hindernis.';
    } else if (!this.taskComplete) {
      this.feedback.textContent =
        task === 'coin'
          ? 'Fahre zur markierten Münze vor deinem Auto. Nutze W oder den oberen Button.'
          : 'Lenke weiter nach links oder rechts, bis dein Auto neben dem Hindernis steht.';
    }
    if (this.taskComplete) {
      this.next.textContent = 'Weiter';
      this.feedback.scrollIntoView({ block: 'nearest' });
    }
  }

  stopPractice() {
    if (this.practiceScene || this.loadingPractice) this.game.scene.stop('GameScene');
    this.practiceScene = null;
    this.loadingPractice = false;
  }

  updatePosition() {
    if (!this.dialog.open) return;
    const step = tutorialSteps[this.index];
    const scene = this.index >= 3 ? this.practiceScene : this.menuScene;
    const object =
      this.index >= 3 ? scene?.tutorialTargets[step.target] : this.targets[step.target];
    const bounds = object?.active ? getAccessibleBounds(scene, object) : null;
    const viewportWidth = this.dialog.clientWidth;
    const viewportHeight = this.dialog.clientHeight;
    this.highlight.hidden = !bounds;
    if (bounds) {
      Object.assign(this.highlight.style, {
        left: `${bounds.left - 8}px`,
        top: `${bounds.top - 8}px`,
        width: `${bounds.width + 16}px`,
        height: `${bounds.height + 16}px`,
      });
    }
    // Choose the corner with the least overlap, keeping the current target visible.
    const width = this.panel.offsetWidth;
    const height = this.panel.offsetHeight;
    const margin = 16;
    const right = Math.max(margin, viewportWidth - width - margin);
    const bottom = Math.max(margin, viewportHeight - height - margin);
    const candidates = [
      [right, margin],
      [right, bottom],
      [margin, margin],
      [margin, bottom],
    ];
    const overlap = ([x, y]) => {
      if (!bounds) return 0;
      return (
        Math.max(
          0,
          Math.min(x + width, bounds.left + bounds.width + 20) - Math.max(x, bounds.left - 20),
        ) *
        Math.max(
          0,
          Math.min(y + height, bounds.top + bounds.height + 20) - Math.max(y, bounds.top - 20),
        )
      );
    };
    const [left, top] = candidates.reduce((best, candidate) =>
      overlap(candidate) < overlap(best) ? candidate : best,
    );
    this.panel.style.left = `${left}px`;
    this.panel.style.top = `${top}px`;
  }

  close(startRace = false) {
    if (!this.dialog.open) return;
    this.game.events.off('postrender', this.updatePosition);
    this.game.events.off('tutorial-ready', this.handleReady);
    this.stopPractice();
    this.dialog.close();
    this.game.input.keyboard.enabled = this.previousKeyboardEnabled;
    this.menuScene.scene.resume();
    if (startRace) this.startGame();
    else this.returnFocus.focus({ preventScroll: true });
  }
}

export const tutorial = new Tutorial();
