import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getCategories } from '../services/categoryService';

export async function listCategories(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await getCategories(req.userId!);
    res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
}
