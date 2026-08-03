import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, logout, me, forgotPassword, resetPasswordHandler, appReturn, deleteAccount } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter';
import { requireCustomHeader } from '../middleware/requireCustomHeader';

const router = Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post('/refresh', requireCustomHeader, refresh);
router.post('/logout', requireCustomHeader, logout);
router.get('/me', protect, me);
router.post('/app-return', protect, appReturn);
router.delete('/me', protect, deleteAccount);

router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  [body('email').isEmail().withMessage('A valid email is required')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
  ],
  validate,
  resetPasswordHandler
);

export default router;
