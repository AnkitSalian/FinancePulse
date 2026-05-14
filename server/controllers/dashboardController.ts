import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getMonthlySummary,
  getBudgetStatus,
  getDailyPulse,
} from '../services/dashboardService';

export async function summary(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);
    const data = await getMonthlySummary(req.userId!, month);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

export async function budgetStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);
    const data = await getBudgetStatus(req.userId!, month);
    res.status(200).json({ budget_status: data });
  } catch (err) {
    next(err);
  }
}

export async function dailyPulse(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const data = await getDailyPulse(req.userId!);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}
