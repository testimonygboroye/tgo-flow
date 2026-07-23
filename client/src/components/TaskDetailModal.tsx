import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  updateTaskRequest,
  deleteTaskRequest,
  addCommentRequest,
  listCommentsRequest,
} from '../services/task.service';
import type { Task, Member } from '../types';

interface TaskDetailModalProps {
  task: Task;
  workspaceId: string;
  boardId: string;
  members: Member[];
  onClose: () => void;
}

export function TaskDetailModal({ task, workspaceId, boardId, members, onClose }: TaskDetailModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '');
  const [labelsInput, setLabelsInput] = useState(task.labels.join(', '));
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task.assignees.map((a) => a.id));
  const [commentBody, setCommentBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: comments } = useQuery({
    queryKey: ['comments', task._id],
    queryFn: () => listCommentsRequest(workspaceId, boardId, task._id),
  });

  const tasksKey = ['tasks', workspaceId, boardId];

  async function handleSave() {
    setIsSaving(true);
    try {
      const labels = labelsInput.split(',').map((l) => l.trim()).filter(Boolean);
      const updated = await updateTaskRequest(workspaceId, boardId, task._id, {
        title,
        description,
        dueDate: dueDate || null,
        labels,
        assignees: assigneeIds,
      });
      queryClient.setQueryData<Task[]>(tasksKey, (old) =>
        old ? old.map((t) => (t._id === updated._id ? updated : t)) : old
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    await deleteTaskRequest(workspaceId, boardId, task._id);
    queryClient.setQueryData<Task[]>(tasksKey, (old) => (old ? old.filter((t) => t._id !== task._id) : old));
    onClose();
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    await addCommentRequest(workspaceId, boardId, task._id, commentBody.trim());
    setCommentBody('');
    queryClient.invalidateQueries({ queryKey: ['comments', task._id] });
  }

  function toggleAssignee(userId: string) {
    setAssigneeIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="flex-1 bg-transparent font-display text-lg font-bold text-text-primary outline-none"
          />
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            rows={3}
            placeholder="Add a description..."
            className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={handleSave}
              className="w-full rounded-lg border border-border bg-bg px-3.5 py-2 text-sm text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
              Labels (comma separated)
            </label>
            <input
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              onBlur={handleSave}
              placeholder="design, urgent"
              className="w-full rounded-lg border border-border bg-bg px-3.5 py-2 text-sm text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Assignees
          </label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const isAssigned = assigneeIds.includes(m.user.id);
              return (
                <button
                  key={m.membershipId}
                  onClick={() => {
                    toggleAssignee(m.user.id);
                    setTimeout(handleSave, 0);
                  }}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isAssigned
                      ? 'border-brand-violet bg-brand-violet/10 text-brand-violet'
                      : 'border-border text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-[10px] text-white">
                    {m.user.name.charAt(0).toUpperCase()}
                  </span>
                  {m.user.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 border-t border-border pt-4">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Comments
          </label>
          <div className="mb-3 flex max-h-48 flex-col gap-3 overflow-y-auto">
            {comments?.map((c) => (
              <div key={c._id} className="rounded-lg bg-bg p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-[10px] text-white">
                    {c.author.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-text-primary">{c.author.name}</span>
                  <span className="text-xs text-text-secondary">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                </div>
                <p className="text-sm text-text-primary">{c.body}</p>
              </div>
            ))}
            {(!comments || comments.length === 0) && (
              <p className="text-sm text-text-secondary">No comments yet.</p>
            )}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-lg border border-border bg-bg px-3.5 py-2 text-sm text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
            />
            <button type="submit" className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Send
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <button onClick={handleDelete} className="text-sm font-medium text-danger hover:underline">
            Delete task
          </button>
          {isSaving && <span className="text-xs text-text-secondary">Saving...</span>}
        </div>
      </div>
    </div>
  );
}
