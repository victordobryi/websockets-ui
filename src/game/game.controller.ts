import { WebSocket } from 'ws';
import { Player } from '../player/player';
import { Room } from '../room/room';
import { BadRequestError, NotFoundError } from '../utils/customErrors';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getWinnersDto } from '../utils/getWinnersDto';
import { Game } from './game';
import {
  AddShipData,
  AddUserToRoomReqData,
  AttackData,
  AttackResponse,
  AttackResponseData,
  CreateGameResData,
  CreateGameResponse,
  FinishGameData,
  FinishGameResponse,
  PlayerRegData,
  RandomAttackData,
  RegResponse,
  RegResponseData,
  RequestTypes,
  Ship,
  StartGameData,
  StartGameResponse,
  TurnResponse,
  TurnResponseData,
  UpdateRoomResponse,
  UpdateWinnersResponse,
  Winners,
} from './game.interface';
import { GameService } from './game.service';

export class GameController {
  private gameService: GameService;
  private ws: WebSocket;
  player: Player;
  ships: Ship[];
  constructor(ws: WebSocket) {
    this.gameService = new GameService();
    this.ws = ws;
    this.player = {} as Player;
    this.ships = [];
  }

  async auth(data: string) {
    const { name, password }: PlayerRegData = JSON.parse(data);
    try {
      const player = await this.gameService.getPlayerByName(name);
      if (player) {
        throw new BadRequestError('Player with this name already exists');
      } else {
        const player = new Player(name, password);
        this.player = player;
        const resData: RegResponseData = {
          name: player.name,
          index: player.id,
          error: false,
          errorText: '',
        };
        const res: RegResponse = {
          type: RequestTypes.REG,
          data: JSON.stringify(resData),
          id: 0,
        };
        this.ws.send(JSON.stringify(res));
      }
    } catch (error) {
      const resData: RegResponseData = {
        index: NaN,
        name: '',
        error: true,
        errorText: getErrorMessage(error),
      };
      const res: RegResponse = {
        type: RequestTypes.REG,
        data: JSON.stringify(resData),
        id: 0,
      };
      this.ws.send(JSON.stringify(res));
    }
    await this.updateRoom();
  }
  async updateRoom() {
    try {
      const rooms = await this.gameService.getAllRooms();
      const availableRooms = rooms.filter((room) => room.roomUsers.length < 2);
      const res: UpdateRoomResponse = {
        type: RequestTypes.UPDATE_ROOM,
        data: JSON.stringify(availableRooms),
        id: 0,
      };
      this.ws.send(JSON.stringify(res));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
    this.updateWinners();
  }
  async updateWinners() {
    const players = await this.gameService.updateWinners();
    const winnersDto: Winners[] = getWinnersDto(players);
    const res: UpdateWinnersResponse = {
      type: RequestTypes.UPDATE_WINNERS,
      data: JSON.stringify(winnersDto),
      id: 0,
    };
    this.ws.send(JSON.stringify(res));
  }
  async createRoom() {
    const room = new Room();
    await this.gameService.createRoom(room);
    await this.updateRoom();
  }
  async addUserToRoom(data: string) {
    const { indexRoom }: AddUserToRoomReqData = JSON.parse(data);
    const room = await this.gameService.getRoomById(String(indexRoom));
    this.ws.send(
      JSON.stringify({
        type: RequestTypes.ADD_USER_TO_ROOM,
        data: JSON.stringify({
          indexRoom: room?.index,
        }),
        id: 0,
      })
    );
    await this.updateRoom();
    await this.createGame();
  }
  async createGame() {
    const game = new Game(this.player.id);
    const resData: CreateGameResData = {
      idGame: game.idGame,
      idPlayer: this.player.id,
    };
    const res: CreateGameResponse = {
      type: RequestTypes.CREATE_GAME,
      data: JSON.stringify(resData),
      id: 0,
    };
    this.ws.send(JSON.stringify(res));
  }
  async addShips(data: string) {
    const { gameId, indexPlayer, ships }: AddShipData = JSON.parse(data);
    this.ships = ships;
    try {
      const game = await this.gameService.getGameById(String(gameId));
      if (!game) throw new NotFoundError('Game not found');
      this.ws.send(
        JSON.stringify({
          type: RequestTypes.ADD_SHIPS,
          data: JSON.stringify({
            gameId: game.idGame,
            ships,
            indexPlayer,
          }),
          id: 0,
        })
      );
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
  async startGame() {
    const resData: StartGameData = {
      ships: this.ships,
      currentPlayerIndex: this.player.id,
    };
    const res: StartGameResponse = {
      type: RequestTypes.START_GAME,
      data: JSON.stringify(resData),
      id: 0,
    };
    this.ws.send(JSON.stringify(res));
  }
  async attack(data: string) {
    const { gameId, y, x, indexPlayer }: AttackData = JSON.parse(data);
    const game = await this.gameService.getGameById(String(gameId));
    const resData: AttackResponseData = {
      position: {
        x,
        y,
      },
      currentPlayer: indexPlayer,
      status: 'miss',
    };
    const res: AttackResponse = {
      type: RequestTypes.ATTACK,
      data: JSON.stringify(resData),
      id: 0,
    };
    // TODO:
    // 1) attack status logic
    this.ws.send(JSON.stringify(res));
  }
  async randomAttack(data: string) {
    const { indexPlayer, gameId }: RandomAttackData = JSON.parse(data);

    this.ws.send(
      JSON.stringify({
        type: RequestTypes.RANDOM_ATTACK,
        data: JSON.stringify({ indexPlayer, gameId }),
        id: 0,
      })
    );
  }
  async turn() {
    const resData: TurnResponseData = {
      currentPlayer: this.player.id,
    };
    const res: TurnResponse = {
      type: RequestTypes.TURN,
      data: JSON.stringify(resData),
      id: 0,
    };
    this.ws.send(JSON.stringify(res));
  }
  async finishGame() {
    const resData: FinishGameData = {
      winPlayer: this.player.id,
    };
    const res: FinishGameResponse = {
      type: RequestTypes.FINISH,
      data: JSON.stringify(resData),
      id: 0,
    };
    this.ws.send(JSON.stringify(res));
  }
}
