import { Position, Ship } from '../game/game.interface';

export class Player {
  id: number;
  password: string;
  wins: number;
  name: string;
  cells: Position[] = [];
  ships: Ship[] = [];
  isPlaced: boolean = false;
  attackedPositions: Position[] = [];
  constructor(name: string, password: string, id: number) {
    this.id = id;
    this.password = password;
    this.wins = 0;
    this.name = name;
  }

  placeShips(ships: Ship[]) {
    this.ships = ships;
    this.isPlaced = true;
  }

  receiveAttack(position: Position): 'miss' | 'shot' | 'killed' {
    for (const ship of this.ships) {
      for (const shipPosition of this.getShipPositions(ship)) {
        if (shipPosition.x === position.x && shipPosition.y === position.y) {
          this.attackedPositions.push(position);
          if (this.isShipDestroyed(ship)) {
            return 'killed';
          } else {
            return 'shot';
          }
        }
      }
    }
    return 'miss';
  }

  private getShipPositions(ship: Ship): Position[] {
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
  }

  isShipDestroyed(ship: Ship): boolean {
    const shipPositions = this.getShipPositions(ship);
    for (const position of shipPositions) {
      if (!this.isPositionShot(position)) {
        return false;
      }
    }
    return true;
  }

  private isPositionShot(position: Position): boolean {
    for (const attackedPosition of this.attackedPositions) {
      if (attackedPosition.x === position.x && attackedPosition.y === position.y) {
        return true;
      }
    }
    return false;
  }
}
