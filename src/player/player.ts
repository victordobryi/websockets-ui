import { HitStatus, Position, Ship } from '../game/game.interface';

export class Player {
  id: number;
  password: string;
  wins: number;
  name: string;
  cells: Position[] = [];
  ships: Ship[] = [];
  isPlaced: boolean = false;
  constructor(name: string, password: string, id: number) {
    this.id = id;
    this.password = password;
    this.wins = 0;
    this.name = name;
  }

  setUserData(name: string, password: string) {
    this.name = name;
    this.password = password;
  }

  placeShips(ships: Ship[]) {
    this.ships = ships;
    this.isPlaced = true;
  }

  receiveAttack(position: Position): 'miss' | 'shot' | 'killed' {
    for (const ship of this.ships) {
      for (const shipPosition of this.getShipPositions(ship)) {
        if (shipPosition.position.x === position.x && shipPosition.position.y === position.y) {
          shipPosition.hit = true;
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

  private getShipPositions(ship: Ship): HitStatus[] {
    const positions: HitStatus[] = [];
    let { x, y } = ship.position;
    const { length, direction } = ship;
    for (let i = 0; i < length; i++) {
      positions.push({ position: { x, y }, hit: false });
      if (direction) {
        x++;
      } else {
        y++;
      }
    }
    return positions;
  }

  isShipDestroyed(ship: Ship): boolean {
    for (const position of this.getShipPositions(ship)) {
      if (!position.hit) {
        return false;
      }
    }
    return true;
  }
}
