import { RawData } from 'ws';
import { GameController } from './game.controller';
import { GameRequest, RequestTypes, SoketClient } from './game.interface';

export const gameRouter = (message: RawData, ws: SoketClient) => {
  try {
    const requestData: GameRequest = JSON.parse(message.toString());
    const { type, data } = requestData;
    const gameController = new GameController(ws);

    switch (type) {
      case RequestTypes.REG:
        return gameController.auth(data);
      case RequestTypes.CREATE_ROOM:
        return gameController.createRoom();
      case RequestTypes.ADD_USER_TO_ROOM:
        return gameController.addUserToRoom(data);
      case RequestTypes.ADD_SHIPS:
        return gameController.addShips(data);
      case RequestTypes.ATTACK:
        return gameController.attack(data);
      case RequestTypes.RANDOM_ATTACK:
        return gameController.randomAttack(data);
      case RequestTypes.SIGNLE_PLAY:
        return gameController.singlePlayMode(data);
      default:
        return { error: 'Unknown type of request' };
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Errror');
  }
};
