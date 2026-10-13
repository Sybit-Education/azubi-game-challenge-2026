import PerspectiveRoad, { ROAD_HORIZON, ROAD_LATERAL_SCALE } from './PerspectiveRoad.js';

// Screen line where the 2D physics road width maps 1:1 (car spawn height).
const REFERENCE_Y_RATIO = 1 / 1.25;
// Road objects spawn this far below the horizon, as a share of the reach.
const SPAWN_DEPTH = 0.1;

export default class SegmentRoad extends PerspectiveRoad {
  camDepth = 0;

  referenceY(height) {
    return height * REFERENCE_Y_RATIO;
  }

  roadReach(height) {
    return this.referenceY(height) - height * ROAD_HORIZON;
  }

  get spawnY() {
    const { height } = this.scene.scale;
    return height * ROAD_HORIZON + this.roadReach(height) * SPAWN_DEPTH;
  }

  // Screen speed as a share of the road speed; the road recedes toward the horizon.
  roadSpeedScale(y, height) {
    const depth = (y - height * ROAD_HORIZON) / this.roadReach(height);
    return depth * depth;
  }

  project(x, y, width, height) {
    const horizon = height * ROAD_HORIZON;
    const scale = (y - horizon) / this.roadReach(height);

    return {
      x: width / 2 + (x - width / 2) * scale * ROAD_LATERAL_SCALE,
      y,
      scale,
      size: scale,
    };
  }

  render() {
    const { scene } = this;
    const { height } = scene.scale;
    const delta = scene.game.loop.delta / 1000;

    this.camDepth += (scene.track1.speed * delta) / this.roadReach(height);

    super.render();
  }

  drawRoad(width, height) {
    const { scene } = this;
    const horizon = height * ROAD_HORIZON;
    const reach = this.roadReach(height);
    const roadHalf = (scene.track1.displayWidth / 2) * ROAD_LATERAL_SCALE;
    const borderWidth = scene.walls[0].displayWidth * ROAD_LATERAL_SCALE;
    const roadTile = scene.track1.displayHeight;
    const borderTile = scene.walls[0].displayHeight;
    const centerX = width / 2;

    for (let y = Math.floor(horizon); y < height; y++) {
      const nearRel = reach / (y + 0.5 - horizon);
      const scale = 1 / nearRel;
      const worldRow = (this.camDepth + nearRel) * reach;
      const edge = roadHalf * scale;
      const borderPx = borderWidth * scale;

      this.drawStrip(this.roadImage, worldRow, 0, roadTile, centerX - edge, y, edge * 2, 2);
      this.drawStrip(
        this.borderImage,
        worldRow,
        0,
        borderTile,
        centerX - edge - borderPx,
        y,
        borderPx,
        2,
      );
      this.drawStrip(
        this.borderImage,
        worldRow,
        0,
        borderTile,
        centerX + edge,
        y,
        borderPx,
        2,
        true,
      );
    }
  }
}
