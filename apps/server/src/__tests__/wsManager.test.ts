import { describe, it, expect, afterEach } from 'vitest';
import http from 'http';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import { WSManager } from '../services/wsManager';

const JWT_SECRET = 'test-secret';

function createTestServer(): { server: http.Server; wsManager: WSManager; port: number } {
  const server = http.createServer();
  const wsManager = new WSManager(server, JWT_SECRET);

  return new Promise<{ server: http.Server; wsManager: WSManager; port: number }>((resolve) => {
    server.listen(0, () => {
      const address = server.address() as { port: number };
      resolve({ server, wsManager, port: address.port });
    });
  }) as any;
}

function createToken(payload = { id: '1', email: 'test@test.com', name: 'Test' }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

describe('WSManager', () => {
  let server: http.Server;
  let wsManager: WSManager;
  let port: number;

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('rejects connections without auth cookie', async () => {
    const result = await createTestServer();
    server = result.server;
    wsManager = result.wsManager;
    port = result.port;

    const ws = new WebSocket(`ws://localhost:${port}`);

    await new Promise<void>((resolve) => {
      ws.on('error', () => resolve());
      ws.on('close', () => resolve());
    });

    expect(ws.readyState).not.toBe(WebSocket.OPEN);
  });

  it('accepts connections with valid auth cookie', async () => {
    const result = await createTestServer();
    server = result.server;
    wsManager = result.wsManager;
    port = result.port;

    const token = createToken();
    const ws = new WebSocket(`ws://localhost:${port}`, {
      headers: { cookie: `token=${token}` },
    });

    await new Promise<void>((resolve, reject) => {
      ws.on('open', () => resolve());
      ws.on('error', (err) => reject(err));
    });

    expect(ws.readyState).toBe(WebSocket.OPEN);
    ws.close();
  });

  it('handles subscribe and broadcasts ticks', async () => {
    const result = await createTestServer();
    server = result.server;
    wsManager = result.wsManager;
    port = result.port;

    const token = createToken();
    const ws = new WebSocket(`ws://localhost:${port}`, {
      headers: { cookie: `token=${token}` },
    });

    await new Promise<void>((resolve) => ws.on('open', () => resolve()));

    // Subscribe
    ws.send(JSON.stringify({ type: 'subscribe', symbols: ['BTC-USD'] }));

    const subResponse = await new Promise<any>((resolve) => {
      ws.on('message', (data) => resolve(JSON.parse(data.toString())));
    });

    expect(subResponse.type).toBe('subscribed');
    expect(subResponse.symbols).toContain('BTC-USD');

    // Broadcast
    wsManager.broadcast([{
      symbol: 'BTC-USD',
      price: 67500,
      timestamp: Date.now(),
      change24h: 1.5,
      changeAbsolute: 1000,
      volume24h: 5000000,
      high24h: 68000,
      low24h: 66000,
    }]);

    const tickMsg = await new Promise<any>((resolve) => {
      ws.on('message', (data) => resolve(JSON.parse(data.toString())));
    });

    expect(tickMsg.type).toBe('tick');
    expect(tickMsg.data.symbol).toBe('BTC-USD');
    expect(tickMsg.data.price).toBe(67500);

    ws.close();
  });
});
