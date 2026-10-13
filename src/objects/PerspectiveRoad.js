import { createRearVehicleTextures, REAR_ASPECT, REAR_VEHICLE_KEYS } from './RearVehicleSprites.js';

export const ROAD_VANISHING_POINT_Y = 0.384;
const ROAD_FAR_SCALE = 0.14;
export const ROAD_HORIZON = ROAD_FAR_SCALE + (1 - ROAD_FAR_SCALE) * ROAD_VANISHING_POINT_Y;
export const ROAD_LATERAL_SCALE = 1.7; // matches the wider street in the background art
// Top-down sprites are squashed toward the horizon; 0.72 is the vertical factor at the reference scale.
export const SPRITE_GROUND_SQUASH = 0.72;
const SPRITE_MIN_SQUASH = 0.3;
// Share of the car width the top edge shifts when leaning fully into a turn.
const LEAN_SKEW = 0.12;
// Share of the car width the top edge shifts when the car sits at a road edge.
const LANE_SKEW = 0.14;

export function projectRoadPoint(x, y, width, height) {
  const depth = Math.max(0, (y + 200) / (height + 200));
  const distance = depth / Math.max(0.1, 2 - depth);
  const scale = 1.35 * (ROAD_FAR_SCALE + (1 - ROAD_FAR_SCALE) * distance);

  return {
    x: width / 2 + (x - width / 2) * scale * ROAD_LATERAL_SCALE,
    y: height * (ROAD_HORIZON + (1 - ROAD_HORIZON) * distance),
    scale,
    size: scale,
  };
}

export function unprojectRoadY(y, height) {
  const distance = (y / height - ROAD_HORIZON) / (1 - ROAD_HORIZON);
  return ((2 * distance) / (1 + distance)) * (height + 200) - 200;
}

export default class PerspectiveRoad {
  constructor(scene) {
    this.scene = scene;
    this.textureKey = `${scene.sys.settings.key}-perspective-road`;
    this.texture = scene.textures.createCanvas(this.textureKey, 768, 768);
    this.context = this.texture.getContext();
    this.image = scene.add.image(0, 0, this.textureKey).setOrigin(0).setDepth(-1);
    this.roadImage = scene.textures.get('track').getSourceImage();
    this.borderImage = scene.textures.get('border').getSourceImage();
    createRearVehicleTextures(scene.textures);

    scene.track1.setVisible(false);
    scene.track2.setVisible(false);
    scene.walls.forEach((wall) => wall.setVisible(false));
    scene.events.on('postupdate', this.render, this);
    scene.events.once('shutdown', this.destroy, this);
  }

  // World y where road objects enter; depth 0 maps to the horizon.
  get spawnY() {
    return -200;
  }

  project(x, y, width, height) {
    return projectRoadPoint(x, y, width, height);
  }

  drawStrip(source, worldY, scrollY, tileHeight, left, top, width, height, flip = false) {
    const row = (((worldY - scrollY) % tileHeight) + tileHeight) % tileHeight;
    const sourceY = Math.min(source.height - 1, (row / tileHeight) * source.height);

    this.context.save();
    this.context.translate(left + (flip ? width : 0), top);
    this.context.scale(flip ? -1 : 1, 1);
    this.context.drawImage(source, 0, sourceY, source.width, 1, 0, 0, width, height);
    this.context.restore();
  }

  // Centre and size of a rear-view vehicle as drawn; the player car sits on its ground contact.
  rearFootprint(object, width, height) {
    const isRoadObject = this.scene.roadObjects.includes(object);
    const anchorY = isRoadObject ? object.y : object.y + object.displayHeight / 2;
    const contact = this.project(object.x, anchorY, width, height);
    const drawWidth = object.displayWidth * contact.size;
    const drawHeight = drawWidth * REAR_ASPECT;
    const centerY = isRoadObject ? contact.y : contact.y - drawHeight / 2;
    return { x: contact.x, y: centerY, size: contact.size, drawWidth, drawHeight };
  }

