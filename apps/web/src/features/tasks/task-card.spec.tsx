import type { Task } from '@task-tracker/shared';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQueryClient } from '@/test-utils';
import { TaskCard } from './task-card';

vi.mock('@/lib/api', () => ({
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

import { deleteTask, updateTask } from '@/lib/api';

const updateTaskMock = vi.mocked(updateTask);
const deleteTaskMock = vi.mocked(deleteTask);

const task: Task = {
  id: 'task-1',
  title: 'Write tests',
  description: 'Cover the board',
  status: 'todo',
  userId: 'dev-user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('TaskCard', () => {
  beforeEach(() => {
    updateTaskMock.mockReset();
    deleteTaskMock.mockReset();
  });

  it('shows title, description, and status in view mode', () => {
    renderWithQueryClient(<TaskCard task={task} />);

    expect(screen.getByRole('heading', { name: 'Write tests' })).toBeInTheDocument();
    expect(screen.getByText('Cover the board')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Change status' })).toHaveValue('todo');
  });

  it('saves edits for that task', async () => {
    const user = userEvent.setup();
    updateTaskMock.mockResolvedValue({ ...task, title: 'Write more tests' });
    renderWithQueryClient(<TaskCard task={task} />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const title = screen.getByLabelText('Title');
    await user.clear(title);
    await user.type(title, 'Write more tests');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith(
        'task-1',
        expect.objectContaining({ title: 'Write more tests' }),
      );
    });
  });

  it('deletes the task', async () => {
    const user = userEvent.setup();
    deleteTaskMock.mockResolvedValue(undefined);
    renderWithQueryClient(<TaskCard task={task} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(deleteTaskMock).toHaveBeenCalledWith('task-1');
    });
  });

  it('shows a delete error', async () => {
    const user = userEvent.setup();
    deleteTaskMock.mockRejectedValue(new Error('Cannot delete'));
    renderWithQueryClient(<TaskCard task={task} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Cannot delete')).toBeInTheDocument();
  });
});
