import crypto from 'crypto';
import { Types } from 'mongoose';
import { Workspace } from '../models/Workspace';
import { Membership, MembershipRole } from '../models/Membership';
import { Invite } from '../models/Invite';
import { User } from '../models/User';
import { Board } from '../models/Board';
import { List } from '../models/List';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { Activity } from '../models/Activity';
import { AppError } from '../utils/AppError';
import { sha256 } from '../utils/hash';
import { sendInviteEmail } from './email.service';
import { env } from '../config/env';
import { logActivity } from './activity.service';

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export async function createWorkspace(userId: string, name: string) {
  const workspace = await Workspace.create({ name, owner: new Types.ObjectId(userId) });
  await Membership.create({ workspace: workspace._id, user: userId, role: 'owner' });
  await logActivity(workspace._id.toString(), userId, 'workspace_created');
  return workspace;
}

export async function listUserWorkspaces(userId: string) {
  const memberships = await Membership.find({ user: userId }).populate('workspace');
  return memberships.map((m) => ({
    workspace: m.workspace,
    role: m.role,
  }));
}

export async function getWorkspaceIfMember(workspaceId: string, userId: string) {
  const membership = await Membership.findOne({ workspace: workspaceId, user: userId });
  if (!membership) {
    throw new AppError('Workspace not found or access denied', 404);
  }
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  return { workspace, role: membership.role as MembershipRole };
}

export async function getMembershipRole(workspaceId: string, userId: string): Promise<MembershipRole | null> {
  const membership = await Membership.findOne({ workspace: workspaceId, user: userId });
  return membership ? (membership.role as MembershipRole) : null;
}

export async function listWorkspaceMembers(workspaceId: string) {
  const memberships = await Membership.find({ workspace: workspaceId }).populate('user', 'name email');
  return memberships.map((m) => ({
    membershipId: m._id,
    user: m.user,
    role: m.role,
  }));
}

export async function inviteMember(
  workspaceId: string,
  invitedBy: string,
  email: string,
  role: MembershipRole
) {
  if (role === 'owner') {
    throw new AppError('Cannot invite a member as owner', 400);
  }

  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const existingMembership = await Membership.findOne({ workspace: workspaceId, user: existingUser._id });
    if (existingMembership) {
      throw new AppError('This user is already a member of the workspace', 409);
    }
  }

  const existingInvite = await Invite.findOne({ workspace: workspaceId, email: normalizedEmail, status: 'pending' });
  if (existingInvite) {
    throw new AppError('An invite has already been sent to this email', 409);
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

  const invite = await Invite.create({
    workspace: workspaceId,
    email: normalizedEmail,
    role,
    tokenHash,
    invitedBy,
    expiresAt,
  });

  const workspace = await Workspace.findById(workspaceId);
  const inviteLink = `${env.clientUrl}/invites/accept?token=${rawToken}`;
  await sendInviteEmail(normalizedEmail, workspace?.name || 'a workspace', role, inviteLink);
  await logActivity(workspaceId, invitedBy, 'member_invited', normalizedEmail);

  return { invite, rawToken };
}

export async function acceptInvite(rawToken: string, userId: string) {
  const tokenHash = sha256(rawToken);
  const invite = await Invite.findOne({ tokenHash, status: 'pending' });

  if (!invite) {
    throw new AppError('Invalid or expired invite', 400);
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    invite.status = 'revoked';
    await invite.save();
    throw new AppError('This invite has expired', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.email !== invite.email) {
    throw new AppError('This invite was sent to a different email address', 403);
  }

  const existingMembership = await Membership.findOne({ workspace: invite.workspace, user: userId });
  if (existingMembership) {
    invite.status = 'accepted';
    await invite.save();
    throw new AppError('You are already a member of this workspace', 409);
  }

  await Membership.create({ workspace: invite.workspace, user: userId, role: invite.role });
  invite.status = 'accepted';
  await invite.save();

  await logActivity(invite.workspace.toString(), userId, 'member_joined');

  const workspace = await Workspace.findById(invite.workspace);
  return workspace;
}

export async function updateMemberRole(
  workspaceId: string,
  targetUserId: string,
  newRole: MembershipRole,
  requesterRole: MembershipRole
) {
  if (newRole === 'owner') {
    throw new AppError('Ownership must be transferred separately, not set directly', 400);
  }

  const membership = await Membership.findOne({ workspace: workspaceId, user: targetUserId });
  if (!membership) {
    throw new AppError('Member not found in this workspace', 404);
  }

  if (membership.role === 'owner') {
    throw new AppError('Cannot change the role of the workspace owner', 403);
  }

  if (requesterRole !== 'owner' && membership.role === 'admin') {
    throw new AppError("Only the workspace owner can change an admin's role", 403);
  }

  membership.role = newRole;
  await membership.save();

  const targetUser = await User.findById(targetUserId);
  await logActivity(workspaceId, targetUserId, 'member_role_changed', `${targetUser?.name || 'a member'}'s role to ${newRole}`);

  return membership;
}

export async function removeMember(workspaceId: string, targetUserId: string, requesterRole: MembershipRole) {
  const membership = await Membership.findOne({ workspace: workspaceId, user: targetUserId });
  if (!membership) {
    throw new AppError('Member not found in this workspace', 404);
  }

  if (membership.role === 'owner') {
    throw new AppError('The workspace owner cannot be removed', 403);
  }

  if (requesterRole !== 'owner' && membership.role === 'admin') {
    throw new AppError('Only the workspace owner can remove an admin', 403);
  }

  const targetUser = await User.findById(targetUserId);
  await Membership.deleteOne({ _id: membership._id });
  await logActivity(workspaceId, targetUserId, 'member_removed', targetUser?.name || 'a member');
}

export async function updateWorkspaceName(workspaceId: string, name: string) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  workspace.name = name;
  await workspace.save();
  return workspace;
}

export async function deleteWorkspace(workspaceId: string, requesterId: string) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }
  if (workspace.owner.toString() !== requesterId) {
    throw new AppError('Only the workspace owner can delete this workspace', 403);
  }

  const boards = await Board.find({ workspace: workspaceId });
  const boardIds = boards.map((b) => b._id);
  const lists = await List.find({ board: { $in: boardIds } });
  const listIds = lists.map((l) => l._id);
  const tasks = await Task.find({ list: { $in: listIds } });
  const taskIds = tasks.map((t) => t._id);

  await Comment.deleteMany({ task: { $in: taskIds } });
  await Task.deleteMany({ list: { $in: listIds } });
  await List.deleteMany({ board: { $in: boardIds } });
  await Board.deleteMany({ workspace: workspaceId });
  await Membership.deleteMany({ workspace: workspaceId });
  await Invite.deleteMany({ workspace: workspaceId });
  await Activity.deleteMany({ workspace: workspaceId });
  await Workspace.deleteOne({ _id: workspaceId });
}

export async function leaveWorkspace(workspaceId: string, userId: string) {
  const membership = await Membership.findOne({ workspace: workspaceId, user: userId });
  if (!membership) {
    throw new AppError('You are not a member of this workspace', 404);
  }
  if (membership.role === 'owner') {
    throw new AppError('The owner cannot leave. Delete the workspace instead, or transfer ownership first.', 403);
  }
  await Membership.deleteOne({ _id: membership._id });
}

export async function declineInvite(rawToken: string) {
  const tokenHash = sha256(rawToken);
  const invite = await Invite.findOne({ tokenHash, status: 'pending' });
  if (!invite) {
    throw new AppError('Invalid or expired invite', 400);
  }
  invite.status = 'revoked';
  await invite.save();
}
