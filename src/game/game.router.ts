import { RawData, WebSocket } from 'ws';
import { GameController } from './game.controller';
import { GameRequest, RequestTypes } from './game.interface';
import { InMemoryDB } from '../data/IMDB';

export const gameRouter = (message: RawData, ws: WebSocket, db: InMemoryDB) => {
  try {
    const requestData: GameRequest = JSON.parse(message.toString());
    const { type, data } = requestData;
    const gameController = new GameController(ws, db);

    switch (type) {
      case RequestTypes.REG:
        return gameController.auth(data);
      case RequestTypes.UPDATE_WINNERS:
        return gameController.updateWinners();
      case RequestTypes.CREATE_ROOM:
        return gameController.createRoom();
      case RequestTypes.ADD_USER_TO_ROOM:
        return gameController.addUserToRoom(data);
      case RequestTypes.CREATE_GAME:
        return gameController.createGame();
      case RequestTypes.UPDATE_ROOM:
        return gameController.updateRoom();
      case RequestTypes.ADD_SHIPS:
        return gameController.addShips(data);
      case RequestTypes.START_GAME:
        return gameController.startGame();
      case RequestTypes.ATTACK:
        return gameController.attack(data);
      case RequestTypes.RANDOM_ATTACK:
        return gameController.randomAttack(data);
      case RequestTypes.TURN:
        return gameController.turn();
      case RequestTypes.FINISH:
        return gameController.finishGame();
      default:
        return { error: 'Unknown type of request' };
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Errror');
  }
};
