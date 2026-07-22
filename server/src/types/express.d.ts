import 'express';
import { MembershipRole } from '../models/Membership';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      workspaceRole?: MembershipRole;
    }
  }
}
