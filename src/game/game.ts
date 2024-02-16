import { getUniqueId } from '../utils/getUniqueId';

export class Game {
  idGame: number;
  player1Id?: number;
  player2Id?: number;
  constructor(player1Id?: number, player2Id?: number) {
    this.idGame = getUniqueId();
    this.player1Id = player1Id;
    this.player2Id = player2Id;
  }
}
