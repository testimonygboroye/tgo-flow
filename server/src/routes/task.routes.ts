import { Router } from 'express';
import { body } from 'express-validator';
import * as taskController from '../controllers/task.controller';
import { validate } from '../middleware/validate';

const router = Router({ mergeParams: true });

router.get('/', taskController.list);
router.get('/:taskId', taskController.getOne);

router.post(
  '/list/:listId',
  [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Task title is required (max 200 characters)'),
    body('description').optional().isString().isLength({ max: 5000 }).withMessage('Description must be under 5000 characters'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
    body('labels').optional().isArray().withMessage('Labels must be an array'),
    body('labels.*').optional().isString().isLength({ max: 50 }).withMessage('Each label must be under 50 characters'),
    body('assignees').optional().isArray().withMessage('Assignees must be an array'),
    body('assignees.*').optional().isMongoId().withMessage('Each assignee must be a valid user ID'),
  ],
  validate,
  taskController.create
);

router.patch(
  '/:taskId',
  [
    body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Task title must be 1-200 characters'),
    body('description').optional().isString().isLength({ max: 5000 }).withMessage('Description must be under 5000 characters'),
    body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
    body('labels').optional().isArray().withMessage('Labels must be an array'),
    body('labels.*').optional().isString().isLength({ max: 50 }).withMessage('Each label must be under 50 characters'),
    body('assignees').optional().isArray().withMessage('Assignees must be an array'),
    body('assignees.*').optional().isMongoId().withMessage('Each assignee must be a valid user ID'),
  ],
  validate,
  taskController.update
);

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
