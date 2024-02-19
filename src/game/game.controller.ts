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
  SoketClient,
  StartGameData,
  StartGameResponse,
  TurnResponse,
  TurnResponseData,
  UpdateRoomResponse,
  UpdateWinnersResponse,
  Winners,
} from './game.interface';
import { GameService } from './game.service';
import { sockets } from '../ws_server';
import { Player } from '../player/player';

export class GameController {
  private gameService: GameService;
  private ws: SoketClient;
  constructor(ws: SoketClient) {
    this.gameService = new GameService();
    this.ws = ws;
  }

  auth = async (data: string) => {
    const { name, password }: PlayerRegData = JSON.parse(data);
    try {
      const player = await this.gameService.getPlayerByName(name);
      if (player) {
        throw new BadRequestError('Player with this name already exists');
      } else {
        const player = new Player(name, password, this.ws.id);
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
        await this.gameService.auth(player);
        await this.updateRoom();
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
  };
  updateRoom = async (isForAll: boolean = false) => {
    try {
      const rooms = await this.gameService.getAllRooms();
      const availableRooms = rooms.filter((room) => room.roomUsers.length < 2);
      const res: UpdateRoomResponse = {
        type: RequestTypes.UPDATE_ROOM,
        data: JSON.stringify(availableRooms),
        id: 0,
      };
      sockets.map((socket) => socket.send(JSON.stringify(res)));
      await this.updateWinners();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };
  updateWinners = async () => {
    const players = await this.gameService.updateWinners();
    const winnersDto: Winners[] = getWinnersDto(players);
    const res: UpdateWinnersResponse = {
      type: RequestTypes.UPDATE_WINNERS,
      data: JSON.stringify(winnersDto),
      id: 0,
    };
    sockets.map((socket) => socket.send(JSON.stringify(res)));
  };

  createRoom = async () => {
    const player = await this.gameService.getPlayerById(String(this.ws.id));
    if (!player) throw new NotFoundError('Player not found');
    const room = new Room(player);
    await this.gameService.createRoom(room);
    await this.updateRoom();
  };

  addUserToRoom = async (data: string) => {
    const { indexRoom }: AddUserToRoomReqData = JSON.parse(data);
    const room = await this.gameService.getRoomById(String(indexRoom));
    if (!room) throw new NotFoundError('Room not found');
    const player = await this.gameService.getPlayerById(String(this.ws.id));
    if (!player) throw new NotFoundError('Player not found');
    room.addUser(player);
    await this.updateRoom();
    await this.createGame(room);
  };

  createGame = async (room: Room) => {
    const { roomUsers } = room;
    const game = new Game(roomUsers[0], roomUsers[1]);
    const player = await this.gameService.getPlayerById(String(this.ws.id));
    if (!player) throw new NotFoundError('Player not found');
    const resData: CreateGameResData = {
      idGame: game.idGame,
      idPlayer: roomUsers[0].id,
    };
    const res: CreateGameResponse = {
      type: RequestTypes.CREATE_GAME,
      data: JSON.stringify(resData),
      id: 0,
    };
    this.gameService.createGame(game);
    sockets.map((socket) => socket.send(JSON.stringify(res)));
  };
  addShips = async (data: string) => {
    const { gameId, indexPlayer, ships }: AddShipData = JSON.parse(data);
    const player = await this.gameService.getPlayerById(String(this.ws.id));
    if (!player) throw new NotFoundError('Player not found');
    player.placeShips(ships);
    try {
      const game = await this.gameService.getGameById(String(gameId));
      if (!game) throw new NotFoundError('Game not found');
      game.isGameStarted() ? this.startGame() : null;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };
  startGame = async () => {
    const player = await this.gameService.getPlayerById(String(this.ws.id));
    if (!player) throw new NotFoundError('Player not found');
    const resData: StartGameData = {
      ships: player.ships,
      currentPlayerIndex: player.id,
    };
    const res: StartGameResponse = {
      type: RequestTypes.START_GAME,
      data: JSON.stringify(resData),
      id: 0,
    };
    sockets.map((socket) => socket.send(JSON.stringify(res)));
    await this.turn();
  };
  attack = async (data: string) => {
    const { gameId, y, x, indexPlayer }: AttackData = JSON.parse(data);
    const game = await this.gameService.getGameById(String(gameId));
    if (!game) throw new NotFoundError('Game not found');
    if (game.turnPlayer.id !== indexPlayer) {
      throw new BadRequestError('It is not your turn');
    }
    const attackResult = game.attack(x, y);
    let status: 'shot' | 'miss' | 'killed' = 'miss';
    if (attackResult === 'shot') {
      status = 'shot';
    } else if (attackResult === 'killed') {
      status = 'killed';
    }
    const resData: AttackResponseData = {
      position: {
        x,
        y,
      },
      currentPlayer: indexPlayer,
      status,
    };
    const res: AttackResponse = {
      type: RequestTypes.ATTACK,
      data: JSON.stringify(resData),
      id: 0,
    };
    this.turn();
    sockets.map((socket) => socket.send(JSON.stringify(res)));
  };
  randomAttack = async (data: string) => {
    const { indexPlayer, gameId }: RandomAttackData = JSON.parse(data);
    const game = await this.gameService.getGameById(String(gameId));
    const randomX = Math.floor(Math.random() * 10);
    const randomY = Math.floor(Math.random() * 10);
    if (!game) throw new NotFoundError('Game not found');
    if (game.turnPlayer.id !== indexPlayer) {
      throw new BadRequestError('It is not your turn');
    }
    const attackResult = game.attack(randomX, randomY);
    let status: 'shot' | 'miss' | 'killed' = 'miss';
    if (attackResult === 'shot') {
      status = 'shot';
    } else if (attackResult === 'killed') {
      status = 'killed';
    }

    const resData: AttackResponseData = {
      position: {
        x: randomX,
        y: randomY,
      },
      currentPlayer: indexPlayer,
      status,
    };
    const res: AttackResponse = {
      type: RequestTypes.ATTACK,
      data: JSON.stringify(resData),
      id: 0,
    };
    sockets.map((socket) => socket.send(JSON.stringify(res)));
  };

  turn = async () => {
    const resData: TurnResponseData = {
      // currentPlayer: globalGame.turnPlayer.id,
      currentPlayer: 1,
    };
    const res: TurnResponse = {
      type: RequestTypes.TURN,
      data: JSON.stringify(resData),
      id: 0,
    };
    sockets.map((socket) => socket.send(JSON.stringify(res)));
  };
  finishGame = async () => {
    const player = await this.gameService.getPlayerById(String(this.ws.id));
    if (!player) throw new NotFoundError('Player not found');
    const resData: FinishGameData = {
      winPlayer: player.id,
    };
    const res: FinishGameResponse = {
      type: RequestTypes.FINISH,
      data: JSON.stringify(resData),
      id: 0,
    };
    sockets.map((socket) => socket.send(JSON.stringify(res)));
  };
}
