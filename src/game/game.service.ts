import { InMemoryDB } from '../data/IMDB';
import { Player } from '../player/player';
import { Room } from '../room/room';
import { getErrorMessage } from '../utils/getErrorMessage';
import { Game } from './game';
import { db } from '../..';

export class GameService {
  private db: InMemoryDB;
  constructor() {
    this.db = db;
  }

  async auth(data: Player) {
    this.db.save({ type: 'player', data, id: data.id });
  }

  async getAll() {
    return this.db.getAll();
  }

  async updateWinners(): Promise<Player[]> {
    try {
      const allPlayers = await this.db.getAll();
      return allPlayers
        .filter((data: any) => data.type === 'player' && data.wins >= 1)
        .map((data: any) => data.data) as Player[];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getPlayerById(id: string): Promise<Player | undefined> {
    try {
      const entry = await this.db.get(id);
      if (entry && entry.type === 'player') {
        return entry.data;
      }
      return undefined;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getPlayerByName(name: string): Promise<Player | undefined> {
    try {
      const allPlayers = await this.db.getAll();
      const playerEntry = allPlayers.find(
        (data: any) => data.type === 'player' && data.data.name === name
      );
      return playerEntry?.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getGameById(id: string): Promise<Game | undefined> {
    try {
      const entry = await this.db.get(id);
      if (entry && entry.type === 'game') {
        return entry.game;
      }
      return undefined;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    try {
      const entry = await this.db.get(id);
      if (entry && entry.type === 'room') {
        return entry.room;
      }
      return undefined;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getAllRooms(): Promise<Room[]> {
    try {
      const allData = await this.db.getAll();
      const rooms = allData
        .filter((data: any) => data.type === 'room')
        .map((data: any) => data.room) as Room[];
      return rooms;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async createRoom(room: Room) {
    return this.db.save({ type: 'room', room, id: room.roomId });
  }

  async createGame(game: Game) {
    return this.db.save({ type: 'game', game, id: game.idGame });
  }
}
