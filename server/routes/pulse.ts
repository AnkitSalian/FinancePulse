import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { dailyPulse } from '../controllers/dashboardController';

const router = Router();

router.use(authenticate);

router.get('/daily', dailyPulse);

export default router;
