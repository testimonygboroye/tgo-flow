import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DragDropContext } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getBoardRequest, createListRequest, updateBoardNameRequest, deleteBoardRequest } from '../services/board.service';
import { listTasksRequest, createTaskRequest, moveTaskRequest } from '../services/task.service';
import { getWorkspaceMembersRequest } from '../services/workspace.service';
import { useBoardSocket } from '../hooks/useBoardSocket';
import { BoardColumn } from '../components/BoardColumn';
import { BoardFilterBar } from '../components/BoardFilterBar';
import { TaskDetailModal } from '../components/TaskDetailModal';
import { Logo } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { HelpButton } from '../components/HelpButton';
import { useAuthStore } from '../store/auth.store';
import { filterTasks } from '../utils/taskFilters';
import type { Task } from '../types';

export function BoardPage() {
  const { workspaceId, boardId } = useParams<{ workspaceId: string; boardId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [isEditingBoardName, setIsEditingBoardName] = useState(false);
  const [editedBoardName, setEditedBoardName] = useState('');

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

  const myMembership = members?.find((m) => m.user.id === user?.id || (m.user as any)._id === user?.id);
  const canManage = myMembership?.role === 'owner' || myMembership?.role === 'admin';

  const filteredTasks = filterTasks(tasks || [], { searchTerm, selectedLabels, selectedAssigneeIds });

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

  // Note: we intentionally do NOT update the local cache here. The server
  // broadcasts every create/move back over the socket to the acting user
  // too — relying on that single path avoids duplicate or conflicting
  // task entries, which is what caused the earlier duplication bug.
  async function handleAddTask(listId: string, title: string) {
    if (!workspaceId || !boardId) return;
    await createTaskRequest(workspaceId, boardId, listId, { title });
  }

  async function handleAddList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName.trim() || !workspaceId || !boardId) return;
    await createListRequest(workspaceId, boardId, newListName.trim());
    setNewListName('');
    setIsAddingList(false);
    queryClient.invalidateQueries({ queryKey: ['board', workspaceId, boardId] });
  }

  async function handleSaveBoardName() {
    if (!workspaceId || !boardId || !editedBoardName.trim()) {
      setIsEditingBoardName(false);
      return;
    }
    await updateBoardNameRequest(workspaceId, boardId, editedBoardName.trim());
    queryClient.invalidateQueries({ queryKey: ['board', workspaceId, boardId] });
    setIsEditingBoardName(false);
  }

  async function handleDeleteBoard() {
    if (!workspaceId || !boardId || !boardData) return;
    if (!confirm(`Delete "${boardData.board.name}"? All its tasks will be permanently deleted. This cannot be undone.`)) return;
    await deleteBoardRequest(workspaceId, boardId);
    navigate(`/workspaces/${workspaceId}`);
  }

  async function handleMoveTask(taskId: string, targetListId: string, targetPosition?: number) {
    if (!workspaceId || !boardId) return;
    const position =
      targetPosition !== undefined ? targetPosition : (tasks || []).filter((t) => t.list === targetListId).length;
    await moveTaskRequest(workspaceId, boardId, taskId, targetListId, position);
  }

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination || !workspaceId || !boardId) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    await moveTaskRequest(workspaceId, boardId, draggableId, destination.droppableId, destination.index);
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
            {isEditingBoardName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={editedBoardName}
                  onChange={(e) => setEditedBoardName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveBoardName()}
                  className="rounded-lg border border-border bg-bg px-2.5 py-1 text-lg font-bold text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                />
                <button onClick={handleSaveBoardName} className="rounded-lg bg-brand-gradient px-2.5 py-1 text-xs font-medium text-white">
                  Save
                </button>
                <button onClick={() => setIsEditingBoardName(false)} className="rounded-lg px-2.5 py-1 text-xs text-text-secondary hover:bg-surface-hover">
                  Cancel
                </button>
              </div>
            ) : (
              <h1 className="font-display text-lg font-bold text-text-primary">{board.name}</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canManage && !isEditingBoardName && (
              <>
                <button
                  onClick={() => { setEditedBoardName(board.name); setIsEditingBoardName(true); }}
                  className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-primary hover:bg-surface-hover"
                >
                  Rename
                </button>
                <button
                  onClick={handleDeleteBoard}
                  className="rounded-lg border border-danger/30 px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                >
                  Delete
                </button>
              </>
            )}
            <HelpButton />
            <ThemeToggle />
          </div>
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
              allLists={sortedLists}
              allTasks={tasks || []}
              tasks={filteredTasks.filter((t) => t.list === list._id).sort((a, b) => a.position - b.position)}
              onTaskClick={setSelectedTask}
              onAddTask={handleAddTask}
              onMoveTask={handleMoveTask}
            />
          ))}

          {canManage && (
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
          )}
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
