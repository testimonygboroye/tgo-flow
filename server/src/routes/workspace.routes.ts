import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { requireWorkspaceRole } from '../middleware/workspaceAccess';
import { validate } from '../middleware/validate';
import { inviteLimiter } from '../middleware/rateLimiter';
import * as workspaceController from '../controllers/workspace.controller';
import * as activityController from '../controllers/activity.controller';

const router = Router();

router.use(protect);

router.post(
  '/',
  [body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Workspace name must be between 2 and 100 characters')],
  validate,
  workspaceController.create
);

router.get('/', workspaceController.list);

router.post(
  '/invites/accept',
  [body('token').notEmpty().withMessage('Invite token is required')],
  validate,
  workspaceController.acceptInvite
);

router.post(
  '/invites/decline',
  [body('token').notEmpty().withMessage('Invite token is required')],
  validate,
  workspaceController.declineInvite
);

router.get('/:id', requireWorkspaceRole('owner', 'admin', 'member'), workspaceController.getOne);

router.get('/:id/members', requireWorkspaceRole('owner', 'admin', 'member'), workspaceController.listMembers);

router.get('/:id/activity', requireWorkspaceRole('owner', 'admin', 'member'), activityController.list);

router.patch(
  '/:id',
  requireWorkspaceRole('owner', 'admin'),
  [body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Workspace name must be between 2 and 100 characters')],
  validate,
  workspaceController.updateName
);

router.delete('/:id', requireWorkspaceRole('owner'), workspaceController.remove);

router.post('/:id/leave', requireWorkspaceRole('owner', 'admin', 'member'), workspaceController.leave);

router.post(
  '/:id/invites',
  requireWorkspaceRole('owner', 'admin'),
  inviteLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required'),
    body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member'),
  ],
  validate,
  workspaceController.invite
);

router.patch(
  '/:id/members/:userId',
  requireWorkspaceRole('owner', 'admin'),
  [body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member')],
  validate,
  workspaceController.updateMemberRole
);

router.delete(
  '/:id/members/:userId',
  requireWorkspaceRole('owner', 'admin'),
  workspaceController.removeMember
);

export default router;
