import WebSocket, { WebSocketServer } from 'ws';
import { gameRouter } from '../game/game.router';

export const startWss = (port: number) => {
  const wss = new WebSocketServer({ port });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
      gameRouter(message, ws);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};
