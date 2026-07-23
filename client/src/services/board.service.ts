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
