import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { requireOwner } from '../middleware/requireOwner';
import { validate } from '../middleware/validate';
import * as reviewController from '../controllers/review.controller';

const router = Router();

router.post(
  '/',
  [
    body('reviewerName').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
    body('reviewerEmail').isEmail().withMessage('A valid email is required'),
    body('reviewerRole').optional().isString().isLength({ max: 100 }),
    body('message').trim().isLength({ min: 1, max: 5000 }).withMessage('Message is required'),
  ],
  validate,
  reviewController.submit
);

router.get('/', protect, requireOwner, reviewController.list);
router.patch('/:id/read', protect, requireOwner, [body('isRead').isBoolean()], validate, reviewController.markRead);
router.delete('/:id', protect, requireOwner, reviewController.remove);

export default router;
