import {
  API_ROUTES,
  type CreateTaskInput,
  type Task,
  type TaskStatus,
  type UpdateTaskInput,
} from '@task-tracker/shared';
import { request } from '@/lib/api-client';

export function fetchTasks(status?: TaskStatus | 'all') {
  const query = status && status !== 'all' ? `?status=${status}` : '';
  return request<Task[]>(`${API_ROUTES.tasks}${query}`);
}

export function createTask(input: CreateTaskInput) {
  return request<Task>(API_ROUTES.tasks, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateTask(id: string, input: UpdateTaskInput) {
  return request<Task>(API_ROUTES.task(id), {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteTask(id: string) {
  return request<void>(API_ROUTES.task(id), { method: 'DELETE' });
}
