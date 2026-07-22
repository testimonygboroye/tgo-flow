import { Task } from '../models/Task';
import { List } from '../models/List';
import { Comment } from '../models/Comment';
import { AppError } from '../utils/AppError';

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

export async function createTask(input: CreateTaskInput) {
  const list = await List.findOne({ _id: input.listId, board: input.boardId });
  if (!list) {
    throw new AppError('List not found on this board', 404);
  }

  const lastTask = await Task.findOne({ list: input.listId }).sort({ position: -1 });
  const position = lastTask ? lastTask.position + 1 : 0;

  return Task.create({
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
  if (updates.assignees !== undefined) task.assignees = updates.assignees as any;

  await task.save();
  return task;
}

export async function moveTask(taskId: string, boardId: string, newListId: string, newPosition: number) {
  const task = await Task.findOne({ _id: taskId, board: boardId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const targetList = await List.findOne({ _id: newListId, board: boardId });
  if (!targetList) {
    throw new AppError('Target list not found on this board', 404);
  }

  task.list = targetList._id;
  task.position = newPosition;
  await task.save();
  return task;
}

export async function deleteTask(taskId: string, boardId: string) {
  const task = await Task.findOne({ _id: taskId, board: boardId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  await Comment.deleteMany({ task: taskId });
  await Task.deleteOne({ _id: taskId });
}

export async function addComment(taskId: string, boardId: string, authorId: string, body: string) {
  const task = await Task.findOne({ _id: taskId, board: boardId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  const comment = await Comment.create({ task: taskId, author: authorId, body });
  return comment.populate('author', 'name email');
}

export async function listComments(taskId: string, boardId: string) {
  const task = await Task.findOne({ _id: taskId, board: boardId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return Comment.find({ task: taskId }).populate('author', 'name email').sort({ createdAt: 1 });
}
