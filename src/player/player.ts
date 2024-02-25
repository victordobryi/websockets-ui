import { AttackStatus, Position, Ship } from '../game/game.interface';
import { getShipPositions } from '../utils/getShipPositions';

export class Player {
  id: number;
  password: string;
  wins: number;
  name: string;
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

  getShip(position: Position): Ship | null {
    for (const ship of this.ships) {
      for (const shipPosition of getShipPositions(ship)) {
        if (shipPosition.x === position.x && shipPosition.y === position.y) {
          return ship;
        }
      }
    }
    return null;
  }

  receiveAttack(position: Position): AttackStatus {
    this.attackedPositions.push(position);
    for (const ship of this.ships) {
      for (const shipPosition of getShipPositions(ship)) {
        if (shipPosition.x === position.x && shipPosition.y === position.y) {
          if (this.isShipDestroyed(ship)) {
            return AttackStatus.KILLED;
          } else {
            return AttackStatus.SHOT;
          }
        }
      }
    }
    return AttackStatus.MISS;
  }

  isShipDestroyed(ship: Ship): boolean {
    const shipPositions = getShipPositions(ship);
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

  addMissedShots(position: Position) {
    this.attackedPositions.push(position);
  }

  clearGameData() {
    this.ships = [];
    this.isPlaced = false;
    this.attackedPositions = [];
  }
}
