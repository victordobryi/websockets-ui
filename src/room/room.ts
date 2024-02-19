import { Player } from '../player/player';
import { getUniqueId } from '../utils/getUniqueId';

export class Room {
  roomId: number;
  roomUsers: Player[];
  constructor(user1: Player) {
    this.roomId = getUniqueId();
    this.roomUsers = [user1];
  }

  addUser(user: Player) {
    if (this.roomUsers.length >= 2) throw new Error('Room is Full');
    this.roomUsers.push(user);
  }
}
