import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { summary, budgetStatus } from '../controllers/dashboardController';

const router = Router();

router.use(authenticate);

router.get('/summary', summary);
router.get('/budget-status', budgetStatus);

export default router;
