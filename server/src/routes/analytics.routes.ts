import { Router } from 'express';
import { protect } from '../middleware/auth';
import { requireOwner } from '../middleware/requireOwner';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

router.get('/', protect, requireOwner, analyticsController.list);

export default router;
