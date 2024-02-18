import { Player } from '../player/player';
import { getUniqueId } from '../utils/getUniqueId';

export class Game {
  idGame: number;
  player1: Player;
  player2: Player;
  constructor(player1: Player, player2: Player) {
    this.idGame = getUniqueId();
    this.player1 = player1;
    this.player2 = player2;
  }
}
