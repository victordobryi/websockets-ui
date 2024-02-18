import { InMemoryDB } from './src/data/IMDB';
import { httpServer } from './src/http_server/index';
import { startWss } from './src/ws_server';
import 'dotenv/config';

const HTTP_PORT = process.env.HTTP_PORT || 8181;
const WSS_PORT = Number(process.env.WSS_PORT) || 3000;
const db = new InMemoryDB();

httpServer.listen(HTTP_PORT, () =>
  console.log(`Start static http server on the ${HTTP_PORT} port!`)
);

startWss(WSS_PORT, db);
