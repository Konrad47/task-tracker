import { TaskBoard } from '@/features/tasks/task-board';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Task Tracker</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Create tasks, filter by status, and keep work moving.
        </p>
      </header>
      <TaskBoard />
    </main>
  );
}
