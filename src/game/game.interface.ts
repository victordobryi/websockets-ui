import { Room } from '../room/room';

export enum RequestTypes {
  REG = 'reg',
  UPDATE_WINNERS = 'update_winners',
  CREATE_ROOM = 'create_room',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  CREATE_GAME = 'create_game',
  UPDATE_ROOM = 'update_room',
  ADD_SHIPS = 'add_ships',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'random_attack',
  TURN = 'turn',
  FINISH = 'finish',
}

export interface GameRequest {
  type: RequestTypes;
  data: string;
  id: number;
}

export interface PlayerRegData {
  name: string;
  password: string;
}

export interface RegRequest {
  type: RequestTypes.REG;
  data: PlayerRegData;
  id: number;
}

export interface RegResponseData {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export interface RegResponse {
  type: RequestTypes.REG;
  data: string;
  id: number;
}

export interface Winners {
  name: string;
  wins: number;
}

export interface UpdateWinnersResponse {
  type: RequestTypes.UPDATE_WINNERS;
  data: string;
  id: number;
}

export interface CreateRoomRequest {
  type: RequestTypes.CREATE_ROOM;
  data: string;
  id: number;
}

export interface AddUserToRoomReqData {
  indexRoom: number;
}

export interface AddUserToRoomRequest {
  type: RequestTypes.ADD_USER_TO_ROOM;
  data: AddUserToRoomReqData;
  id: number;
}

export interface CreateGameResData {
  idGame: number;
  idPlayer: number;
}

export interface CreateGameResponse {
  type: RequestTypes.CREATE_GAME;
  data: string;
  id: number;
}

export interface RoomUser {
  name: string;
  index: number;
}

export interface UsersRoom {
  roomId: number;
  roomUsers: RoomUser[];
}

export interface UpdateRoomResponse {
  type: RequestTypes.UPDATE_ROOM;
  data: string;
  id: number;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export interface AddShipData {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
}

export interface AddShipsRequest {
  type: RequestTypes.ADD_SHIPS;
  data: AddShipData;
  id: number;
}

export interface StartGameData {
  ships: Ship[];
  currentPlayerIndex: number;
}

export interface StartGameResponse {
  type: RequestTypes.START_GAME;
  data: string;
  id: number;
}

export interface AttackData {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}

export interface AttackRequest {
  type: RequestTypes.ATTACK;
  data: AttackData;
  id: number;
}

export interface AttackResponseData {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number;
  status: 'miss' | 'killed' | 'shot';
}

export interface AttackResponse {
  type: RequestTypes.ATTACK;
  data: string;
  id: number;
}

export interface RandomAttackData {
  gameId: number;
  indexPlayer: number;
}

export interface RandomAttackRequest {
  type: RequestTypes.RANDOM_ATTACK;
  data: RandomAttackData;
  id: number;
}

export interface TurnResponseData {
  currentPlayer: number;
}

export interface TurnResponse {
  type: RequestTypes.TURN;
  data: string;
  id: number;
}

export interface FinishGameData {
  winPlayer: number;
}

export interface FinishGameResponse {
  type: RequestTypes.FINISH;
  data: string;
  id: number;
}
