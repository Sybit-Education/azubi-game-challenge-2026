import { CAR_AUDIO_CONFIG } from './carAudioConfig.js';

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function mapCarToAudioPosition(sourceCar, listenerCar, roadWidth, viewportHeight) {
  const laneWidth = roadWidth / CAR_AUDIO_CONFIG.laneCount;
  const horizontalOffset = sourceCar.x - listenerCar.x;
  const forwardDistance = listenerCar.y - sourceCar.y;

  return {
    x: clamp(
      (horizontalOffset / laneWidth) * CAR_AUDIO_CONFIG.audioUnitsPerLane,
      -CAR_AUDIO_CONFIG.maxHorizontalUnits,
      CAR_AUDIO_CONFIG.maxHorizontalUnits,
    ),
    y: 0,
    z: -clamp(
      (forwardDistance / viewportHeight) * CAR_AUDIO_CONFIG.maxLongitudinalUnits,
      -CAR_AUDIO_CONFIG.maxLongitudinalUnits,
      CAR_AUDIO_CONFIG.maxLongitudinalUnits,
    ),
    forwardDistance,
  };
}

export function selectAudibleCars(
  candidates,
  listenerCar,
  viewportHeight,
  limit = CAR_AUDIO_CONFIG.maxSources,
) {
  const minimumDistance = -viewportHeight * CAR_AUDIO_CONFIG.audibleBehindFactor;
  const maximumDistance = viewportHeight * CAR_AUDIO_CONFIG.audibleAheadFactor;

  return candidates
    .filter(({ target }) => {
      const distance = listenerCar.y - target.y;
      return (
        target.active && !target.dead && distance >= minimumDistance && distance <= maximumDistance
      );
    })
    .sort(
      (left, right) =>
        Math.abs(listenerCar.y - left.target.y) - Math.abs(listenerCar.y - right.target.y),
    )
    .slice(0, limit);
}
