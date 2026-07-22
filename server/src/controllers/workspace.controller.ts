import { Request, Response, NextFunction } from 'express';
import * as workspaceService from '../services/workspace.service';

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
    const result = await workspaceService.getWorkspaceIfMember(req.params.id, req.userId as string);
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
}

export async function listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const members = await workspaceService.listWorkspaceMembers(req.params.id);
    res.status(200).json({ status: 'success', members });
  } catch (err) {
    next(err);
  }
}

export async function invite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, role } = req.body;
    const { invite: createdInvite, rawToken } = await workspaceService.inviteMember(
      req.params.id,
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
      req.params.id,
      req.params.userId,
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
    await workspaceService.removeMember(req.params.id, req.params.userId, req.workspaceRole as any);
    res.status(200).json({ status: 'success', message: 'Member removed' });
  } catch (err) {
    next(err);
  }
}
