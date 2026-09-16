import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQueryClient } from '@/test-utils';
import { TaskCreateForm } from './task-create-form';

vi.mock('@/lib/api', () => ({
  createTask: vi.fn(),
}));

import { createTask } from '@/lib/api';

const createTaskMock = vi.mocked(createTask);

describe('TaskCreateForm', () => {
  beforeEach(() => {
    createTaskMock.mockReset();
  });

  it('shows a validation error and does not call the API when title is empty', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<TaskCreateForm />);

    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(createTaskMock).not.toHaveBeenCalled();
  });

  it('submits entered values to createTask', async () => {
    const user = userEvent.setup();
    createTaskMock.mockResolvedValue({
      id: '1',
      title: 'Ship it',
      description: 'Notes',
      status: 'in_progress',
      userId: 'dev-user',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    renderWithQueryClient(<TaskCreateForm />);

    await user.type(screen.getByLabelText('Title'), 'Ship it');
    await user.type(screen.getByLabelText('Description'), 'Notes');
    await user.selectOptions(screen.getByLabelText('Status'), 'in_progress');
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    await waitFor(() => {
      expect(createTaskMock.mock.calls[0]?.[0]).toEqual({
        title: 'Ship it',
        description: 'Notes',
        status: 'in_progress',
      });
    });
  });

  it('shows an API error message', async () => {
    const user = userEvent.setup();
    createTaskMock.mockRejectedValue(new Error('Server unavailable'));
    renderWithQueryClient(<TaskCreateForm />);

    await user.type(screen.getByLabelText('Title'), 'Ship it');
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(await screen.findByText('Server unavailable')).toBeInTheDocument();
  });

  it('shows Saving… while the request is in flight', async () => {
    const user = userEvent.setup();
    createTaskMock.mockImplementation(() => new Promise(() => undefined));
    renderWithQueryClient(<TaskCreateForm />);

    await user.type(screen.getByLabelText('Title'), 'Ship it');
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(
      await screen.findByRole('button', { name: 'Saving…' }),
    ).toBeDisabled();
  });
});
