import { GameService } from './game.service';

export class GameController {
  private gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  handleMessage(message: string) {
    try {
      const requestData = JSON.parse(message);
      const { type, ...data } = requestData;
      switch (type) {
        case 'reg':
          return this.gameService.auth(data);
        case 'create_game':
          return this.gameService.createGame(data);
        case 'start_game':
          return this.gameService.startGame(data);
        case 'turn':
          return this.gameService.turn(data);
        case 'attack':
          return this.gameService.attack(data);
        case 'finish':
          return this.gameService.finish(data);
        case 'update_room':
          return this.gameService.updateRoom(data);
        case 'update_winners':
          return this.gameService.updateWinners(data);
        default:
          return { error: 'Unknown type of request' };
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Errror');
    }
  }
}
