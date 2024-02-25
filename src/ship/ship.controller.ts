import { Position, Ship, ShipType } from '../game/game.interface';

export class ShipPlacer {
  private readonly BOARD_SIZE: number;
  private readonly MAX_RETRY: number;
  private board: boolean[][];

  constructor(boardSize: number = 10, maxRetry: number = 100) {
    this.BOARD_SIZE = boardSize;
    this.MAX_RETRY = maxRetry;
    this.board = this.initializeBoard();
  }

  private initializeBoard(): boolean[][] {
    return Array.from({ length: this.BOARD_SIZE }, () =>
      Array.from({ length: this.BOARD_SIZE }, () => false)
    );
  }

  private isPositionValid(x: number, y: number, length: number, direction: boolean): boolean {
    const isValidPosition = (x: number, y: number): boolean => {
      return x >= 0 && x < this.BOARD_SIZE && y >= 0 && y < this.BOARD_SIZE && !this.board[x][y];
    };

    if (direction) {
      if (y + length > this.BOARD_SIZE) return false;
      for (let i = y - 1; i <= y + length; i++) {
        if (!isValidPosition(x, i)) return false;
        if (
          (x - 1 >= 0 && this.board[x - 1][i]) ||
          (x + 1 < this.BOARD_SIZE && this.board[x + 1][i])
        )
          return false;
      }
    } else {
      if (x + length > this.BOARD_SIZE) return false;
      for (let i = x - 1; i <= x + length; i++) {
        if (!isValidPosition(i, y)) return false;
        if (
          (y - 1 >= 0 && this.board[i][y - 1]) ||
          (y + 1 < this.BOARD_SIZE && this.board[i][y + 1])
        )
          return false;
      }
    }
    return true;
  }

  private markPosition(x: number, y: number, length: number, direction: boolean) {
    if (direction) {
      for (let i = y; i < y + length; i++) {
        this.board[x][i] = true;
      }
    } else {
      for (let i = x; i < x + length; i++) {
        this.board[i][y] = true;
      }
    }
  }

  private getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * this.BOARD_SIZE),
      y: Math.floor(Math.random() * this.BOARD_SIZE),
    };
  }

  private getRandomDirection(): boolean {
    return Math.random() < 0.5;
  }

  private placeShip(length: number): Ship {
    let position: Position, direction: boolean;
    let retry = 0;
    do {
      position = this.getRandomPosition();
      direction = this.getRandomDirection();
      retry++;
      if (retry > this.MAX_RETRY) throw new Error('Failed to place ships within the board');
    } while (!this.isPositionValid(position.x, position.y, length, direction));

    this.markPosition(position.x, position.y, length, direction);

    return {
      position,
      direction,
      length,
      type: this.getShipType(length),
    };
  }

  private getShipType(length: number): ShipType {
    switch (length) {
      case 1:
        return 'small';
      case 2:
        return 'medium';
      case 3:
        return 'large';
      case 4:
        return 'huge';
      default:
        throw new Error('Invalid ship length');
    }
  }

  placeShips(): Ship[] {
    const ships: Ship[] = [];
    ships.push(this.placeShip(4));
    for (let i = 0; i < 2; i++) {
      ships.push(this.placeShip(3));
    }
    for (let i = 0; i < 3; i++) {
      ships.push(this.placeShip(2));
    }
    for (let i = 0; i < 4; i++) {
      ships.push(this.placeShip(1));
    }
    return ships;
  }
}