  drawRearVehicle(object, key, width, height) {
    const source = this.scene.textures.get(key).getSourceImage();
    const { x, y, drawWidth, drawHeight } = this.rearFootprint(object, width, height);
    const skew = (object.lean ?? 0) * LEAN_SKEW - (object.lanePosition ?? 0) * LANE_SKEW;

    this.context.save();
    this.context.translate(x, y);
    this.context.rotate(object.rotation);
    this.context.globalAlpha = object.alpha;
    if (object.texture.key.includes('Shield')) {
      const glow = this.context.createRadialGradient(0, 0, 0, 0, 0, drawWidth * 0.8);
      glow.addColorStop(0, 'rgba(255, 150, 210, 0.6)');
      glow.addColorStop(1, 'rgba(255, 150, 210, 0)');
      this.context.fillStyle = glow;
      this.context.fillRect(-drawWidth, -drawWidth, drawWidth * 2, drawWidth * 2);
    }
    if (skew === 0) {
      this.context.drawImage(source, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    } else {
      // Horizontal slices: the top shifts toward the vanishing point, the bottom stays put.
      const slices = 40;
      const sliceHeight = drawHeight / slices;
      for (let i = 0; i < slices; i++) {
        const shift = skew * drawWidth * (1 - i / slices);
        this.context.drawImage(
          source,
          0,
          (i * source.height) / slices,
          source.width,
          source.height / slices,
          -drawWidth / 2 + shift,
          -drawHeight / 2 + i * sliceHeight,
          drawWidth,
          sliceHeight + 0.5,
        );
      }
    }
    this.context.restore();
  }

  drawObject(object, width, height) {
    object.setVisible(false);
    const rearKey = REAR_VEHICLE_KEYS[object.texture.key];
    if (rearKey) {
      this.drawRearVehicle(object, rearKey, width, height);
      return;
    }
    const point = this.project(object.x, object.y, width, height);
    const frame = object.frame;
    const squash = Math.min(
      1,
      Math.max(SPRITE_MIN_SQUASH, SPRITE_GROUND_SQUASH * Math.sqrt(point.size)),
    );
    const drawWidth = object.displayWidth * point.size;
    const drawHeight = object.displayHeight * point.size * squash;

    this.context.save();
    this.context.translate(point.x, point.y);
    this.context.rotate(object.rotation);
    this.context.scale(object.flipX ? -1 : 1, object.flipY ? -1 : 1);
    this.context.globalAlpha = object.alpha;
    this.context.drawImage(
      frame.source.image,
      frame.cutX,
      frame.cutY,
      frame.cutWidth,
      frame.cutHeight,
      -drawWidth * object.originX,
      -drawHeight * object.originY,
      drawWidth,
      drawHeight,
    );
    this.context.restore();
  }

  render() {
    const { scene, context, texture } = this;
    const { width, height } = scene.scale;
    this.image.setDisplaySize(width, height);
    context.clearRect(0, 0, texture.width, texture.height);
    context.save();
    context.scale(texture.width / width, texture.height / height);

    this.drawRoad(width, height);

    const objects = [...scene.roadObjects, scene.car, scene.secondCar]
      .filter((object) => object?.active && !object.dead)
      .sort((first, second) => first.y - second.y);
    for (const object of objects) {
      this.drawObject(object, width, height);
    }

    for (const car of [scene.car, scene.secondCar]) {
      if (!car || car.dead) continue;
      const side = car.x === car.leftLimit ? -1 : 1;
      const footprint = this.rearFootprint(car, width, height);
      car.boundaryParticles
        .setPosition(
          footprint.x + side * (footprint.drawWidth / 2 - 15 * footprint.size),
          footprint.y + footprint.drawHeight * 0.25,
        )
        .setScale(footprint.size);
    }

    context.restore();
    texture.refresh();
  }

  drawRoad(width, height) {
    const { scene, texture } = this;
    const horizon = height * ROAD_HORIZON;
    const stripHeight = height / texture.height;
    const roadWidth = scene.track1.displayWidth;
    const borderWidth = scene.walls[0].displayWidth;

    for (let screenY = horizon; screenY < height; screenY += stripHeight) {
      const worldY = unprojectRoadY(screenY, height);
      const point = this.project(width / 2, worldY, width, height);
      const projectedWidth = roadWidth * point.scale * ROAD_LATERAL_SCALE;
      const projectedBorder = borderWidth * point.scale * ROAD_LATERAL_SCALE;
      const left = (width - projectedWidth) / 2;

      this.drawStrip(
        this.roadImage,
        worldY,
        scene.track1.y,
        scene.track1.displayHeight,
        left,
        screenY,
        projectedWidth,
        stripHeight + 0.5,
      );
      for (const side of [-1, 1]) {
        this.drawStrip(
          this.borderImage,
          worldY,
          scene.walls[0].y,
          scene.walls[0].displayHeight,
          side < 0 ? left - projectedBorder : left + projectedWidth,
          screenY,
          projectedBorder,
          stripHeight + 0.5,
          side > 0,
        );
      }
    }
  }

  destroy() {
    this.scene.events.off('postupdate', this.render, this);
    this.image.destroy();
    this.scene.textures.remove(this.textureKey);
  }
}
