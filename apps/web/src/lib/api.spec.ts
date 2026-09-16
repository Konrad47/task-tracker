import { API_ROUTES } from '@task-tracker/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTask, deleteTask, fetchTasks, updateTask } from './api';

const API_BASE = 'http://localhost:3001';

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe('api client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function stubFetch(
    response: {
      ok: boolean;
      status: number;
      json: () => Promise<unknown>;
    },
  ) {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  it('lists tasks without a status query', async () => {
    const fetchMock = stubFetch(jsonResponse([]));

    await fetchTasks();

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}${API_ROUTES.tasks}`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-user-id': 'dev-user',
        }),
      }),
    );
  });

  it('adds a status query for a real status and omits it for all', async () => {
    const fetchMock = stubFetch(jsonResponse([]));

    await fetchTasks('done');
    await fetchTasks('all');

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `${API_BASE}${API_ROUTES.tasks}?status=done`,
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      `${API_BASE}${API_ROUTES.tasks}`,
    );
  });

  it('creates a task with POST and JSON body', async () => {
    const created = { id: '1', title: 'New' };
    const fetchMock = stubFetch(jsonResponse(created));
    const input = { title: 'New', status: 'todo' as const };

    await expect(createTask(input)).resolves.toEqual(created);
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}${API_ROUTES.tasks}`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
      }),
    );
  });

  it('updates a task with PATCH', async () => {
    const fetchMock = stubFetch(jsonResponse({ id: 'abc' }));

    await updateTask('abc', { title: 'Renamed' });

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}${API_ROUTES.task('abc')}`,
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ title: 'Renamed' }),
      }),
    );
  });

  it('deletes a task and returns undefined on 204', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('no body');
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteTask('abc')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE}${API_ROUTES.task('abc')}`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('throws the API message when a request fails', async () => {
    stubFetch(jsonResponse({ message: 'Validation failed' }, 400));

    await expect(createTask({ title: 'x' })).rejects.toThrow(
      'Validation failed',
    );
  });

  it('throws a status fallback when the error body has no message', async () => {
    stubFetch(jsonResponse(null, 500));

    await expect(fetchTasks()).rejects.toThrow('Request failed (500)');
  });
});
