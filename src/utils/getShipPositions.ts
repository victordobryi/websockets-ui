import { Position, Ship } from '../game/game.interface';

export const getShipPositions = (ship: Ship): Position[] => {
  const positions: Position[] = [];
  let { x, y } = ship.position;
  const { length, direction } = ship;

  for (let i = 0; i < length; i++) {
    positions.push({ x, y });
    if (direction) {
      y++;
    } else {
      x++;
    }
  }
  return positions;
};
