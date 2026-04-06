import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { authMiddleware, type AuthRequest } from '../middleware/auth';

const MOCK_USERS = [
  { id: '1', email: 'trader@demo.com', password: 'password123', name: 'Demo Trader' },
];

export const authRouter: ReturnType<typeof Router> = Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 86400000,
  });

  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

authRouter.post('/logout', authMiddleware, (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.json({ success: true });
});

authRouter.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});
