import { TASK_STATUSES, type TaskStatus } from '@task-tracker/shared';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export const FILTERS = ['all', ...TASK_STATUSES] as const;
export type StatusFilter = (typeof FILTERS)[number];
