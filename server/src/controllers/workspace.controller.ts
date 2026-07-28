import { Request, Response, NextFunction } from 'express';
import * as workspaceService from '../services/workspace.service';
import { getParam } from '../utils/params';

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body;
    const workspace = await workspaceService.createWorkspace(req.userId as string, name);
    res.status(201).json({ status: 'success', workspace });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const workspaces = await workspaceService.listUserWorkspaces(req.userId as string);
    res.status(200).json({ status: 'success', workspaces });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await workspaceService.getWorkspaceIfMember(getParam(req, 'id'), req.userId as string);
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
}

export async function listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const members = await workspaceService.listWorkspaceMembers(getParam(req, 'id'));
    res.status(200).json({ status: 'success', members });
  } catch (err) {
    next(err);
  }
}

export async function invite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, role } = req.body;
    const { invite: createdInvite, rawToken } = await workspaceService.inviteMember(
      getParam(req, 'id'),
      req.userId as string,
      email,
      role
    );
    res.status(201).json({
      status: 'success',
      invite: { id: createdInvite._id, email: createdInvite.email, role: createdInvite.role, expiresAt: createdInvite.expiresAt },
      inviteToken: rawToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.body;
    const workspace = await workspaceService.acceptInvite(token, req.userId as string);
    res.status(200).json({ status: 'success', workspace });
  } catch (err) {
    next(err);
  }
}

export async function updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { role } = req.body;
    const membership = await workspaceService.updateMemberRole(
      getParam(req, 'id'),
      getParam(req, 'userId'),
      role,
      req.workspaceRole as any
    );
    res.status(200).json({ status: 'success', membership });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await workspaceService.removeMember(getParam(req, 'id'), getParam(req, 'userId'), req.workspaceRole as any);
    res.status(200).json({ status: 'success', message: 'Member removed' });
  } catch (err) {
    next(err);
  }
}

export async function updateName(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body;
    const workspace = await workspaceService.updateWorkspaceName(getParam(req, 'id'), name);
    res.status(200).json({ status: 'success', workspace });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await workspaceService.deleteWorkspace(getParam(req, 'id'), req.userId as string);
    res.status(200).json({ status: 'success', message: 'Workspace deleted' });
  } catch (err) {
    next(err);
  }
}

export async function leave(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await workspaceService.leaveWorkspace(getParam(req, 'id'), req.userId as string);
    res.status(200).json({ status: 'success', message: 'You have left the workspace' });
  } catch (err) {
    next(err);
  }
}

export async function declineInvite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.body;
    await workspaceService.declineInvite(token);
    res.status(200).json({ status: 'success', message: 'Invite declined' });
  } catch (err) {
    next(err);
  }
}
