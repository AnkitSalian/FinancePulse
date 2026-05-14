import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getAccounts, createAccount, updateAccount } from '../services/accountService';

export async function listAccounts(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const accounts = await getAccounts(req.userId!);
    res.status(200).json({ accounts });
  } catch (err) {
    next(err);
  }
}

export async function addAccount(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'name and type are required' },
      });
      return;
    }

    const account = await createAccount(req.userId!, req.body);
    res.status(201).json({ account });
  } catch (err) {
    next(err);
  }
}

export async function editAccount(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const account = await updateAccount(req.userId!, id, req.body);

    if (!account) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Account not found' },
      });
      return;
    }

    res.status(200).json({ account });
  } catch (err) {
    next(err);
  }
}
