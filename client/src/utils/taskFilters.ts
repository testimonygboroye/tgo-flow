import type { Task } from '../types';

export interface TaskFilterOptions {
  searchTerm: string;
  selectedLabels: string[];
  selectedAssigneeIds: string[];
}

export function filterTasks(tasks: Task[], options: TaskFilterOptions): Task[] {
  const { searchTerm, selectedLabels, selectedAssigneeIds } = options;
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.description.toLowerCase().includes(normalizedSearch);

    const matchesLabels =
      selectedLabels.length === 0 || selectedLabels.some((label) => task.labels.includes(label));

    const matchesAssignees =
      selectedAssigneeIds.length === 0 ||
      task.assignees.some((a) => selectedAssigneeIds.includes(a.id));

    return matchesSearch && matchesLabels && matchesAssignees;
  });
}
