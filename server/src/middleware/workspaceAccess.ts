import { Request, Response, NextFunction } from 'express';
import { getMembershipRole } from '../services/workspace.service';
import { AppError } from '../utils/AppError';
import { MembershipRole } from '../models/Membership';
import { getParam } from '../utils/params';

export function requireWorkspaceRole(...allowedRoles: MembershipRole[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = getParam(req, 'workspaceId') || getParam(req, 'id');
      const userId = req.userId as string;

      const role = await getMembershipRole(workspaceId, userId);
      if (!role) {
        next(new AppError('Workspace not found or access denied', 404));
        return;
      }

      if (!allowedRoles.includes(role)) {
        next(new AppError('You do not have permission to perform this action', 403));
        return;
      }

      req.workspaceRole = role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
