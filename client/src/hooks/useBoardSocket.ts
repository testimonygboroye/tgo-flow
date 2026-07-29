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

    // This is the single source of truth for all task changes — created,
    // updated, moved. We deliberately do NOT also mutate the cache locally
    // when the user performs an action; the server always broadcasts back
    // to the acting user too, so relying on this one path avoids duplicate
    // or conflicting updates.
    socket.on('task:created', (task: Task) => {
      queryClient.setQueryData<Task[]>(tasksKey, (old) => {
        if (!old) return [task];
        if (old.some((t) => t._id === task._id)) return old;
        return [...old, task];
      });
    });

    socket.on('task:updated', (task: Task) => {
      queryClient.setQueryData<Task[]>(tasksKey, (old) =>
        old ? old.map((t) => (t._id === task._id ? task : t)) : old
      );
    });

    // Emitted whenever a task is moved — carries every task in the
    // affected list(s), since moving one task renumbers its siblings too.
    socket.on('tasks:reordered', (affectedTasks: Task[]) => {
      queryClient.setQueryData<Task[]>(tasksKey, (old) => {
        if (!old) return affectedTasks;
        const affectedIds = new Set(affectedTasks.map((t) => t._id));
        const untouched = old.filter((t) => !affectedIds.has(t._id));
        return [...untouched, ...affectedTasks];
      });
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
