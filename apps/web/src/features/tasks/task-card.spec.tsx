import type { Task } from '@task-tracker/shared';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQueryClient } from '@/test-utils';
import { TaskCard } from './task-card';

vi.mock('@/features/tasks/api', () => ({
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  fetchTaskActivity: vi.fn(),
}));

import { deleteTask, fetchTaskActivity, updateTask } from '@/features/tasks/api';

const updateTaskMock = vi.mocked(updateTask);
const deleteTaskMock = vi.mocked(deleteTask);
const fetchTaskActivityMock = vi.mocked(fetchTaskActivity);

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
    fetchTaskActivityMock.mockReset();
    fetchTaskActivityMock.mockResolvedValue([]);
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

  it('shows the latest activity transition under the description', async () => {
    fetchTaskActivityMock.mockResolvedValue([
      {
        eventId: 'event-1',
        taskId: task.id,
        from: 'todo',
        to: 'in_progress',
        at: '2026-01-03T00:00:00.000Z',
      },
    ]);
    renderWithQueryClient(<TaskCard task={task} />);

    expect(await screen.findByText('To do → In progress')).toBeInTheDocument();
  });

  it('refreshes activity once after a status change', async () => {
    const user = userEvent.setup();
    updateTaskMock.mockResolvedValue({ ...task, status: 'in_progress' });
    const { queryClient } = renderWithQueryClient(<TaskCard task={task} />);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Change status' }),
      'in_progress',
    );

    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['task-activity', task.id] });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['tasks'] });
    expect(
      invalidate.mock.calls.filter(
        ([filters]) => Array.isArray(filters?.queryKey) && filters.queryKey[0] === 'task-activity',
      ),
    ).toHaveLength(1);
  });

  it('shows a delete error', async () => {
    const user = userEvent.setup();
    deleteTaskMock.mockRejectedValue(new Error('Cannot delete'));
    renderWithQueryClient(<TaskCard task={task} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Cannot delete')).toBeInTheDocument();
  });
});
