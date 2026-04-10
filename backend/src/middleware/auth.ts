import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'wayfinder_dev_secret';

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'Token manquant');

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
    req.userId   = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    throw new AppError(401, 'Token invalide ou expiré');
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== 'admin') throw new AppError(403, 'Accès réservé aux administrateurs');
    next();
  });
}

export function signToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: '30d' });
}
