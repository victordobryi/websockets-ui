import { Position, Ship } from '../game/game.interface';
import { getUniqueId } from '../utils/getUniqueId';

export class Player {
  id: number;
  password: string;
  wins: number;
  name: string;
  cells: Position[] = [];
  ships: Ship[] = [];
  constructor(password: string, name: string) {
    this.id = getUniqueId();
    this.password = password;
    this.wins = 0;
    this.name = name;
  }
}
