import { httpServer } from './src/http_server/index';
import WebSocket from 'ws';
import { startWss } from './src/ws_server';
import 'dotenv/config';
import { GameController } from './src/game/game.controller';

const WSS_PATH = process.env.WSS_PATH || 'ws://localhost:3000';
const HTTP_PORT = process.env.HTTP_PORT || 8181;
const WSS_PORT = Number(process.env.WSS_PORT) || 3000;

httpServer.listen(HTTP_PORT, () =>
  console.log(`Start static http server on the ${HTTP_PORT} port!`)
);

startWss(WSS_PORT);

export const ws = new WebSocket(WSS_PATH);
const gameController = new GameController();

ws.on('open', () => {
  console.log('Connected to server');
});

ws.on('message', (message: string) => {
  console.log(`Received message from server: ${message}`);
  if (JSON.parse(message).type) {
    gameController.handleMessage(message);
  } else {
    ws.send(message);
  }
});

ws.on('close', () => {
  console.log('Disconnected from server');
});
