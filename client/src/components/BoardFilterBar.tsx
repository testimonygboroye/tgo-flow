import { useMemo } from 'react';
import type { Task, Member } from '../types';

interface BoardFilterBarProps {
  tasks: Task[];
  members: Member[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedLabels: string[];
  onToggleLabel: (label: string) => void;
  selectedAssigneeIds: string[];
  onToggleAssignee: (userId: string) => void;
  onClearFilters: () => void;
}

export function BoardFilterBar({
  tasks,
  members,
  searchTerm,
  onSearchChange,
  selectedLabels,
  onToggleLabel,
  selectedAssigneeIds,
  onToggleAssignee,
  onClearFilters,
}: BoardFilterBarProps) {
  const allLabels = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.labels.forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [tasks]);

  const hasActiveFilters = searchTerm.length > 0 || selectedLabels.length > 0 || selectedAssigneeIds.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-6 py-3">
      <div className="relative min-w-[200px] flex-1 max-w-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-lg border border-border bg-bg py-1.5 pl-9 pr-3 text-sm text-text-primary outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
        />
      </div>

      {allLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {allLabels.map((label) => (
            <button
              key={label}
              onClick={() => onToggleLabel(label)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                selectedLabels.includes(label)
                  ? 'bg-brand-violet text-white'
                  : 'bg-surface-hover text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {members.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {members.map((m) => (
            <button
              key={m.membershipId}
              onClick={() => onToggleAssignee(m.user.id)}
              title={m.user.name}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white transition ${
                selectedAssigneeIds.includes(m.user.id)
                  ? 'bg-brand-gradient ring-2 ring-brand-violet ring-offset-1 ring-offset-surface'
                  : 'bg-brand-gradient opacity-40 hover:opacity-70'
              }`}
            >
              {m.user.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="ml-auto text-xs font-medium text-text-secondary hover:text-brand-violet"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
