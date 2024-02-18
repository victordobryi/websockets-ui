import WebSocket, { WebSocketServer } from 'ws';
import { gameRouter } from '../game/game.router';
import { InMemoryDB } from '../data/IMDB';

export const sockets: WebSocket[] = [];

export const startWss = (port: number, db: InMemoryDB) => {
  const wss = new WebSocketServer({ port });
  wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');
    sockets.push(ws);
    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
      gameRouter(message, ws, db);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};
