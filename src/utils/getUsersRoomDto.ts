import { UsersRoom } from '../game/game.interface';
import { Room } from '../room/room';

export const getUsersRoomDto = (data: Room[]): UsersRoom[] =>
  data.map(({ roomId, roomUsers }) => ({ roomId, roomUsers }));
