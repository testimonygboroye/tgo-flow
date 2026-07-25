import { Activity, ActivityAction } from '../models/Activity';
import { User } from '../models/User';

function buildDescription(actorName: string, action: ActivityAction, detail?: string): string {
  switch (action) {
    case 'workspace_created':
      return `${actorName} created the workspace`;
    case 'member_invited':
      return `${actorName} invited ${detail}`;
    case 'member_joined':
      return `${actorName} joined the workspace`;
    case 'member_role_changed':
      return `${actorName} changed ${detail}`;
    case 'member_removed':
      return `${actorName} removed ${detail} from the workspace`;
    case 'board_created':
      return `${actorName} created the board "${detail}"`;
    case 'board_deleted':
      return `${actorName} deleted the board "${detail}"`;
    case 'task_created':
      return `${actorName} created task "${detail}"`;
    case 'task_moved':
      return `${actorName} moved task "${detail}"`;
    case 'task_deleted':
      return `${actorName} deleted task "${detail}"`;
    case 'task_commented':
      return `${actorName} commented on "${detail}"`;
    default:
      return `${actorName} performed an action`;
  }
}

export async function logActivity(
  workspaceId: string,
  actorId: string,
  action: ActivityAction,
  detail?: string
): Promise<void> {
  try {
    const actor = await User.findById(actorId);
    const actorName = actor?.name || 'Someone';
    const description = buildDescription(actorName, action, detail);
    await Activity.create({ workspace: workspaceId, actor: actorId, action, description });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

export async function listActivity(workspaceId: string, limit = 50) {
  return Activity.find({ workspace: workspaceId })
    .populate('actor', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
}
