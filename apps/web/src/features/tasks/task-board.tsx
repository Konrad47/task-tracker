'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchTasks } from '@/lib/api';
import { StatusFilterBar } from './status-filter';
import type { StatusFilter } from './status';
import { TaskCard } from './task-card';
import { TaskCreateForm } from './task-create-form';

export function TaskBoard() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const tasksQuery = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => fetchTasks(filter),
  });

  return (
    <div className="grid gap-6">
      <TaskCreateForm />
      <StatusFilterBar value={filter} onChange={setFilter} />
      {tasksQuery.isLoading ? <p className="text-sm text-zinc-600">Loading tasks…</p> : null}
      {tasksQuery.isError ? (
        <p className="text-sm text-red-600">
          {tasksQuery.error instanceof Error ? tasksQuery.error.message : 'Failed to load tasks'}
        </p>
      ) : null}
      {tasksQuery.data && tasksQuery.data.length === 0 ? (
        <p className="text-sm text-zinc-600">No tasks in this view yet.</p>
      ) : null}
      <div className="grid gap-3">
        {tasksQuery.data?.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
