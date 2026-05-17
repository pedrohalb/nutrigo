import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  userId: string;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing token'));
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    (req as AuthRequest).userId = payload.sub;
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid token'));
  }
}
