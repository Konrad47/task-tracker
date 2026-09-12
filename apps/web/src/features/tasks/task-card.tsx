'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { TASK_STATUSES, type Task, updateTaskSchema } from '@task-tracker/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { deleteTask, updateTask } from '@/lib/api';
import { STATUS_LABELS } from './status';

export function TaskCard({ task }: { task: Task }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const form = useForm({
    resolver: zodResolver(updateTaskSchema),
    values: {
      title: task.title,
      description: task.description ?? '',
      status: task.status,
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

  const updateMutation = useMutation({
    mutationFn: (input: { title?: string; description?: string; status?: Task['status'] }) =>
      updateTask(task.id, input),
    onSuccess: async () => {
      setEditing(false);
      await invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: invalidate,
  });

  return (
    <Card className="grid gap-3">
      {editing ? (
        <form
          className="grid gap-3"
          onSubmit={form.handleSubmit((values) =>
            updateMutation.mutate({
              ...values,
              description: values.description ?? undefined,
            }),
          )}
        >
          <div className="grid gap-1.5">
            <Label htmlFor={`title-${task.id}`}>Title</Label>
            <Input id={`title-${task.id}`} {...form.register('title')} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`description-${task.id}`}>Description</Label>
            <Textarea id={`description-${task.id}`} {...form.register('description')} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`status-${task.id}`}>Status</Label>
            <Select id={`status-${task.id}`} {...form.register('status')}>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </div>
          {updateMutation.error ? (
            <p className="text-sm text-red-600">{updateMutation.error.message}</p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
              Save
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">{task.title}</h3>
              {task.description ? (
                <p className="mt-1 text-sm text-zinc-600">{task.description}</p>
              ) : null}
            </div>
            <Badge>{STATUS_LABELS[task.status]}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor={`quick-status-${task.id}`} className="sr-only">
              Change status
            </Label>
            <Select
              id={`quick-status-${task.id}`}
              className="w-auto"
              value={task.status}
              onChange={(event) =>
                updateMutation.mutate({ status: event.target.value as Task['status'] })
              }
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
          {deleteMutation.error ? (
            <p className="text-sm text-red-600">{deleteMutation.error.message}</p>
          ) : null}
        </>
      )}
    </Card>
  );
}
