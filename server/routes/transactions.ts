import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
} from '../controllers/transactionController';

const router = Router();

router.use(authenticate);

router.get('/', listTransactions);
router.post('/', addTransaction);
router.patch('/:id', editTransaction);
router.delete('/:id', removeTransaction);

export default router;
