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
    this.isUserExist(user.id);

    if (this.roomUsers.length >= 2) throw new Error('Room is Full');
    this.roomUsers.push(user);
  }

  isUserExist(userId: number) {
    const isExist = this.roomUsers.some((user) => user.id === userId);
    if (isExist) throw new Error('User already exists in the room');
    return true;
  }
}
