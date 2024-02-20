import { Player } from '../player/player';
import { getUniqueId } from '../utils/getUniqueId';

export class Game {
  idGame: number;
  player1: Player;
  player2: Player;
  turnPlayer: Player;
  winner: Player | null;
  constructor(player1: Player, player2: Player) {
    this.idGame = getUniqueId();
    this.player1 = player1;
    this.player2 = player2;
    this.turnPlayer = player1;
    this.winner = null;
  }

  attack(x: number, y: number): 'miss' | 'shot' | 'killed' {
    const opponent = this.turnPlayer === this.player1 ? this.player2 : this.player1;
    const result = opponent.receiveAttack({ x, y });

    if (result === 'killed') {
      if (this.isGameFinished(opponent)) {
        this.declareWinner(this.turnPlayer);
      }
    }

    if (result === 'miss') this.toggleTurn();

    return result;
  }

  private isGameFinished(player: Player): boolean {
    for (const ship of player.ships) {
      if (!player.isShipDestroyed(ship)) {
        return false;
      }
    }
    return true;
  }

  private declareWinner(player: Player) {
    this.winner = player;
  }

  private toggleTurn() {
    this.turnPlayer = this.turnPlayer === this.player1 ? this.player2 : this.player1;
  }

  isGameStarted() {
    return this.player1.isPlaced && this.player2.isPlaced;
  }
}
