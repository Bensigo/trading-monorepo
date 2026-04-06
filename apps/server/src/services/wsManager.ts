import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import jwt from 'jsonwebtoken';
import type { PriceUpdate, WSClientMessage, WSServerMessage } from '@repo/shared';
import { z } from 'zod';

const clientMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('subscribe'), symbols: z.array(z.string()) }),
  z.object({ type: z.literal('unsubscribe'), symbols: z.array(z.string()) }),
]);

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) {
      cookies[name] = rest.join('=');
    }
  });
  return cookies;
}

export class WSManager {
  private wss: WebSocketServer;
  private subscriptions = new Map<WebSocket, Set<string>>();

  constructor(server: Server, jwtSecret: string) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      const cookies = parseCookies(request.headers.cookie || '');
      const token = cookies.token;

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      try {
        const user = jwt.verify(token, jwtSecret);
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          (ws as any).user = user;
          this.wss.emit('connection', ws, request);
        });
      } catch {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws: WebSocket) => {
      this.subscriptions.set(ws, new Set());

      ws.on('message', (data: Buffer) => {
        try {
          const raw = JSON.parse(data.toString());
          const message = clientMessageSchema.parse(raw) as WSClientMessage;
          this.handleMessage(ws, message);
        } catch {
          const errorMsg: WSServerMessage = { type: 'error', message: 'Invalid message format' };
          ws.send(JSON.stringify(errorMsg));
        }
      });

      ws.on('close', () => {
        this.subscriptions.delete(ws);
      });

      ws.on('error', () => {
        this.subscriptions.delete(ws);
      });

      // Ping/pong heartbeat
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on('close', () => clearInterval(pingInterval));
    });
  }

  private handleMessage(ws: WebSocket, message: WSClientMessage): void {
    const subs = this.subscriptions.get(ws);
    if (!subs) return;

    if (message.type === 'subscribe') {
      message.symbols.forEach(s => subs.add(s));
      const response: WSServerMessage = { type: 'subscribed', symbols: Array.from(subs) };
      ws.send(JSON.stringify(response));
    } else if (message.type === 'unsubscribe') {
      message.symbols.forEach(s => subs.delete(s));
      const response: WSServerMessage = { type: 'subscribed', symbols: Array.from(subs) };
      ws.send(JSON.stringify(response));
    }
  }

  broadcast(updates: PriceUpdate[]): void {
    for (const [ws, subs] of this.subscriptions) {
      if (ws.readyState !== WebSocket.OPEN) continue;

      for (const update of updates) {
        if (subs.has(update.symbol)) {
          const message: WSServerMessage = { type: 'tick', data: update };
          ws.send(JSON.stringify(message));
        }
      }
    }
  }

  getConnectionCount(): number {
    return this.subscriptions.size;
  }
}
