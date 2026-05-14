import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService';

export async function listTransactions(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { month, category_id, type, source, limit, offset } = req.query;

    const result = await getTransactions(req.userId!, {
      month: month as string | undefined,
      category_id: category_id as string | undefined,
      type: type as string | undefined,
      source: source as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function addTransaction(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { amount, type, transaction_date } = req.body;

    if (!amount || !type || !transaction_date) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'amount, type, and transaction_date are required',
        },
      });
      return;
    }

    if (!['debit', 'credit'].includes(type)) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'type must be debit or credit' },
      });
      return;
    }

    const transaction = await createTransaction(req.userId!, req.body);
    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
}

export async function editTransaction(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const transaction = await updateTransaction(req.userId!, id, req.body);

    if (!transaction) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Transaction not found' },
      });
      return;
    }

    res.status(200).json({ transaction });
  } catch (err) {
    next(err);
  }
}

export async function removeTransaction(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await deleteTransaction(req.userId!, id);

    if (!deleted) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Transaction not found' },
      });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
