import { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format, isPast } from 'date-fns';
import type { Task } from '../types';

interface MenuListOption {
  _id: string;
  name: string;
  taskCount: number;
  isCurrent: boolean;
}

interface TaskCardProps {
  task: Task;
  index: number;
  priorityNumber: number;
  onClick: () => void;
  menuLists: MenuListOption[];
  onMoveTo: (targetListId: string, position?: number) => void;
}

export function TaskCard({ task, index, priorityNumber, onClick, menuLists, onMoveTo }: TaskCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [positionInputFor, setPositionInputFor] = useState<{ listId: string; listName: string; maxPosition: number } | null>(null);
  const [positionValue, setPositionValue] = useState('');
  const [positionError, setPositionError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const overdue = task.dueDate && isPast(new Date(task.dueDate));

  useEffect(() => {
    if (!showMoveMenu) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMoveMenu(false);
        setPositionInputFor(null);
        setPositionError(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoveMenu]);

  function handlePositionSubmit() {
    if (!positionInputFor) return;

    const trimmed = positionValue.trim();
    if (!/^\d+$/.test(trimmed)) {
      setPositionError('Invalid input! Please enter numbers only.');
      return;
    }

    const num = parseInt(trimmed, 10);
    if (num < 1 || num > positionInputFor.maxPosition) {
      setPositionError(
        `Invalid position! Only positions between 1 and ${positionInputFor.maxPosition} exist in "${positionInputFor.listName}".`
      );
      return;
    }

    onMoveTo(positionInputFor.listId, num - 1);
    setPositionInputFor(null);
    setPositionValue('');
    setPositionError(null);
    setShowMoveMenu(false);
  }

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`mb-2.5 cursor-pointer rounded-lg border border-border bg-surface p-3.5 transition ${
            snapshot.isDragging ? 'shadow-lg shadow-brand-violet/10 rotate-1' : 'hover:border-brand-violet/40'
          }`}
        >
          <div className="mb-1.5 flex items-center justify-between gap-1.5">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-surface-hover text-[10px] font-bold text-text-secondary">
              {priorityNumber}
            </span>

            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoveMenu((v) => !v);
                  setPositionInputFor(null);
                }}
                className="rounded px-1.5 py-0.5 text-xs text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                aria-label="Move or reorder this task"
              >
                Move ▾
              </button>

              {showMoveMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full z-10 mt-1 w-60 rounded-lg border border-border bg-surface py-1 shadow-lg"
                >
                  {!positionInputFor ? (
                    menuLists.map((l) => (
                      <div key={l._id} className="flex items-center justify-between px-2 py-1 hover:bg-surface-hover">
                        <button
                          onClick={() => {
                            if (!l.isCurrent) onMoveTo(l._id);
                          }}
                          disabled={l.isCurrent}
                          className={`flex-1 py-0.5 text-left text-xs ${
                            l.isCurrent ? 'text-text-secondary' : 'text-text-primary'
                          }`}
                        >
                          {l.name} {l.isCurrent && <span className="text-[10px]">(current list)</span>}
                        </button>
                        <button
                          onClick={() =>
                            setPositionInputFor({
                              listId: l._id,
                              listName: l.name,
                              maxPosition: l.isCurrent ? l.taskCount : l.taskCount + 1,
                            })
                          }
                          className="rounded px-1.5 py-0.5 text-[10px] text-brand-violet hover:bg-brand-violet/10"
                          title="Move to an exact position"
                        >
                          #
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5">
                      <p className="mb-1.5 text-xs text-text-secondary">
                        Position in "{positionInputFor.listName}" (1–{positionInputFor.maxPosition}):
                      </p>
                      <div className="flex gap-1.5">
                        <input
                          autoFocus
                          type="text"
                          inputMode="numeric"
                          value={positionValue}
                          onChange={(e) => {
                            setPositionValue(e.target.value);
                            setPositionError(null);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handlePositionSubmit()}
                          placeholder="e.g. 3"
                          className="w-16 rounded border border-border bg-bg px-2 py-1 text-xs text-text-primary outline-none focus:border-brand-violet"
                        />
                        <button
                          onClick={handlePositionSubmit}
                          className="rounded bg-brand-gradient px-2 py-1 text-xs font-medium text-white"
                        >
                          Go
                        </button>
                        <button
                          onClick={() => {
                            setPositionInputFor(null);
                            setPositionError(null);
                          }}
                          className="rounded px-2 py-1 text-xs text-text-secondary hover:bg-surface-hover"
                        >
                          Back
                        </button>
                      </div>
                      {positionError && <p className="mt-1.5 text-[11px] text-danger">{positionError}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {task.labels.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-brand-violet/10 px-2 py-0.5 text-xs font-medium text-brand-violet"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm font-medium text-text-primary">{task.title}</p>

          <div className="mt-2.5 flex items-center justify-between">
            {task.dueDate ? (
              <span className={`text-xs ${overdue ? 'text-danger' : 'text-text-secondary'}`}>
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            ) : (
              <span />
            )}

            {Array.isArray(task.assignees) && task.assignees.length > 0 && (
              <div className="flex -space-x-1.5">
                {task.assignees
                  .filter((assignee) => assignee && typeof assignee === 'object' && assignee.name)
                  .slice(0, 3)
                  .map((assignee) => (
                    <div
                      key={assignee.id}
                      title={assignee.name}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-semibold text-white ring-2 ring-surface"
                    >
                      {assignee.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
