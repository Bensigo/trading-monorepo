export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'trading-dashboard-secret-key',
  tickInterval: parseInt(process.env.TICK_INTERVAL || '500', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};
