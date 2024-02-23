import { Player } from '../player/player';
import { getUniqueId } from '../utils/getUniqueId';
import { AttackStatus, Position } from './game.interface';

export class Game {
  idGame: number;
  player1: Player;
  player2: Player;
  turnPlayer: Player;
  winner: Player | null;
  looser: Player | null;
  constructor(player1: Player, player2: Player) {
    this.idGame = getUniqueId();
    this.player1 = player1;
    this.player2 = player2;
    this.turnPlayer = player1;
    this.winner = null;
    this.looser = null;
  }

  attack(x: number, y: number): AttackStatus {
    const opponent = this.turnPlayer === this.player1 ? this.player2 : this.player1;
    const result = opponent.receiveAttack({ x, y });

    if (result === AttackStatus.KILLED) {
      if (this.isGameFinished(opponent)) {
        this.declareWinner(this.turnPlayer);
        this.declareLooser(opponent);
        this.clearPlayersGameData();
      }
    }

    if (result === AttackStatus.MISS) this.toggleTurn();

    return result;
  }

  getShip(x: number, y: number) {
    const opponent = this.turnPlayer === this.player1 ? this.player2 : this.player1;
    return opponent.getShip({ x, y });
  }

  private clearPlayersGameData() {
    this.player1.clearGameData();
    this.player2.clearGameData();
  }

  isGameFinished(player: Player): boolean {
    for (const ship of player.ships) {
      if (!player.isShipDestroyed(ship)) {
        return false;
      }
    }
    return true;
  }

  private declareWinner(player: Player) {
    this.winner = player;
    player.wins++;
  }

  private declareLooser(player: Player) {
    this.looser = player;
  }

  private toggleTurn() {
    this.turnPlayer = this.turnPlayer === this.player1 ? this.player2 : this.player1;
  }

  isGameStarted() {
    return this.player1.isPlaced && this.player2.isPlaced;
  }

  getOpponent() {
    return this.turnPlayer === this.player1 ? this.player2 : this.player1;
  }

  addMissedShots(position: Position) {
    this.getOpponent().addMissedShots(position);
  }

  getPlayers() {
    return [this.player1, this.player2];
  }
}
