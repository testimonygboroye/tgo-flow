import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getBoardRequest, createListRequest } from '../services/board.service';
import { listTasksRequest, createTaskRequest, moveTaskRequest } from '../services/task.service';
import { getWorkspaceMembersRequest } from '../services/workspace.service';
import { useBoardSocket } from '../hooks/useBoardSocket';
import { BoardColumn } from '../components/BoardColumn';
import { BoardFilterBar } from '../components/BoardFilterBar';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import type { Task } from '../types';

export function BoardPage() {
  const { workspaceId, boardId } = useParams<{ workspaceId: string; boardId: string }>();
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [newListName, setNewListName] = useState('');

  useBoardSocket(boardId, workspaceId);

  const { data: boardData, isLoading: boardLoading } = useQuery({
    queryKey: ['board', workspaceId, boardId],
    queryFn: () => getBoardRequest(workspaceId!, boardId!),
    enabled: !!workspaceId && !!boardId,
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', workspaceId, boardId],
    queryFn: () => listTasksRequest(workspaceId!, boardId!),
    enabled: !!workspaceId && !!boardId,
  });

  const { data: members } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => getWorkspaceMembersRequest(workspaceId!),
    enabled: !!workspaceId,
  });

  async function handleAddTask(listId: string, title: string) {
    if (!workspaceId || !boardId) return;
    const task = await createTaskRequest(workspaceId, boardId, listId, { title });
    queryClient.setQueryData<Task[]>(['tasks', workspaceId, boardId], (old) => (old ? [...old, task] : [task]));
  }

  async function handleAddList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName.trim() || !workspaceId || !boardId) return;
    await createListRequest(workspaceId, boardId, newListName.trim());
    setNewListName('');
    setIsAddingList(false);
    queryClient.invalidateQueries({ queryKey: ['board', workspaceId, boardId] });
  }

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination || !workspaceId || !boardId) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const tasksKey = ['tasks', workspaceId, boardId];
    const previousTasks = queryClient.getQueryData<Task[]>(tasksKey);

    queryClient.setQueryData<Task[]>(tasksKey, (old) => {
      if (!old) return old;
      return old.map((t) =>
        t._id === draggableId ? { ...t, list: destination.droppableId, position: destination.index } : t
      );
    });

    try {
      await moveTaskRequest(workspaceId, boardId, draggableId, destination.droppableId, destination.index);
    } catch {
      queryClient.setQueryData(tasksKey, previousTasks);
    }
  }

  const filteredTasks = (tasks || []).filter((task) => {
    const matchesSearch =
      searchTerm.trim().length === 0 ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLabels =
      selectedLabels.length === 0 || selectedLabels.some((label) => task.labels.includes(label));

    const matchesAssignees =
      selectedAssigneeIds.length === 0 ||
      task.assignees.some((a) => selectedAssigneeIds.includes(a.id));

    return matchesSearch && matchesLabels && matchesAssignees;
  });

  function toggleLabel(label: string) {
    setSelectedLabels((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
  }

  function toggleAssignee(userId: string) {
    setSelectedAssigneeIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }

  function clearFilters() {
    setSearchTerm('');
    setSelectedLabels([]);
    setSelectedAssigneeIds([]);
  }

  if (boardLoading || !boardData) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
      </div>
    );
  }

  const { board, lists } = boardData;
  const sortedLists = [...lists].sort((a, b) => a.position - b.position);

  return (
    <div className="flex h-screen flex-col bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to={`/workspaces/${workspaceId}`} className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
            </Link>
            <span className="text-text-secondary">/</span>
            <h1 className="font-display text-lg font-bold text-text-primary">{board.name}</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <BoardFilterBar
        tasks={tasks || []}
        members={members || []}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedLabels={selectedLabels}
        onToggleLabel={toggleLabel}
        selectedAssigneeIds={selectedAssigneeIds}
        onToggleAssignee={toggleAssignee}
        onClearFilters={clearFilters}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto p-6">
          {sortedLists.map((list) => (
            <BoardColumn
              key={list._id}
              list={list}
              tasks={filteredTasks.filter((t) => t.list === list._id).sort((a, b) => a.position - b.position)}
              onTaskClick={setSelectedTask}
              onAddTask={handleAddTask}
            />
          ))}

          <div className="w-72 flex-shrink-0">
            {isAddingList ? (
              <form onSubmit={handleAddList} className="rounded-xl border border-border bg-surface p-3">
                <input
                  autoFocus
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onBlur={() => !newListName.trim() && setIsAddingList(false)}
                  placeholder="List name..."
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                />
              </form>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="w-full rounded-xl border border-dashed border-border bg-surface/40 px-4 py-3 text-sm text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
              >
                + Add list
              </button>
            )}
          </div>
        </div>
      </DragDropContext>

      {selectedTask && workspaceId && boardId && (
        <TaskDetailModal
          task={selectedTask}
          workspaceId={workspaceId}
          boardId={boardId}
          members={members || []}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
