import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listCategories } from '../controllers/categoryController';

const router = Router();

router.use(authenticate);
router.get('/', listCategories);

export default router;
