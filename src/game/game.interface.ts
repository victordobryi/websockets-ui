enum RequestTypes {
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

export interface RegRequest {
  type: RequestTypes.REG;
  data: {
    name: string;
    password: string;
  };
  id: number;
}

export interface RegResponse {
  type: RequestTypes.REG;
  data: {
    name: string;
    index: number;
    error: boolean;
    errorText: string;
  };
  id: number;
}

interface Winners {
  name: string;
  wins: number;
}

export interface UpdateWinnersResponse {
  type: RequestTypes.UPDATE_WINNERS;
  data: Winners[];
  id: number;
}

export interface CreateRoomRequest {
  type: RequestTypes.CREATE_ROOM;
  data: string;
  id: number;
}

export interface AddUserToRoomRequest {
  type: RequestTypes.ADD_USER_TO_ROOM;
  data: {
    indexRoom: number;
  };
  id: number;
}

export interface CreateGameResponse {
  type: RequestTypes.CREATE_GAME;
  data: {
    idGame: number;
    idPlayer: number;
  };
  id: number;
}

interface RoomUser {
  name: string;
  index: number;
}

interface UsersRoom {
  roomId: number;
  roomUsers: RoomUser[];
}

export interface UpdateRoomResponse {
  type: RequestTypes.UPDATE_ROOM;
  data: UsersRoom[];
  id: number;
}

interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

interface AddShipData {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
}

export interface AddShipRequest {
  type: RequestTypes.ADD_SHIPS;
  data: AddShipData;
  id: number;
}

interface StartGameData {
  ships: Ship[];
  currentPlayerIndex: number;
}

export interface StartGameResponse {
  type: RequestTypes.START_GAME;
  data: StartGameData;
  id: number;
}

interface AttackData {
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

interface AttackResponseData {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number;
  status: 'miss' | 'killed' | 'shot';
}

export interface AttackResponse {
  type: RequestTypes.ATTACK;
  data: AttackResponseData;
  id: number;
}

export interface RandomAttackRequest {
  type: RequestTypes.RANDOM_ATTACK;
  data: {
    gameId: number;
    indexPlayer: number;
  };
  id: number;
}

export interface TurnRequest {
  type: RequestTypes.TURN;
  data: {
    currentPlayer: number;
  };
  id: number;
}

export interface FinishGameRequest {
  type: RequestTypes.FINISH;
  data: {
    winPlayer: number;
  };
  id: number;
}
