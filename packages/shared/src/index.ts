export * from './task';

export const API_PREFIX = '/api';
export const API_ROUTES = {
  health: `${API_PREFIX}/health`,
  tasks: `${API_PREFIX}/tasks`,
  task: (id: string) => `${API_PREFIX}/tasks/${id}`,
} as const;
