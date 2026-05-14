import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listAccounts, addAccount, editAccount } from '../controllers/accountController';

const router = Router();

router.use(authenticate);

router.get('/', listAccounts);
router.post('/', addAccount);
router.patch('/:id', editAccount);

export default router;
