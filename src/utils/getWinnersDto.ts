import { Winners } from '../game/game.interface';
import { Player } from '../player/player';

export const getWinnersDto = (data: Player[]): Winners[] =>
  data.map(({ name, wins }) => ({ name, wins }));
