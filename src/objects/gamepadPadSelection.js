function getPadIndex(gamepad, slot) {
  return Number.isInteger(gamepad?.index) ? gamepad.index : slot;
}

export function getPlayerPadIndexes(gamepads) {
  const pads = Array.from(gamepads ?? []);
  const connectedPads = pads
    .map((gamepad, slot) => ({ gamepad, index: getPadIndex(gamepad, slot) }))
    .filter(({ gamepad }) => gamepad && gamepad.connected !== false);
  const joyCon = connectedPads.find(({ gamepad }) => /joy[\s-]?con/i.test(gamepad.id ?? ''));

  if (!joyCon) {
    return { player1: 0, player2: 1 };
  }

  const secondPlayerPad = connectedPads.find(({ index }) => index !== joyCon.index);

  return {
    player1: joyCon.index,
    player2: secondPlayerPad?.index ?? (joyCon.index === 0 ? 1 : 0),
  };
}
