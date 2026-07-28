import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format, isPast } from 'date-fns';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  index: number;
  priorityNumber: number;
  onClick: () => void;
  otherLists: { _id: string; name: string }[];
  onMoveTo: (targetListId: string) => void;
}

export function TaskCard({ task, index, priorityNumber, onClick, otherLists, onMoveTo }: TaskCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const overdue = task.dueDate && isPast(new Date(task.dueDate));

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

            {otherLists.length > 0 && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoveMenu((v) => !v);
                  }}
                  className="rounded px-1.5 py-0.5 text-xs text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  aria-label="Move task to another list"
                >
                  Move ▾
                </button>

                {showMoveMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-surface py-1 shadow-lg"
                  >
                    {otherLists.map((l) => (
                      <button
                        key={l._id}
                        onClick={() => {
                          onMoveTo(l._id);
                          setShowMoveMenu(false);
                        }}
                        className="block w-full px-3 py-1.5 text-left text-xs text-text-primary hover:bg-surface-hover"
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
