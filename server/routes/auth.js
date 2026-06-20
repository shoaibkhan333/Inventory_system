import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, generateId, seedDemoData } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const id = generateId('user');
  const now = new Date().toISOString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.prepare(
    'INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, name.trim(), email.toLowerCase().trim(), hashedPassword, 'manager', now);

  db.prepare(
    'INSERT INTO settings (user_id, company_name, currency, low_stock_alerts, dark_mode) VALUES (?, ?, ?, ?, ?)'
  ).run(id, `${name.trim()}'s Company`, 'USD', 1, 0);

  seedDemoData(id);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const token = createToken(user);

  res.status(201).json({ user: sanitizeUser(user), token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = createToken(user);
  res.json({ user: sanitizeUser(user), token });
});

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: sanitizeUser(user) });
});

export default router;
