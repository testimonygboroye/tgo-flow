import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import type { Task, List } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useBoardSocket(boardId: string | undefined, workspaceId: string | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!boardId || !workspaceId || !accessToken) return;

    const socket = io(SOCKET_URL, { auth: { token: accessToken } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('board:join', boardId);
    });

    const tasksKey = ['tasks', workspaceId, boardId];
    const listsKey = ['board', workspaceId, boardId];

    socket.on('task:created', (task: Task) => {
      queryClient.setQueryData<Task[]>(tasksKey, (old) => (old ? [...old, task] : [task]));
    });

    socket.on('task:updated', (task: Task) => {
      queryClient.setQueryData<Task[]>(tasksKey, (old) =>
        old ? old.map((t) => (t._id === task._id ? task : t)) : old
      );
    });

    socket.on('task:moved', (task: Task) => {
      queryClient.setQueryData<Task[]>(tasksKey, (old) =>
        old ? old.map((t) => (t._id === task._id ? task : t)) : old
      );
    });

    socket.on('task:deleted', ({ taskId }: { taskId: string }) => {
      queryClient.setQueryData<Task[]>(tasksKey, (old) => (old ? old.filter((t) => t._id !== taskId) : old));
    });

    socket.on('list:created', (list: List) => {
      queryClient.setQueryData<{ board: any; lists: List[] } | undefined>(listsKey, (old) =>
        old ? { ...old, lists: [...old.lists, list] } : old
      );
    });

    socket.on('list:deleted', ({ listId }: { listId: string }) => {
      queryClient.setQueryData<{ board: any; lists: List[] } | undefined>(listsKey, (old) =>
        old ? { ...old, lists: old.lists.filter((l) => l._id !== listId) } : old
      );
    });

    socket.on('comment:created', (comment: any) => {
      queryClient.invalidateQueries({ queryKey: ['comments', comment.task] });
    });

    return () => {
      socket.emit('board:leave', boardId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [boardId, workspaceId, accessToken, queryClient]);
}
