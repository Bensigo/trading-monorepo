# Real-Time Trading Dashboard

A real-time cryptocurrency and stock trading dashboard with live WebSocket price streaming, interactive charts, and price alerts.

## Architecture

- **Backend** (`apps/server`): Node.js + Express + ws — REST API and WebSocket server with mock price generation using geometric Brownian motion
- **Frontend** (`apps/web`): React 18 + Vite + Tailwind CSS v4 — real-time UI with Recharts, TanStack Query, and Zustand
- **Shared** (`packages/shared`): TypeScript types and constants shared across apps

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Monorepo | Turborepo + pnpm | Parallel builds, shared packages |
| Backend | Express + ws | Lightweight WebSocket (no socket.io overhead) |
| Auth | JWT in HttpOnly cookies | XSS-proof token storage |
| Frontend | Vite + React 18 | Fast HMR, modern bundling |
| Styling | Tailwind CSS v4 | Utility-first, zero runtime |
| Charts | Recharts | Composable React chart components |
| State | Zustand | Minimal boilerplate global state |
| Data fetching | TanStack Query v5 | Caching, stale-while-revalidate |
| Font | Inter (self-hosted) | Clean UI typography |

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (optional)

### Local Development

```bash
pnpm install
pnpm dev          # starts both server (3001) and web (5173)
```

### Docker

```bash
docker-compose up --build
# Web: http://localhost:3000
# API: http://localhost:3001
```

### Demo Credentials

```
Email: trader@demo.com
Password: password123
```

## Features

- **Public dashboard** — live prices and charts accessible without sign-in
- **Live price streaming** via WebSocket with sub-200ms update target
- **Interactive price charts** with 1m/5m/1H/1D timeframe toggle
- **6 tickers**: BTC, ETH, SOL (crypto) + AAPL, TSLA, NVDA (stocks)
- **Price alerts** (authenticated) — toast notifications when targets are hit, login dialog prompts on create
- **Skeleton loading states** — animated placeholders while data loads
- **Responsive layout** — desktop sidebar + mobile hamburger menu
- **Secure authentication** — HttpOnly cookie JWT, only required for alert management

## Performance Optimizations

- `useRef` for WebSocket price data — avoids re-render cascade
- Throttled state flushes at 100ms intervals (max 10 renders/sec)
- `React.memo` with custom comparators on TickerCard
- `font-variant-numeric: tabular-nums` prevents price width jumping
- Zustand selectors with shallow equality checks

## Security

- JWT stored in HttpOnly cookies (never accessible to JavaScript)
- SameSite=Strict prevents CSRF attacks
- Secure flag enforces HTTPS in production
- WebSocket auth via cookie on upgrade (no token in URL)
- CORS with explicit origin and credentials

## Design Decisions & Trade-offs

- **ws over socket.io**: Lighter, no polling fallback needed for a modern app. Trade-off: no automatic reconnection or room abstraction built in — we implement reconnect with exponential backoff manually.
- **WebSocket over REST polling for prices**: Sub-200ms latency vs ~1s polling. Trade-off: more complex connection management, but necessary for real-time feel.
- **Vite over Next.js**: Client-side real-time app with no SEO needs, so SSR adds complexity without value.
- **Zustand over Redux**: Minimal boilerplate for a small state surface (selected ticker + live prices). Trade-off: less structured than Redux for larger apps, but right-sized here.
- **In-memory cache over Redis**: Single-service architecture, no external dependencies. Trade-off: data is lost on server restart and cannot scale horizontally — acceptable for a demo.
- **HttpOnly cookies over localStorage**: Prevents XSS token theft. Trade-off: requires CORS credentials config and cookie-parser middleware.
- **localStorage for alerts**: Simple persistence without backend storage. Trade-off: alerts don't sync across devices or tabs.

## Assumptions

- **Mock price data**: Uses geometric Brownian motion with zero drift for realistic price simulation. Prices are not tied to real market data.
- **Single-service deployment**: No horizontal scaling — one server instance holds all price state and WebSocket connections in memory.
- **30-day history cap**: Cache stores max 43,200 one-minute candles per ticker (30 days). Older data is discarded to bound memory usage.
- **JWT expiry**: Tokens expire after 24 hours with no refresh token rotation. In production, you'd add refresh tokens and shorter access token lifetimes.
- **No persistent storage**: All price history is regenerated on server restart. In production, you'd persist to a time-series database.
- **Public price data**: Ticker prices and charts are accessible without authentication. Only alert management requires sign-in.

## Testing

```bash
pnpm test          # runs all tests
pnpm test:server   # backend only
```

## Project Structure

```
trading-dashboard/
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── docker-compose.yml
├── packages/
│   └── shared/          # Shared TypeScript types & constants
├── apps/
│   ├── server/          # Express + ws backend
│   │   ├── src/
│   │   │   ├── services/    # priceGenerator, cacheStore, wsManager
│   │   │   ├── routes/      # auth, tickers REST endpoints
│   │   │   ├── middleware/  # JWT auth via cookie
│   │   │   └── __tests__/   # vitest unit tests
│   │   └── Dockerfile
│   └── web/             # React + Vite frontend
│       ├── src/
│       │   ├── components/  # UI components (layout, ticker, chart, alerts)
│       │   ├── hooks/       # useWebSocket, useTickers, useAlerts
│       │   ├── stores/      # Zustand stores (ticker, alert)
│       │   ├── context/     # AuthContext
│       │   └── api/         # REST API client
│       └── Dockerfile
```
