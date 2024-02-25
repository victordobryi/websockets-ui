import { Position } from '../game/game.interface';

export const getSurroundingPositions = (shipPositions: Position[]): Position[] => {
  const surroundingPositions: Position[] = [];

  for (const position of shipPositions) {
    const { x, y } = position;

    surroundingPositions.push({ x: x - 1, y: y - 1 });
    surroundingPositions.push({ x: x - 1, y });
    surroundingPositions.push({ x: x - 1, y: y + 1 });
    surroundingPositions.push({ x, y: y - 1 });
    surroundingPositions.push({ x, y: y + 1 });
    surroundingPositions.push({ x: x + 1, y: y - 1 });
    surroundingPositions.push({ x: x + 1, y });
    surroundingPositions.push({ x: x + 1, y: y + 1 });
  }

  return surroundingPositions;
};
