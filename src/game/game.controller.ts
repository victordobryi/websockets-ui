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
import { getShipPositions } from '../utils/getShipPositions';
import { getSurroundingPositions } from '../utils/getSurroundingPositions';
import { GAME_BOARD_SIZE } from '../utils/constants/game';

// TODO
// 1) Player не должен видеть свою комнату в списке доступных комнат
// 2) Если Player2 ливнул, то комната вновь появляется в списке доступных
// 3) Разнести методы по разным контроллерам. <300 строк
// 4) Make bot for single play (optionally)
// 5) Если поле уже было проатаковано, то мы не отправляем запрос (нет клика)

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
  };
  addShips = async (data: string) => {
    const { gameId, indexPlayer, ships }: AddShipData = JSON.parse(data);
    const player = await this.gameService.getPlayerById(String(indexPlayer));
    if (!player) throw new NotFoundError('Player not found');
    player.placeShips(ships);
    try {
      const game = await this.gameService.getGameById(String(gameId));
      if (!game) throw new NotFoundError('Game not found');
      game.isGameStarted() ? this.startGame(game) : null;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };
  startGame = async (game: Game) => {
    const players = [game.player1, game.player2];
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
  };

  attack = async (data: string) => {
    const { gameId, y, x, indexPlayer }: AttackData = JSON.parse(data);
    await this.processAttack(gameId, indexPlayer, x, y);
  };

  randomAttack = async (data: string) => {
    const { indexPlayer, gameId }: RandomAttackData = JSON.parse(data);
    const x = Math.floor(Math.random() * GAME_BOARD_SIZE);
    const y = Math.floor(Math.random() * GAME_BOARD_SIZE);
    await this.processAttack(gameId, indexPlayer, x, y);
  };

  private async processAttack(gameId: number, indexPlayer: number, x: number, y: number) {
    const game = await this.gameService.getGameById(String(gameId));
    if (!game) throw new NotFoundError('Game not found');
    if (game.turnPlayer.id === indexPlayer) {
      const opp = game.getOpponent();
      const isPositionAlreadyAttacked = opp.attackedPositions.some(
        (position) => position.x === x && position.y === y
      );
      if (isPositionAlreadyAttacked) {
        return;
      }
      const status = game.attack(x, y);
      const players = [game.player1, game.player2];
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
      this.sendMessageToPlayers(players, res);

      if (status === AttackStatus.KILLED) {
        const isGameFInished = game.isGameFinished(opp);
        if (isGameFInished) {
          const winner = game.winner;
          const looser = game.looser;
          await this.finishGame(winner!, looser!);
          return;
        }
        const ship = game.getShip(x, y);
        if (!ship) throw new NotFoundError('Ship not found');
        const shipPositions = getShipPositions(ship);

        const surroundingPositions = getSurroundingPositions(shipPositions);
        surroundingPositions.forEach(({ x, y }) => {
          game.addMissedShots({ x, y });
          const resData: AttackResponseData = {
            position: {
              x,
              y,
            },
            currentPlayer: indexPlayer,
            status: AttackStatus.MISS,
          };
          const res: AttackResponse = {
            type: RequestTypes.ATTACK,
            data: JSON.stringify(resData),
            id: 0,
          };
          this.sendMessageToPlayers(players, res);
        });
        shipPositions.forEach(({ x, y }) => {
          const resData: AttackResponseData = {
            position: {
              x,
              y,
            },
            currentPlayer: indexPlayer,
            status: AttackStatus.KILLED,
          };
          const res: AttackResponse = {
            type: RequestTypes.ATTACK,
            data: JSON.stringify(resData),
            id: 0,
          };
          this.sendMessageToPlayers(players, res);
        });
      }
      this.turn(game);
    }
  }

  turn = async (game: Game) => {
    const players = [game.player1, game.player2];
    const resData: TurnResponseData = {
      currentPlayer: game.turnPlayer.id,
    };
    const res: TurnResponse = {
      type: RequestTypes.TURN,
      data: JSON.stringify(resData),
      id: 0,
    };
    this.sendMessageToPlayers(players, res);
  };

  finishGame = async (winner: Player, looser: Player) => {
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
  };

  sendMessageToPlayers(players: Player[], res: any) {
    players.forEach((player) => {
      sockets.find(({ id }) => id === player.id)?.send(JSON.stringify(res));
    });
    return;
  }
}
