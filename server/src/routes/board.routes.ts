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

router.get('/', boardController.list);
router.get('/:boardId', boardController.getOne);

// Board/list structure management is restricted to owner/admin — members
// work within boards but should not be able to create or destroy them.
router.post(
  '/',
  requireWorkspaceRole('owner', 'admin'),
  [body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Board name is required (max 100 characters)')],
  validate,
  boardController.create
);

router.delete('/:boardId', requireWorkspaceRole('owner', 'admin'), boardController.remove);

router.post(
  '/:boardId/lists',
  requireWorkspaceRole('owner', 'admin'),
  [body('name').trim().isLength({ min: 1, max: 100 }).withMessage('List name is required (max 100 characters)')],
  validate,
  boardController.createList
);

router.patch(
  '/:boardId/lists/:listId',
  requireWorkspaceRole('owner', 'admin'),
  [body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer')],
  validate,
  boardController.reorderList
);

router.delete('/:boardId/lists/:listId', requireWorkspaceRole('owner', 'admin'), boardController.deleteList);

// Tasks remain open to all members — this is the actual day-to-day work.
router.use('/:boardId/tasks', taskRoutes);

export default router;
