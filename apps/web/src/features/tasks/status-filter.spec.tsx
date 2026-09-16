import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StatusFilterBar } from './status-filter';

describe('StatusFilterBar', () => {
  it('notifies the parent when a filter is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatusFilterBar value="all" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'To do' }));
    await user.click(screen.getByRole('button', { name: 'In progress' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await user.click(screen.getByRole('button', { name: 'All' }));

    expect(onChange.mock.calls.map((call) => call[0])).toEqual([
      'todo',
      'in_progress',
      'done',
      'all',
    ]);
  });
});
