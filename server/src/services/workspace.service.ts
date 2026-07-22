import crypto from 'crypto';
import { Types } from 'mongoose';
import { Workspace } from '../models/Workspace';
import { Membership, MembershipRole } from '../models/Membership';
import { Invite } from '../models/Invite';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { sha256 } from '../utils/hash';

const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createWorkspace(userId: string, name: string) {
  const workspace = await Workspace.create({ name, owner: new Types.ObjectId(userId) });
  await Membership.create({ workspace: workspace._id, user: userId, role: 'owner' });
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
    throw new AppError('Only the workspace owner can change an admin\'s role', 403);
  }

  membership.role = newRole;
  await membership.save();
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

  await Membership.deleteOne({ _id: membership._id });
}
