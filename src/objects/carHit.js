export function resolveCarHit({ dead, invulnerable, shieldActive, extraLifeActive }) {
  if (dead || invulnerable || shieldActive) return 'ignored';
  if (extraLifeActive) return 'extra-life';
  return 'fatal';
}

export function handleCarHit({
  car,
  invulnerable,
  shieldActive,
  extraLifeActive,
  onEffectiveHit,
  useExtraLife,
  gameOver,
}) {
  const outcome = resolveCarHit({
    dead: car.dead,
    invulnerable,
    shieldActive,
    extraLifeActive,
  });

  if (outcome === 'ignored') return outcome;

  onEffectiveHit?.(car);

  if (outcome === 'extra-life') {
    useExtraLife(car);
  } else {
    gameOver(car);
  }

  return outcome;
}
