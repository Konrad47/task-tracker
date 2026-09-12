'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, TASK_STATUSES } from '@task-tracker/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createTask } from '@/lib/api';
import { STATUS_LABELS } from './status';

export function TaskCreateForm() {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo' as const,
    },
  });

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return (
    <Card>
      <form
        className="grid gap-3"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <h2 className="text-lg font-semibold">New task</h2>
        <div className="grid gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...form.register('title')} />
          {form.formState.errors.title ? (
            <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...form.register('description')} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...form.register('status')}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>
        {mutation.error ? (
          <p className="text-sm text-red-600">{mutation.error.message}</p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Create task'}
        </Button>
      </form>
    </Card>
  );
}
