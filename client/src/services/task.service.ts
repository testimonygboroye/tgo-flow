import { api } from '../lib/api';
import type { Task, Comment } from '../types';

interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string | null;
  labels?: string[];
  assignees?: string[];
}

export async function createTaskRequest(
  workspaceId: string,
  boardId: string,
  listId: string,
  input: CreateTaskInput
): Promise<Task> {
  const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/tasks/list/${listId}`, input);
  return data.task;
}

export async function listTasksRequest(workspaceId: string, boardId: string): Promise<Task[]> {
  const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/tasks`);
  return data.tasks;
}

export async function updateTaskRequest(
  workspaceId: string,
  boardId: string,
  taskId: string,
  updates: Partial<CreateTaskInput>
): Promise<Task> {
  const { data } = await api.patch(`/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}`, updates);
  return data.task;
}

export async function moveTaskRequest(
  workspaceId: string,
  boardId: string,
  taskId: string,
  listId: string,
  position: number
): Promise<Task> {
  const { data } = await api.patch(`/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/move`, { listId, position });
  return data.task;
}

export async function deleteTaskRequest(workspaceId: string, boardId: string, taskId: string): Promise<void> {
  await api.delete(`/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}`);
}

export async function addCommentRequest(
  workspaceId: string,
  boardId: string,
  taskId: string,
  body: string
): Promise<Comment> {
  const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/comments`, { body });
  return data.comment;
}

export async function listCommentsRequest(workspaceId: string, boardId: string, taskId: string): Promise<Comment[]> {
  const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/comments`);
  return data.comments;
}
