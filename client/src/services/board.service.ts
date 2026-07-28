import { api } from '../lib/api';
import type { Board, List } from '../types';

export async function createBoardRequest(workspaceId: string, name: string): Promise<{ board: Board; lists: List[] }> {
  const { data } = await api.post(`/workspaces/${workspaceId}/boards`, { name });
  return { board: data.board, lists: data.lists };
}

export async function listBoardsRequest(workspaceId: string): Promise<Board[]> {
  const { data } = await api.get(`/workspaces/${workspaceId}/boards`);
  return data.boards;
}

export async function getBoardRequest(workspaceId: string, boardId: string): Promise<{ board: Board; lists: List[] }> {
  const { data } = await api.get(`/workspaces/${workspaceId}/boards/${boardId}`);
  return { board: data.board, lists: data.lists };
}

export async function createListRequest(workspaceId: string, boardId: string, name: string): Promise<List> {
  const { data } = await api.post(`/workspaces/${workspaceId}/boards/${boardId}/lists`, { name });
  return data.list;
}

export async function updateBoardNameRequest(workspaceId: string, boardId: string, name: string) {
  const { data } = await api.patch(`/workspaces/${workspaceId}/boards/${boardId}`, { name });
  return data.board;
}

export async function deleteBoardRequest(workspaceId: string, boardId: string) {
  await api.delete(`/workspaces/${workspaceId}/boards/${boardId}`);
}
