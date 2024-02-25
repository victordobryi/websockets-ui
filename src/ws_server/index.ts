import { WebSocketServer } from 'ws';
import { gameRouter } from '../game/game.router';
import { SoketClient } from '../game/game.interface';

export const sockets: SoketClient[] = [];

export const startWss = (port: number) => {
  const wss = new WebSocketServer({ port });
  wss.on('connection', (ws: SoketClient) => {
    console.log('New client connected');
    sockets.push(ws);

    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
      gameRouter(message, ws);
    });

    ws.on('close', () => {
      const index = sockets.indexOf(ws);
      if (index !== -1) sockets.splice(index, 1);

      console.log('Client disconnected');
    });
  });
};
