import { useState } from 'react';
import type { FormEvent } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import type { List, Task } from '../types';

interface BoardColumnProps {
  list: List;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (listId: string, title: string) => void;
}

export function BoardColumn({ list, tasks, onTaskClick, onAddTask }: BoardColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(list._id, title.trim());
    setTitle('');
    setIsAdding(false);
  }

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-xl bg-surface/60 border border-border">
      <div className="flex items-center justify-between px-3.5 py-3">
        <h3 className="font-display text-sm font-semibold text-text-primary">{list.name}</h3>
        <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-text-secondary">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={list._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto px-2.5 pb-2 transition-colors ${
              snapshot.isDraggingOver ? 'bg-brand-violet/5' : ''
            }`}
            style={{ minHeight: '60px' }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                priorityNumber={index + 1}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="p-2.5 pt-0">
        {isAdding ? (
          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => !title.trim() && setIsAdding(false)}
              placeholder="Task title..."
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
            />
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}
