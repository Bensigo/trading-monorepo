import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; name: string };
    req.user = decoded;
    next();
  } catch {
    res.clearCookie('token', {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      path: '/',
    });
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
