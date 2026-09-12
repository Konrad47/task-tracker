import { API_ROUTES, type CreateTaskInput, type Task, type TaskStatus, type UpdateTaskInput } from '@task-tracker/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID ?? 'dev-user';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': DEV_USER_ID,
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

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
