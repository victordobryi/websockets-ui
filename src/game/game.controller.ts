import { WebSocket } from 'ws';
import { Player } from '../player/player';
import { Room } from '../room/room';
import { BadRequestError, NotFoundError } from '../utils/customErrors';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getWinnersDto } from '../utils/getWinnersDto';
import { Game } from './game';
import {
  AddShipsRequest,
  AttackRequest,
  AttackResponse,
  CreateGameResponse,
  FinishGameResponse,
  PlayerRegData,
  RandomAttackRequest,
  RequestTypes,
  TurnResponse,
} from './game.interface';
import { GameService } from './game.service';

export class GameController {
  private gameService: GameService;
  private ws: WebSocket;
  constructor(ws: WebSocket) {
    this.gameService = new GameService();
    this.ws = ws;
  }

  async auth(data: string) {
    const { name, password }: PlayerRegData = JSON.parse(String(data));

    try {
      const player = await this.gameService.getPlayerByName(name);
      if (player) {
        throw new BadRequestError('Player with this name already exists');
      } else {
        const player = new Player(name, password);
        this.ws.send(
          JSON.stringify({
            type: RequestTypes.REG,
            data: JSON.stringify({
              name: player.name,
              index: player.id,
              error: false,
              errorText: '',
            }),
            id: 0,
          })
        );
      }
    } catch (error) {
      this.ws.send(
        JSON.stringify({
          type: RequestTypes.REG,
          data: {
            index: NaN,
            name: '',
            error: true,
            errorText: getErrorMessage(error),
          },
          id: 0,
        })
      );
    }
    this.updateRoom();
  }
  async updateRoom() {
    try {
      const rooms = await this.gameService.getAllRooms();
      const availableRooms = JSON.stringify(rooms.filter((room) => room.roomUsers.length < 2));
      this.ws.send(
        JSON.stringify({
          type: RequestTypes.UPDATE_ROOM,
          data: availableRooms,
          id: 0,
        })
      );
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
    this.updateWinners();
  }
  async updateWinners() {
    const players = await this.gameService.updateWinners();
    const winnersDto = JSON.stringify(getWinnersDto(players));
    this.ws.send(
      JSON.stringify({
        type: RequestTypes.UPDATE_WINNERS,
        data: winnersDto,
        id: 0,
      })
    );
  }
  async createRoom() {
    const room = new Room();
    await this.gameService.createRoom(room);
    this.updateRoom();
  }
  async addUserToRoom({ data }: any) {
    const room = await this.gameService.getRoomById(String(data.indexRoom));
    // this.ws.send({
    //   type: RequestTypes.ADD_USER_TO_ROOM,
    //   data: JSON.stringify({
    //     indexRoom: room?.index,
    //   }),
    //   id: 0,
    // });
  }
  async createGame(playerId: number): Promise<CreateGameResponse> {
    const game = new Game(playerId);

    return {
      type: RequestTypes.CREATE_GAME,
      data: {
        idGame: game.idGame,
        idPlayer: playerId,
      },
      id: 0,
    };
  }

  async addShips(data: AddShipsRequest) {
    try {
      const game = await this.gameService.getGameById(String(data.data.gameId));
      if (!game) throw new NotFoundError('Game not found');

      return {
        type: RequestTypes.ADD_SHIPS,
        data: {
          gameId: game.idGame,
          ...data,
        },
        id: 0,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async startGame() {}

  async attack(data: AttackRequest): Promise<AttackResponse> {
    return {
      type: RequestTypes.ATTACK,
      data: {
        position: {
          x: data.data.x,
          y: data.data.y,
        },
        currentPlayer: data.data.indexPlayer,
        status: 'miss',
      },
      id: 0,
    };
  }

  async randomAttack(data: RandomAttackRequest) {
    return data;
  }

  async turn(): Promise<TurnResponse> {
    return {
      type: RequestTypes.TURN,
      data: {
        currentPlayer: 0,
      },
      id: 0,
    };
  }

  async finishGame(): Promise<FinishGameResponse> {
    return {
      type: RequestTypes.FINISH,
      data: {
        winPlayer: 0,
      },
      id: 0,
    };
  }
}
