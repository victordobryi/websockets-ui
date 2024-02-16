import { getUniqueId } from '../utils/getUniqueId';

export class Player {
  id: number;
  password: string;
  wins: number;
  name: string;
  constructor(password: string, name: string) {
    this.id = getUniqueId();
    this.password = password;
    this.wins = 0;
    this.name = name;
  }
}
