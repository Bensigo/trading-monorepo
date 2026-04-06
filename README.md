# Real-Time Trading Dashboard

This repository contains a fullstack trading dashboard built for the real-time dashboard coding challenge.

It includes:

- a Node.js backend that simulates market data
- a React + TypeScript frontend that renders live prices and charts
- a shared package for types and constants
- Docker support for running the app as separate services

The app streams mock prices for a small watchlist of crypto and stock tickers and lets the user inspect recent price history for the selected instrument.

## What Is Implemented

### Backend

- REST API to list available tickers
- REST API to fetch mocked historical candle data
- WebSocket endpoint for real-time price updates
- in-memory cache for generated price history
- mocked authentication endpoints using JWT cookies
- unit tests for cache, price generation, and WebSocket manager logic

### Frontend

- watchlist with live price updates
- real-time chart for the selected ticker
- ticker switching
- responsive layout for desktop and mobile
- loading states for historical data
- mocked sign-in flow
- price alert UI for authenticated users

## Tickers

The demo currently includes 6 instruments:

- BTC-USD
- ETH-USD
- SOL-USD
- AAPL
- TSLA
- NVDA

## Project Structure

```text
.
├── apps/
│   ├── server/     # Express + ws backend
│   └── web/        # React + Vite frontend
├── packages/
│   └── shared/     # shared types and constants
├── docker-compose.yml
├── package.json
└── turbo.json
```

## Tech Stack

### Backend

- Node.js
- Express
- ws
- TypeScript
- Vitest

### Frontend

- React
- TypeScript
- Vite
- Recharts
- Zustand
- TanStack Query
- Tailwind CSS

### Workspace

- pnpm
- Turborepo
- Docker

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install

```bash
pnpm install
```

### Run the app

```bash
pnpm dev
```

Services:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3001`

## Docker

Run both services with Docker Compose:

```bash
docker-compose up --build
```

Services:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3001`

## Demo Credentials

The dashboard is readable without signing in.

To test the mocked auth flow and alerts:

```text
Email: trader@demo.com
Password: password123
```

## API Overview

### REST

- `GET /api/health`
- `GET /api/tickers`
- `GET /api/tickers/:symbol/history?timeframe=1m|5m|1h|1d&limit=200`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### WebSocket

- `GET /ws`

Client messages:

- `subscribe`
- `unsubscribe`

The frontend subscribes to ticker streams over WebSocket and updates the watchlist in near real time.

## Testing

Run all tests:

```bash
pnpm test
```

Run backend tests only:

```bash
pnpm test:server
```

Build the workspace:

```bash
pnpm build
```

## Assumptions And Trade-offs

- Market data is mocked. Prices are generated in-process and are not connected to a real exchange feed.
- Historical data is generated in memory at startup and kept in memory afterward.
- Authentication is intentionally simple and uses a mocked user record.
- Alerts are stored in browser local storage, so they do not sync across browsers or devices.
- The system is structured like a small monorepo with separate frontend and backend apps, but it is still a demo-sized implementation rather than a production trading system.

## Bonus Features Implemented

- mocked user authentication
- in-memory caching for historical data
- price threshold alerts

## Notes

- Historical candles support `1m`, `5m`, `1h`, and `1d` views.
- The backend uses a simulated price model to keep the demo active without external dependencies.
- The chart and watchlist are designed for quick interaction rather than strict market accuracy.
