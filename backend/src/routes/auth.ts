import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db';
import { AppError } from '../middleware/errorHandler';
import { requireAuth, signToken, AuthRequest } from '../middleware/auth';

const router = Router();

interface UserRow {
  id: string; name: string; email: string;
  password_hash: string; role: string; created_at: string;
}

function safeUser(u: UserRow) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.created_at };
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (!name || !email || !password) throw new AppError(400, 'name, email et password sont requis');
  if (password.length < 6)          throw new AppError(400, 'Le mot de passe doit faire au moins 6 caractères');

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) throw new AppError(409, 'Cet email est déjà utilisé');

  const id = uuidv4();
  const hash = await bcrypt.hash(password, 10);
  // First user gets admin role
  const count = (db.prepare('SELECT COUNT(*) as n FROM users').get() as { n: number }).n;
  const role = count === 0 ? 'admin' : 'operator';

  db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .run(id, name.trim(), email.toLowerCase().trim(), hash, role);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  const token = signToken(id, role);

  res.status(201).json({ success: true, data: { token, user: safeUser(user) } });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) throw new AppError(400, 'email et password requis');

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as UserRow | undefined;
  if (!user) throw new AppError(401, 'Email ou mot de passe incorrect');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new AppError(401, 'Email ou mot de passe incorrect');

  const token = signToken(user.id, user.role);
  res.json({ success: true, data: { token, user: safeUser(user) } });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId) as UserRow | undefined;
  if (!user) throw new AppError(404, 'Utilisateur introuvable');
  res.json({ success: true, data: safeUser(user) });
});

export default router;
