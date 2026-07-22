import { Router } from 'express';
import { body } from 'express-validator';
import * as taskController from '../controllers/task.controller';

const router = Router({ mergeParams: true });

router.get('/', taskController.list);
router.get('/:taskId', taskController.getOne);

router.post(
  '/list/:listId',
  [body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Task title is required (max 200 characters)')],
  taskController.create
);

router.patch('/:taskId', taskController.update);

router.patch(
  '/:taskId/move',
  [
    body('listId').notEmpty().withMessage('Target list ID is required'),
    body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
  ],
  taskController.move
);

router.delete('/:taskId', taskController.remove);

router.post(
  '/:taskId/comments',
  [body('body').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment body is required (max 2000 characters)')],
  taskController.addComment
);

router.get('/:taskId/comments', taskController.listComments);

export default router;
