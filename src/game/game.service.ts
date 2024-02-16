import { InMemoryDB } from '../data/IMDB';
import { Player } from '../player/player.interface';
import { Room } from '../room/room';
import { getErrorMessage } from '../utils/getErrorMessage';
import { Game } from './game';

export class GameService {
  private db: InMemoryDB;
  constructor() {
    this.db = new InMemoryDB();
  }

  async auth(data: Player) {
    this.db.save(data);
  }

  async updateWinners() {
    return this.db.getAll() as Player[];
  }

  async getPlayerById(id: string): Promise<Player | undefined> {
    try {
      return this.db.get(id) as Player;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
  async getPlayerByName(name: string): Promise<Player | undefined> {
    try {
      return this.db.get(name) as Player;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getRoomById(id: string): Promise<Player | undefined> {
    try {
      return this.db.get(id) as Player;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getGameById(id: string): Promise<Game | undefined> {
    try {
      return this.db.get(id) as Game;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getAllRooms(): Promise<Room[]> {
    try {
      return this.db.getAll() as Room[];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async createRoom(room: Room) {
    this.db.save(room);
  }
}
