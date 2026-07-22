import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { requireWorkspaceRole } from '../middleware/workspaceAccess';
import { validate } from '../middleware/validate';
import * as boardController from '../controllers/board.controller';
import taskRoutes from './task.routes';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(requireWorkspaceRole('owner', 'admin', 'member'));

router.post(
  '/',
  [body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Board name is required (max 100 characters)')],
  validate,
  boardController.create
);

router.get('/', boardController.list);
router.get('/:boardId', boardController.getOne);
router.delete('/:boardId', boardController.remove);

router.post(
  '/:boardId/lists',
  [body('name').trim().isLength({ min: 1, max: 100 }).withMessage('List name is required (max 100 characters)')],
  validate,
  boardController.createList
);

router.patch(
  '/:boardId/lists/:listId',
  [body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer')],
  validate,
  boardController.reorderList
);

router.delete('/:boardId/lists/:listId', boardController.deleteList);

router.use('/:boardId/tasks', taskRoutes);

export default router;
