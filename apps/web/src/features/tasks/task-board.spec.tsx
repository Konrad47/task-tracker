import type { Task } from '@task-tracker/shared';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQueryClient } from '@/test-utils';
import { TaskBoard } from './task-board';

vi.mock('@/lib/api', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

import { fetchTasks } from '@/lib/api';

const fetchTasksMock = vi.mocked(fetchTasks);

const sampleTask: Task = {
  id: 'task-1',
  title: 'Board item',
  description: null,
  status: 'todo',
  userId: 'dev-user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TaskBoard', () => {
  beforeEach(() => {
    fetchTasksMock.mockReset();
  });

  it('shows loading copy while tasks are fetching', () => {
    fetchTasksMock.mockImplementation(() => new Promise(() => undefined));
    renderWithQueryClient(<TaskBoard />);

    expect(screen.getByText('Loading tasks…')).toBeInTheDocument();
  });

  it('shows an error message when loading fails', async () => {
    fetchTasksMock.mockRejectedValue(new Error('Offline'));
    renderWithQueryClient(<TaskBoard />);

    expect(await screen.findByText('Offline')).toBeInTheDocument();
  });

  it('shows an empty state when there are no tasks', async () => {
    fetchTasksMock.mockResolvedValue([]);
    renderWithQueryClient(<TaskBoard />);

    expect(await screen.findByText('No tasks in this view yet.')).toBeInTheDocument();
  });

  it('renders loaded task titles', async () => {
    fetchTasksMock.mockResolvedValue([sampleTask]);
    renderWithQueryClient(<TaskBoard />);

    expect(await screen.findByRole('heading', { name: 'Board item' })).toBeInTheDocument();
  });

  it('refetches with the selected status filter', async () => {
    const user = userEvent.setup();
    fetchTasksMock.mockResolvedValue([]);
    renderWithQueryClient(<TaskBoard />);

    await screen.findByText('No tasks in this view yet.');
    await user.click(screen.getByRole('button', { name: 'To do' }));

    await waitFor(() => {
      expect(fetchTasksMock).toHaveBeenCalledWith('todo');
    });
  });
});
