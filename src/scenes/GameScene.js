import Phaser from 'phaser';

import Car from '../objects/Car.js';
import EnemyCar from '../objects/EnemyCar.js';
import Track from '../objects/Track.js';
import Border from '../objects/Wall.js';
import HUD from '../objects/HUD.js';
import Coin from '../objects/Coin.js';
import Item from '../objects/Item.js';
import ItemManager from '../objects/ItemManager.js';
import InputManager from '../objects/InputManager.js';
import PerspectiveRoad, { ROAD_HORIZON } from '../objects/PerspectiveRoad.js';
import SegmentRoad from '../objects/SegmentRoad.js';

// Experiment toggle: true = segment-based road, false = texture-strip road.
const USE_SEGMENT_ROAD = true;
// Extra scale the background zooms to around the vanishing point per cycle.
const BACKGROUND_ZOOM = 0.5;
// Track travel in px for one zoom cycle.
const BACKGROUND_ZOOM_DISTANCE = 3000;
// Smaller copies of the art toward the vanishing point fill its transparent center.
const BACKGROUND_DISTANT_COPIES = 3;
const BACKGROUND_DISTANT_FACTOR = 0.5;
// Share of the art height faded in from the top so copy edges blend into the sky.
const BACKGROUND_TOP_FEATHER = 0.25;
// Share of the art height faded out at the bottom so it melts into the horizon haze.
const BACKGROUND_BOTTOM_FEATHER = 0.4;
// Sky behind the transparent background art, from the top edge down to the horizon.
const SKY_TOP_COLOR = '#05020f';
const SKY_HORIZON_COLOR = '#2b1245';
// Haze that softens distant buildings into the horizon, peaking at the horizon line.
const HAZE_COLOR = 'rgba(43, 18, 69, 0.7)';
const HAZE_CLEAR_COLOR = 'rgba(43, 18, 69, 0)';
const HAZE_BELOW_HORIZON_RATIO = 0.1;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.isMultiplayer = data?.isMultiplayer ?? false;
  }

  //Bilder laden
  preload() {
    this.load.image('car', 'assets/images/entities/player-skins/sybit-kart-player-1.png');
    this.load.image('car2', 'assets/images/entities/player-skins/sybit-kart-player-2.png');
    this.load.image('sybit-plate-logo', 'assets/images/homepage/default-homepage/logo-2.png');
    this.load.image('track', 'assets/images/race-track-assets/road.png');
    this.load.image('border', 'assets/images/race-track-assets/border.png');

    this.load.image('enemy-car1', 'assets/images/entities/obstacles/enemy-car-1.png');
    this.load.image('enemy-car2', 'assets/images/entities/obstacles/enemy-car-2.png');
    this.load.image('enemy-car3', 'assets/images/entities/obstacles/enemy-car-3.png');

    this.load.image('coin', 'assets/images/entities/coin.png');
    this.load.image('item', 'assets/images/entities/item.png');
    this.load.image('boundary-particle', 'assets/images/particles/image-001.png');

    this.load.image('background', 'assets/images/map-skins/background-sybit-city.png');

    this.load.image('carShield', 'assets/images/entities/player-skins/car-shield.png');
    this.load.image('carShield2', 'assets/images/entities/player-skins/car-shield-2.png');
  }

  //Alle Objekte in der Szene initialisieren
  create() {
    this.InputManager = new InputManager(this);
    this.InputManager.create();
    this.onEscape = (event) => {
      if (event.key === 'Escape') this.openPause();
    };
    window.addEventListener('keydown', this.onEscape);
    this.events.once('shutdown', () => window.removeEventListener('keydown', this.onEscape));
    this.ItemManager = new ItemManager(this);
    this.secondCar = null;
    this.elapsedTime = 0;
    this.roadObjects = [];
    this.createPlayer();
    this.createTrack();
    this.createWalls();
    this.createHud();
    this.backgroundDistance = 0;
    this.createSky();
    this.setBackground('background');
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.separateOverlappingCars, this);
    const RoadRenderer = USE_SEGMENT_ROAD ? SegmentRoad : PerspectiveRoad;
    this.perspectiveRoad = new RoadRenderer(this);
    this.createRoadObject('obstacle');
    this.createRoadObject('coin');
    this.createRoadObject('item');
  }

  createSky() {
    const { height } = this.scale;
    const horizon = height * ROAD_HORIZON;
    const hazeBottom = horizon + height * HAZE_BELOW_HORIZON_RATIO;

    this.addGradientImage(
      'sky',
      height,
      [
        [0, SKY_TOP_COLOR],
        [ROAD_HORIZON, SKY_HORIZON_COLOR],
        [1, SKY_HORIZON_COLOR],
      ],
      -20,
    );
    this.addGradientImage(
      'haze',
      hazeBottom,
      [
        [0, HAZE_CLEAR_COLOR],
        [horizon / hazeBottom, HAZE_COLOR],
        [1, HAZE_CLEAR_COLOR],
      ],
      -5,
    );
  }

  // Stops are offsets from 0 to 1 across the filled height.
  addGradientImage(key, fillHeight, stops, depth) {
    const { width, height } = this.scale;
    if (this.textures.exists(key)) this.textures.remove(key);

    const canvas = this.textures.createCanvas(key, width, height);
    const context = canvas.getContext();
    const gradient = context.createLinearGradient(0, 0, 0, fillHeight);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, fillHeight);
    canvas.refresh();

    this.add.image(0, 0, key).setOrigin(0).setDepth(depth);
  }

  // Copy of the background art with soft alpha edges at the top and bottom.
  createFeatheredBackground(sourceKey) {
    const key = `${sourceKey}-feathered`;
    if (this.textures.exists(key)) this.textures.remove(key);

    const source = this.textures.get(sourceKey).getSourceImage();
    const canvas = this.textures.createCanvas(key, source.width, source.height);
    const context = canvas.getContext();
    context.drawImage(source, 0, 0);

    // One full-height mask: destination-in would clear everything outside a partial fill.
    const mask = context.createLinearGradient(0, 0, 0, source.height);
    mask.addColorStop(0, 'rgba(0, 0, 0, 0)');
    mask.addColorStop(BACKGROUND_TOP_FEATHER, 'rgba(0, 0, 0, 1)');
    mask.addColorStop(1 - BACKGROUND_BOTTOM_FEATHER, 'rgba(0, 0, 0, 1)');
    mask.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.globalCompositeOperation = 'destination-in';
    context.fillStyle = mask;
    context.fillRect(0, 0, source.width, source.height);
    canvas.refresh();
    return key;
  }

  setBackground(sourceKey) {
    const img = this.createFeatheredBackground(sourceKey);
    // Scale by height like the road and cars; mirrored copies fill wide windows.
    const source = this.textures.get(img).getSourceImage();
    const scale = this.scale.height / source.height;
    const tileWidth = source.width * scale;
    const tiles = Math.ceil(this.scale.width / tileWidth / 2) + 1;

    this.backgroundTileWidth = tileWidth;
    // Two layers half a zoom cycle apart crossfade into each other.
    this.backgroundLayers = [0, 0.5].map((phaseOffset) => {
      const layer = { phaseOffset, scale, tiles: [] };
      for (let copy = 0; copy <= BACKGROUND_DISTANT_COPIES; copy++) {
        const factor = BACKGROUND_DISTANT_FACTOR ** copy;
        for (let i = -tiles; i <= tiles; i++) {
          const baseX = this.scale.width / 2 + i * tileWidth;
          const image = this.add
            .image(baseX, this.scale.height / 2, img)
            .setScale(scale)
            .setFlipX(i % 2 !== 0)
            .setDepth(-10 - copy); // Farther copies sit behind nearer ones
          layer.tiles.push({ image, baseX, factor });
        }
      }
      return layer;
    });
  }

  moveBackground(distance) {
    const { width, height } = this.scale;
    const vanishingX = width / 2;
    const vanishingY = height * ROAD_HORIZON;

    for (const layer of this.backgroundLayers) {
      const phase = Phaser.Math.Wrap(distance / BACKGROUND_ZOOM_DISTANCE + layer.phaseOffset, 0, 1);
      const zoom = 1 + BACKGROUND_ZOOM * phase;
      const alpha = Math.sin(Math.PI * phase);

      for (const { image, baseX, factor } of layer.tiles) {
        const scaleFactor = zoom * factor;
        image.setScale(layer.scale * scaleFactor).setAlpha(alpha);
        image.x = vanishingX + (baseX - vanishingX) * scaleFactor;
        image.y = vanishingY + (height / 2 - vanishingY) * scaleFactor;
      }
    }
  }

  //funktion die checkt, ob die autos ineinander gebugged sind (passiert oft bei dieser vercrackten phaser physik)
  separateOverlappingCars() {
    if (!this.secondCar || this.car.dead || this.secondCar.dead) return;

    const firstBody = this.car.body;
    const secondBody = this.secondCar.body;

    //sehr viel mathe ig checke selber nicht aber es klappt halbwegs
    const overlapX =
      Math.min(firstBody.right, secondBody.right) - Math.max(firstBody.left, secondBody.left);
    const overlapY =
      Math.min(firstBody.bottom, secondBody.bottom) - Math.max(firstBody.top, secondBody.top);

    if (overlapX <= 0 || overlapY <= 0) return;

    const firstIsLeft = firstBody.center.x < secondBody.center.x;
    const firstMovesIntoSecond = firstIsLeft
      ? this.car.intendedXVelocity > 0
      : this.car.intendedXVelocity < 0;
    const secondMovesIntoFirst = firstIsLeft
      ? this.secondCar.intendedXVelocity < 0
      : this.secondCar.intendedXVelocity > 0;

    if (firstMovesIntoSecond && secondMovesIntoFirst) {
      this.car.x += firstIsLeft ? -overlapX / 2 : overlapX / 2;
      this.secondCar.x += firstIsLeft ? overlapX / 2 : -overlapX / 2;
      this.car.body.updateFromGameObject();
      this.secondCar.body.updateFromGameObject();
    } else {
      const carToMove = firstMovesIntoSecond
        ? this.car
        : secondMovesIntoFirst
          ? this.secondCar
          : null;

      if (!carToMove) return;

      const direction = carToMove === this.car ? (firstIsLeft ? -1 : 1) : firstIsLeft ? 1 : -1;

      carToMove.x += direction * (overlapX + 1);
      carToMove.body.updateFromGameObject();
    }
  }

  createPlayer() {
    if (this.isMultiplayer) {
      this.car = new Car(this, this.scale.width / 2 - 90, this.scale.height / 1.25);
      this.car.fitHitbox(); // slightly smaller than the drawn car, to be more forgiving

      this.secondCar = new Car(
        this,
        this.scale.width / 2 + 90,
        this.scale.height / 1.25,
        'UP,LEFT,DOWN,RIGHT',
      );
      this.secondCar.fitHitbox();
      this.physics.add.collider(this.car, this.secondCar);
    } else {
      this.car = new Car(this, this.scale.width / 2, this.scale.height / 1.25);
      this.car.fitHitbox();
    }
  }

  createTrack() {
    this.track1 = new Track(this, this.scale.width / 2, 0);
    this.track2 = new Track(this, this.scale.width / 2, -this.scale.height);
  }

  createWalls() {
    const screenCenterX = this.scale.width / 2;
    const roadHalfWidth = this.track1.displayWidth / 2;

    const wall1 = new Border(this, 0, 0);
    const wall2 = new Border(this, 0, 0);
    const wall3 = new Border(this, 0, -this.scale.height);
    const wall4 = new Border(this, 0, -this.scale.height);
    const wallHalfWidth = wall1.displayWidth / 2;

    wall1.x = screenCenterX - roadHalfWidth - wallHalfWidth;
    wall2.x = screenCenterX + roadHalfWidth + wallHalfWidth;
    wall3.x = screenCenterX - roadHalfWidth - wallHalfWidth;
    wall4.x = screenCenterX + roadHalfWidth + wallHalfWidth;

    wall2.setFlipX(true);
    wall4.setFlipX(true);

    this.walls = [wall1, wall2, wall3, wall4];
  }

  createHud() {
    this.hud = new HUD(this, this.car, this.secondCar);
  }

  // road objects are obstacles and coins
  createRoadObject(type) {
    const laneCount = 4;
    const laneWidth = this.track1.displayWidth / laneCount;
    const roadLeftEdge = this.scale.width / 2 - this.track1.displayWidth / 2;
    const lane = Phaser.Math.Between(0, laneCount - 1);
    const roadObjectX = roadLeftEdge + lane * laneWidth + laneWidth / 2;
    const spawnY = this.perspectiveRoad.spawnY;

    if (this.positionFree(lane, spawnY)) {
      let roadObject;

      if (type === 'coin') {
        roadObject = new Coin(this, roadObjectX, spawnY, lane);
        roadObject.fitHitbox();
        roadObject.body.offset.y += 5;
        this.physics.add.overlap(this.car, roadObject, this.collectCoin, undefined, this);
        if (this.secondCar) {
          this.physics.add.overlap(this.secondCar, roadObject, this.collectCoin, undefined, this);
        }
      } else if (type === 'item') {
        roadObject = new Item(this, roadObjectX, spawnY, lane);
        roadObject.fitHitbox();
        this.physics.add.overlap(
          this.car,
          roadObject,
          this.ItemManager.itemRandom1,
          undefined,
          this.ItemManager,
        );
        this.physics.add.overlap(this.car, roadObject, this.collectCoin, undefined, this);
        if (this.secondCar) {
          this.physics.add.overlap(
            this.secondCar,
            roadObject,
            this.ItemManager.itemRandom2,
            undefined,
            this.ItemManager,
          );
          this.physics.add.overlap(this.secondCar, roadObject, this.collectCoin, undefined, this);
        }
      } else if (type === 'obstacle') {
        roadObject = new EnemyCar(this, roadObjectX, spawnY, lane);
        roadObject.fitHitbox();
        roadObject.body.setImmovable(true);
        this.physics.add.collider(
          this.car,
          roadObject,
          this.ItemManager.lebenCheckCar1,
          undefined,
          this.ItemManager,
        );

        //this.physics.add.collider(this.car, roadObject, this.gameOver, undefined, this);
        if (this.secondCar) {
          this.physics.add.collider(
            this.secondCar,
            roadObject,
            this.ItemManager.lebenCheckCar2,
            undefined,
            this.ItemManager,
          );
        }
      }

      this.roadObjects.push(roadObject);
    }

    // Spawnrate
    let delay;

    if (type === 'coin') {
      delay = Phaser.Math.Between(500, 2000);
    } else if (type === 'item') {
      delay = Phaser.Math.Between(5000, 10000);
    } else if (type === 'obstacle') {
      delay = Phaser.Math.Between(2000, 4000);
    }

    this.time.delayedCall(delay, () => this.createRoadObject(type));
  }

  // Checks if the lane is free for spawning a new road object
  positionFree(lane, spawnY) {
    const minimumDistance = 500; // Minimum distance between road objects

    return this.roadObjects.every((roadObject) => {
      if (roadObject.lane !== lane) {
        return true;
      }

      const distance = Math.abs(roadObject.y - spawnY);

      return distance >= minimumDistance;
    });
  }

  collectCoin(car, coin) {
    coin.destroy();
    car.increase_score(coin.value);
  }

  openPause() {
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.launch('PauseScene');
  }

  // Handle game over when the player collides with an enemy car
  gameOver(car) {
    if (car.dead) return; //already dead, do not run again

    //only the car that got hit dies
    car.dead = true;
    car.boundaryParticles.emitting = false;
    car.disableBody(true, true); //hides the dead car

    //in multiplayer only game over when both are dead
    if (this.secondCar && !(this.car.dead && this.secondCar.dead)) {
      return;
    }

    this.scene.start('GameoverScene', {
      distance: this.car.calculate_km(),
      score: this.car.score,
      distance2: this.secondCar ? this.secondCar.calculate_km() : null,
      score2: this.secondCar ? this.secondCar.score : null,
      isMultiplayer: this.isMultiplayer,
    }); // Change to DeathScene once there is one
  }

  // Update the game state every frame
  update(_, delta) {
    this.InputManager.update();

    this.elapsedTime += delta;
    if (!this.car.dead) {
      this.car.move(this.InputManager.getControlsP1);
      this.car.update_boundary_particles();
      this.car.intendedXVelocity = this.car.body.velocity.x;
    }
    if (this.secondCar && !this.secondCar.dead) {
      this.secondCar.move(this.InputManager.getControlsP2);
      this.secondCar.update_boundary_particles();
      this.secondCar.intendedXVelocity = this.secondCar.body.velocity.x;
    }

    this.roadObjects = this.roadObjects.filter((roadObject) => {
      roadObject.move(this.elapsedTime, delta);
      return roadObject.active;
    });

    const targetTrackSpeed = Math.min(1500, 600 + this.elapsedTime * 0.005);
    this.track1.speed = targetTrackSpeed;
    this.track2.speed = targetTrackSpeed;
    //dead cars do not collect distance anymore
    if (!this.car.dead) {
      this.car.update_meters(targetTrackSpeed, delta);
    }
    if (this.secondCar && !this.secondCar.dead) {
      this.secondCar.update_meters(targetTrackSpeed, delta);
    }

    for (const wall of this.walls) {
      wall.speed = targetTrackSpeed;
      wall.move(delta);
    }

    this.track1.move(delta);
    this.track2.move(delta);
    this.backgroundDistance += (targetTrackSpeed * delta) / 1000;
    this.moveBackground(this.backgroundDistance);
    this.hud.update();
  }
}
