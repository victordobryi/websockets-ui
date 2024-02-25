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
  AttackStatus,
  CreateGameResData,
  CreateGameResponse,
  FinishGameData,
  FinishGameResponse,
  PlayerRegData,
  Position,
  RandomAttackData,
  RegResponse,
  RegResponseData,
  RequestTypes,
  Ship,
  ShipType,
  SinglePlayRequest,
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
import { getShipPositions } from '../utils/getShipPositions';
import { getSurroundingPositions } from '../utils/getSurroundingPositions';
import { GAME_BOARD_SIZE } from '../utils/constants/game';
import { getUniqueId } from '../utils/getUniqueId';
import { ShipPlacer } from '../ship/ship.controller';

// TODO
// 1) Если Player2 ливнул, то комната вновь появляется в списке доступных
// 3) При выстреле по клетке, где уже был выстрел, отменяется таймер
// 4) При входе в комнату мы удаляем комнату уже созданную нами
// 5) Класс для корабля со всеми методами

export class GameController {
  private gameService: GameService;
  private ws: SoketClient;
  constructor(ws: SoketClient) {
    this.gameService = new GameService();
    this.ws = ws;
  }

  async auth(data: string) {
    const { name, password }: PlayerRegData = JSON.parse(data);
    try {
      let player = await this.gameService.getPlayerByName(name);

      if (player && player.password !== password)
        throw new BadRequestError('Player with this name already exists');

      if (!player) {
        this.ws.id = getUniqueId();
        player = new Player(name, password, this.ws.id);
        await this.gameService.auth(player);
      }

      this.ws.id = player.id;

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
      await this.updateRoom();
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
  }
  async updateRoom(isForAll: boolean = false) {
    try {
      const availableRooms = await this.gameService.getAvailableRooms();
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
  }
  async updateWinners() {
    const players = await this.gameService.updateWinners();
    const winnersDto: Winners[] = getWinnersDto(players);
    const res: UpdateWinnersResponse = {
      type: RequestTypes.UPDATE_WINNERS,
      data: JSON.stringify(winnersDto),
      id: 0,
    };
    sockets.map((socket) => socket.send(JSON.stringify(res)));
  }
  async createRoom() {
    try {
      const player = await this.getPlayerById();
      const rooms = await this.gameService.getAllRooms();
      const existingRoomWithUser = rooms.find((room) =>
        room.roomUsers.some((user) => user.id === player.id)
      );
      if (existingRoomWithUser) throw new Error('User already exists in the room');

      const room = new Room(player);
      await this.gameService.createRoom(room);
      await this.updateRoom();
    } catch (error) {
      console.log(getErrorMessage(error));
    }
  }
  async addUserToRoom(data: string) {
    try {
      const { indexRoom }: AddUserToRoomReqData = JSON.parse(data);
      const room = await this.gameService.getRoomById(String(indexRoom));
      if (!room) throw new NotFoundError('Room not found');
      const player = await this.getPlayerById();

      room.addUser(player);
      await this.updateRoom();
      await this.createGame(room);
    } catch (error) {
      console.log(getErrorMessage(error));
    }
  }
  async createGame(room: Room) {
    const { roomUsers } = room;
    const game = new Game(roomUsers[0], roomUsers[1]);
    this.gameService.createGame(game);

    roomUsers.forEach((user) => {
      const resData: CreateGameResData = {
        idGame: game.idGame,
        idPlayer: user.id,
      };
      const res: CreateGameResponse = {
        type: RequestTypes.CREATE_GAME,
        data: JSON.stringify(resData),
        id: 0,
      };
      sockets.find(({ id }) => id === user.id)?.send(JSON.stringify(res));
    });
  }
  async addShips(data: string) {
    const { gameId, indexPlayer, ships }: AddShipData = JSON.parse(data);
    const player = await this.getPlayerById(String(indexPlayer));
    player.placeShips(ships);
    try {
      const game = await this.getGameById(String(gameId));
      game.isGameStarted() ? this.startGame(game) : null;
    } catch (error) {
      console.log(getErrorMessage(error));
    }
  }
  async startGame(game: Game) {
    const players = game.getPlayers();
    players.forEach((player) => {
      const resData: StartGameData = {
        ships: player.ships,
        currentPlayerIndex: player.id,
      };
      const res: StartGameResponse = {
        type: RequestTypes.START_GAME,
        data: JSON.stringify(resData),
        id: 0,
      };
      sockets.find(({ id }) => id === player.id)?.send(JSON.stringify(res));
    });
    await this.turn(game);
  }
  async attack(data: string) {
    const { gameId, y, x, indexPlayer }: AttackData = JSON.parse(data);
    await this.processAttack(gameId, indexPlayer, x, y);
  }
  async randomAttack(data: string) {
    const { indexPlayer, gameId }: RandomAttackData = JSON.parse(data);
    const x = Math.floor(Math.random() * GAME_BOARD_SIZE);
    const y = Math.floor(Math.random() * GAME_BOARD_SIZE);
    const game = await this.getGameById(String(gameId));
    if (game.isPositionAlreadyAttacked({ x, y })) {
      this.randomAttack(data);
    } else {
      await this.processAttack(gameId, indexPlayer, x, y);
    }
  }
  private async processAttack(gameId: number, indexPlayer: number, x: number, y: number) {
    try {
      const game = await this.getGameById(String(gameId));
      game.validateAttack(indexPlayer, { x, y });
      const status = game.attack(x, y);
      const players = game.getPlayers();
      this.sendAttackResponse(players, indexPlayer, x, y, status);

      if (game.isGameFinished()) {
        const { winner, looser } = game.getPlayersResult();
        await this.finishGame(winner!, looser!);
        return;
      }

      if (status === AttackStatus.KILLED) {
        const isGameFinished = game.isGameFinished();
        if (isGameFinished) {
          const { winner, looser } = game.getPlayersResult();
          await this.finishGame(winner!, looser!);
          return;
        }
        const ship = game.getShip(x, y);
        if (!ship) throw new NotFoundError('Ship not found');
        const shipPositions = getShipPositions(ship);

        const surroundingPositions = getSurroundingPositions(shipPositions);
        surroundingPositions.forEach(({ x, y }) => {
          game.addMissedShots({ x, y });
          this.sendAttackResponse(players, indexPlayer, x, y, AttackStatus.MISS);
        });
        shipPositions.forEach(({ x, y }) => {
          this.sendAttackResponse(players, indexPlayer, x, y, AttackStatus.KILLED);
        });
      }
      this.turn(game);
    } catch (error) {
      console.log(getErrorMessage(error));
    }
  }
  async turn(game: Game) {
    const players = game.getPlayers();
    const resData: TurnResponseData = {
      currentPlayer: game.turnPlayer.id,
    };
    const res: TurnResponse = {
      type: RequestTypes.TURN,
      data: JSON.stringify(resData),
      id: 0,
    };
    this.sendMessageToPlayers(players, res);
    if (game.turnPlayer.name === 'Bot') {
      const randomAttackData = {
        indexPlayer: game.turnPlayer.id,
        gameId: game.idGame,
      };
      await this.randomAttack(JSON.stringify(randomAttackData));
    }
  }
  async finishGame(winner: Player, looser: Player) {
    const resData: FinishGameData = {
      winPlayer: winner.id,
    };
    const res: FinishGameResponse = {
      type: RequestTypes.FINISH,
      data: JSON.stringify(resData),
      id: 0,
    };
    const players = [winner, looser];
    this.sendMessageToPlayers(players, res);

    await this.updateRoom();
  }
  sendMessageToPlayers(players: Player[], res: any) {
    players.forEach((player) => {
      sockets.find(({ id }) => id === player.id)?.send(JSON.stringify(res));
    });
    return;
  }
  async getPlayerById(id: string = String(this.ws.id)) {
    const player = await this.gameService.getPlayerById(id);
    if (!player) throw new NotFoundError('Player not found');
    return player;
  }
  async getGameById(id: string) {
    const game = await this.gameService.getGameById(id);
    if (!game) throw new NotFoundError('Game not found');
    return game;
  }
  sendAttackResponse(
    players: Player[],
    indexPlayer: number,
    x: number,
    y: number,
    status: AttackStatus
  ) {
    const resData: AttackResponseData = {
      position: { x, y },
      currentPlayer: indexPlayer,
      status,
    };
    const res: AttackResponse = {
      type: RequestTypes.ATTACK,
      data: JSON.stringify(resData),
      id: 0,
    };
    this.sendMessageToPlayers(players, res);
  }
  async singlePlayMode() {
    const player = await this.getPlayerById();
    const room = new Room(player);
    const bot = new Player('Bot', '123', getUniqueId());
    room.addUser(bot);
    const game = new Game(player, bot);
    this.gameService.createGame(game);
    const roomUsers = [player, bot];

    roomUsers.forEach((user) => {
      const resData: CreateGameResData = {
        idGame: game.idGame,
        idPlayer: user.id,
      };
      const res: CreateGameResponse = {
        type: RequestTypes.CREATE_GAME,
        data: JSON.stringify(resData),
        id: 0,
      };
      sockets.find(({ id }) => id === user.id)?.send(JSON.stringify(res));
    });
    const shipPlacer = new ShipPlacer();
    const ships = shipPlacer.placeShips();
    bot.placeShips(ships);
  }
}
