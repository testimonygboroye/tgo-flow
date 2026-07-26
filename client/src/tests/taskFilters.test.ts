import { describe, it, expect } from 'vitest';
import { filterTasks } from '../utils/taskFilters';
import type { Task } from '../types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    _id: 'task-1',
    list: 'list-1',
    board: 'board-1',
    title: 'Design homepage mockup',
    description: 'Create a Figma mockup for the new homepage',
    position: 0,
    assignees: [],
    labels: [],
    dueDate: null,
    createdBy: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('filterTasks', () => {
  it('returns all tasks when no filters are applied', () => {
    const tasks = [makeTask(), makeTask({ _id: 'task-2', title: 'Fix login bug' })];
    const result = filterTasks(tasks, { searchTerm: '', selectedLabels: [], selectedAssigneeIds: [] });
    expect(result).toHaveLength(2);
  });

  it('filters by search term matching the title', () => {
    const tasks = [makeTask({ title: 'Design homepage mockup' }), makeTask({ _id: 'task-2', title: 'Fix login bug' })];
    const result = filterTasks(tasks, { searchTerm: 'login', selectedLabels: [], selectedAssigneeIds: [] });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Fix login bug');
  });

  it('filters by search term matching the description', () => {
    const tasks = [
      makeTask({ title: 'Task A', description: 'Contains the word banana' }),
      makeTask({ _id: 'task-2', title: 'Task B', description: 'Nothing special here' }),
    ];
    const result = filterTasks(tasks, { searchTerm: 'banana', selectedLabels: [], selectedAssigneeIds: [] });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Task A');
  });

  it('search is case-insensitive', () => {
    const tasks = [makeTask({ title: 'URGENT Fix Required' })];
    const result = filterTasks(tasks, { searchTerm: 'urgent', selectedLabels: [], selectedAssigneeIds: [] });
    expect(result).toHaveLength(1);
  });

  it('filters by a single selected label', () => {
    const tasks = [
      makeTask({ labels: ['design'] }),
      makeTask({ _id: 'task-2', labels: ['bug'] }),
    ];
    const result = filterTasks(tasks, { searchTerm: '', selectedLabels: ['design'], selectedAssigneeIds: [] });
    expect(result).toHaveLength(1);
    expect(result[0].labels).toContain('design');
  });

  it('matches tasks with ANY of multiple selected labels (OR logic)', () => {
    const tasks = [
      makeTask({ labels: ['design'] }),
      makeTask({ _id: 'task-2', labels: ['bug'] }),
      makeTask({ _id: 'task-3', labels: ['urgent'] }),
    ];
    const result = filterTasks(tasks, { searchTerm: '', selectedLabels: ['design', 'bug'], selectedAssigneeIds: [] });
    expect(result).toHaveLength(2);
  });

  it('filters by assignee', () => {
    const tasks = [
      makeTask({ assignees: [{ id: 'user-1', name: 'Alice', email: 'a@example.com' }] }),
      makeTask({ _id: 'task-2', assignees: [{ id: 'user-2', name: 'Bob', email: 'b@example.com' }] }),
    ];
    const result = filterTasks(tasks, { searchTerm: '', selectedLabels: [], selectedAssigneeIds: ['user-1'] });
    expect(result).toHaveLength(1);
    expect(result[0].assignees[0].id).toBe('user-1');
  });

  it('combines search, label, and assignee filters with AND logic across categories', () => {
    const tasks = [
      makeTask({
        title: 'Design homepage',
        labels: ['design'],
        assignees: [{ id: 'user-1', name: 'Alice', email: 'a@example.com' }],
      }),
      makeTask({
        _id: 'task-2',
        title: 'Design footer',
        labels: ['design'],
        assignees: [{ id: 'user-2', name: 'Bob', email: 'b@example.com' }],
      }),
    ];
    const result = filterTasks(tasks, {
      searchTerm: 'design',
      selectedLabels: ['design'],
      selectedAssigneeIds: ['user-1'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Design homepage');
  });

  it('returns an empty array when nothing matches', () => {
    const tasks = [makeTask({ title: 'Design homepage' })];
    const result = filterTasks(tasks, { searchTerm: 'nonexistent-term', selectedLabels: [], selectedAssigneeIds: [] });
    expect(result).toHaveLength(0);
  });
});
