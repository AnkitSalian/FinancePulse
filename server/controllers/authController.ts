import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createUser,
  findUserByEmail,
  findUserById,
  seedDefaultCategories,
  updateUserProfile,
} from '../services/authService';
import { AuthRequest } from '../middleware/auth';

const SALT_ROUNDS = 12;

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30d' });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'name, email, and password are required' },
      });
      return;
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Email already registered' },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser(name, email, passwordHash);
    await seedDefaultCategories(user.id);

    const token = signToken(user.id);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'email and password are required' },
      });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
      });
      return;
    }

    const token = signToken(user.id);
    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { monthly_income, risk_appetite } = req.body;

    const VALID_RISK = ['conservative', 'moderate', 'aggressive'];
    if (risk_appetite && !VALID_RISK.includes(risk_appetite)) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'risk_appetite must be conservative, moderate, or aggressive',
        },
      });
      return;
    }

    const user = await updateUserProfile(req.userId!, { monthly_income, risk_appetite });
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await findUserById(req.userId!);
    if (!user) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
      return;
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
