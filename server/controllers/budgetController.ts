import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getBudgets, createBudget, updateBudget } from '../services/budgetService';

export async function listBudgets(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { month } = req.query;

    if (!month) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'month query param is required (YYYY-MM)' },
      });
      return;
    }

    const budgets = await getBudgets(req.userId!, month as string);
    res.status(200).json({ budgets });
  } catch (err) {
    next(err);
  }
}

export async function addBudget(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { category_id, month, amount } = req.body;

    if (!category_id || !month || !amount) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'category_id, month, and amount are required',
        },
      });
      return;
    }

    const budget = await createBudget(req.userId!, req.body);
    res.status(201).json({ budget });
  } catch (err) {
    next(err);
  }
}

export async function editBudget(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const budget = await updateBudget(req.userId!, id, req.body);

    if (!budget) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Budget not found' },
      });
      return;
    }

    res.status(200).json({ budget });
  } catch (err) {
    next(err);
  }
}
