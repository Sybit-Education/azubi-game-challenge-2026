export const MAX_PICKUP_WARNING_SECONDS = 7;
export const ICE_WARNING_SECONDS = 5;

export function getPickupWarningSeconds(speed) {
  // RoadObject accelerates from 700 to 1600; add up to two seconds of lead time.
  const progress = Math.max(0, Math.min(1, (speed - 700) / (1600 - 700)));
  return 5 + (MAX_PICKUP_WARNING_SECONDS - 5) * progress;
}
