import { InMemoryDB } from '../data/IMDB';

export class GameService {
  private db: InMemoryDB;
  constructor() {
    this.db = new InMemoryDB();
  }

  async auth(data: any) {
    this.db.save(data);
  }

  async createGame(data: any) {
    console.log(data, 'createGame');
  }

  async startGame(data: any) {
    console.log(data, 'startGame');
  }

  async turn(data: any) {
    console.log(data, 'turn');
  }

  async attack(data: any) {
    console.log(data, 'attack');
  }

  async finish(data: any) {
    console.log(data, 'finish');
  }

  async updateRoom(data: any) {
    console.log(data, 'updateRoom');
  }

  async updateWinners(data: any) {
    console.log(data, 'updateWinners');
  }
}
