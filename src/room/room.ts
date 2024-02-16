import { RoomUser } from '../game/game.interface';
import { getUniqueId } from '../utils/getUniqueId';

export class Room {
  roomId: number;
  roomUsers: RoomUser[];
  constructor() {
    this.roomId = getUniqueId();
    this.roomUsers = [];
  }
}
