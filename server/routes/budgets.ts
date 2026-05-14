import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listBudgets, addBudget, editBudget } from '../controllers/budgetController';

const router = Router();

router.use(authenticate);

router.get('/', listBudgets);
router.post('/', addBudget);
router.patch('/:id', editBudget);

export default router;
