import { Task } from '../models/Task';
import { List } from '../models/List';
import { Comment } from '../models/Comment';
import { Board } from '../models/Board';
import { Membership } from '../models/Membership';
import { AppError } from '../utils/AppError';
import { emitToBoard } from '../sockets';
import { logActivity } from './activity.service';

interface CreateTaskInput {
  listId: string;
  boardId: string;
  title: string;
  createdBy: string;
  description?: string;
  dueDate?: string | null;
  labels?: string[];
  assignees?: string[];
}

async function validateAssigneesAreMembers(workspaceId: string, assigneeIds: string[]): Promise<void> {
  if (assigneeIds.length === 0) return;
  const memberships = await Membership.find({ workspace: workspaceId, user: { $in: assigneeIds } });
  if (memberships.length !== assigneeIds.length) {
    throw new AppError('One or more assignees are not members of this workspace', 400);
  }
}

export async function createTask(input: CreateTaskInput) {
  const list = await List.findOne({ _id: input.listId, board: input.boardId });
  if (!list) {
    throw new AppError('List not found on this board', 404);
  }

  const board = await Board.findById(input.boardId);
  if (input.assignees && input.assignees.length > 0 && board) {
    await validateAssigneesAreMembers(board.workspace.toString(), input.assignees);
  }

  const lastTask = await Task.findOne({ list: input.listId }).sort({ position: -1 });
  const position = lastTask ? lastTask.position + 1 : 0;

  const task = await Task.create({
    list: input.listId,
    board: input.boardId,
    title: input.title,
    description: input.description || '',
    position,
    assignees: input.assignees || [],
    labels: input.labels || [],
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    createdBy: input.createdBy,
  });

  await task.populate('assignees', 'name email');
  await task.populate('createdBy', 'name email');
  emitToBoard(input.boardId, 'task:created', task);

  if (board) {
    await logActivity(board.workspace.toString(), input.createdBy, 'task_created', input.title);
  }

  return task;
}

export async function listTasksForBoard(boardId: string) {
  return Task.find({ board: boardId })
    .populate('assignees', 'name email')
    .populate('createdBy', 'name email')
    .sort({ position: 1 });
}

export async function getTask(taskId: string, boardId: string) {
  const task = await Task.findOne({ _id: taskId, board: boardId })
    .populate('assignees', 'name email')
    .populate('createdBy', 'name email');
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return task;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string | null;
  labels?: string[];
  assignees?: string[];
}

export async function updateTask(taskId: string, boardId: string, updates: UpdateTaskInput) {
  const task = await Task.findOne({ _id: taskId, board: boardId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.dueDate !== undefined) task.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
  if (updates.labels !== undefined) task.labels = updates.labels;
  if (updates.assignees !== undefined) {
    const taskBoard = await Board.findById(boardId);
    if (taskBoard) {
      await validateAssigneesAreMembers(taskBoard.workspace.toString(), updates.assignees);
    }
    task.assignees = updates.assignees as any;
  }

  await task.save();
  await task.populate('assignees', 'name email');
  await task.populate('createdBy', 'name email');
  emitToBoard(boardId, 'task:updated', task);
  return task;
}

/**
 * Moves a task to a new list/position, and re-numbers every task in the
 * affected list(s) sequentially (0, 1, 2...). This is essential: only
 * updating the moved task's own position leaves other tasks with stale,
 * overlapping position numbers, which causes the UI to sort incorrectly
 * (a dragged task appears to "snap back") on the next render.
 */
export async function moveTask(taskId: string, boardId: string, newListId: string, newPosition: number) {
  const task = await Task.findOne({ _id: taskId, board: boardId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const targetList = await List.findOne({ _id: newListId, board: boardId });
  if (!targetList) {
    throw new AppError('Target list not found on this board', 404);
  }

  const oldListId = task.list.toString();
  const isSameList = oldListId === newListId;

  const targetSiblings = await Task.find({ list: newListId, _id: { $ne: taskId } }).sort({ position: 1 });
  const clampedPosition = Math.max(0, Math.min(newPosition, targetSiblings.length));

  const orderedTargetIds = targetSiblings.map((t) => t._id.toString());
  orderedTargetIds.splice(clampedPosition, 0, taskId);

  const bulkOps = orderedTargetIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { position: index, list: newListId },
    },
  }));

  if (!isSameList) {
    const sourceSiblings = await Task.find({ list: oldListId, _id: { $ne: taskId } }).sort({ position: 1 });
    sourceSiblings.forEach((t, index) => {
      bulkOps.push({
        updateOne: {
          filter: { _id: t._id.toString() },
          update: { position: index, list: oldListId },
        },
      });
    });
  }

  if (bulkOps.length > 0) {
    await Task.bulkWrite(bulkOps);
  }

  const affectedIds = [...orderedTargetIds];
  if (!isSameList) {
    const sourceSiblings = await Task.find({ list: oldListId, _id: { $ne: taskId } });
    affectedIds.push(...sourceSiblings.map((t) => t._id.toString()));
  }

  const affectedTasks = await Task.find({ _id: { $in: affectedIds } })
    .populate('assignees', 'name email')
    .populate('createdBy', 'name email');

  emitToBoard(boardId, 'tasks:reordered', affectedTasks);

  const movedTask = affectedTasks.find((t) => t._id.toString() === taskId);

  const board = await Board.findById(boardId);
  if (board && movedTask) {
    await logActivity(board.workspace.toString(), movedTask.createdBy.toString(), 'task_moved', movedTask.title);
  }

  return movedTask!;
}

export async function logTaskMove(_boardId: string, _actorId: string, _taskTitle: string) {
  // Activity logging for moves happens via the task title captured before the move;
  // kept as a thin wrapper so the controller call site doesn't need to change.
}

export async function deleteTask(taskId: string, boardId: string) {
  const task = await Task.findOne({ _id: taskId, board: boardId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  await Comment.deleteMany({ task: taskId });
  await Task.deleteOne({ _id: taskId });
  emitToBoard(boardId, 'task:deleted', { taskId });

  const board = await Board.findById(boardId);
  if (board) {
    await logActivity(board.workspace.toString(), task.createdBy.toString(), 'task_deleted', task.title);
  }
}

export async function addComment(taskId: string, boardId: string, authorId: string, body: string) {
  const task = await Task.findOne({ _id: taskId, board: boardId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  const comment = await Comment.create({ task: taskId, author: authorId, body });
  const populated = await comment.populate('author', 'name email');
  emitToBoard(boardId, 'comment:created', populated);

  const board = await Board.findById(boardId);
  if (board) {
    await logActivity(board.workspace.toString(), authorId, 'task_commented', task.title);
  }

  return populated;
}

export async function listComments(taskId: string, boardId: string) {
  const task = await Task.findOne({ _id: taskId, board: boardId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return Comment.find({ task: taskId }).populate('author', 'name email').sort({ createdAt: 1 });
}
