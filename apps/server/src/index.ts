import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { config } from './config';
import { authRouter } from './routes/auth';
import { tickersRouter } from './routes/tickers';
import { PriceGenerator } from './services/priceGenerator';
import { CacheStore } from './services/cacheStore';
import { WSManager } from './services/wsManager';

const app: ReturnType<typeof express> = express();
const server = http.createServer(app);

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const cacheStore = new CacheStore();
const priceGenerator = new PriceGenerator(cacheStore);
const wsManager = new WSManager(server, config.jwtSecret);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/auth', authRouter);
app.use('/api/tickers', tickersRouter(cacheStore, priceGenerator));

priceGenerator.on('tick', (updates) => {
  wsManager.broadcast(updates);
});

priceGenerator.start();

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export { app, server };
