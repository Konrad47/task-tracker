import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { TasksService } from './tasks.service';
import { TaskDocument } from './task.schema';

const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_OLDER = new Date('2026-02-01T00:00:00.000Z');
const UPDATED_NEWER = new Date('2026-03-01T00:00:00.000Z');
const CREATE_STAMP = new Date('2026-09-16T12:00:00.000Z');
const UPDATE_STAMP = new Date('2026-09-16T13:00:00.000Z');

type StoredTask = {
  _id: Types.ObjectId;
  title: string;
  description: string | null;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

function toDoc(row: StoredTask) {
  return {
    _id: row._id,
    title: row.title,
    description: row.description,
    status: row.status,
    userId: row.userId,
    get(key: string) {
      if (key === 'createdAt') {
        return row.createdAt;
      }
      if (key === 'updatedAt') {
        return row.updatedAt;
      }
      return undefined;
    },
  };
}

function asId(value: unknown): string {
  if (value instanceof Types.ObjectId) {
    return value.toHexString();
  }
  if (typeof value === 'string') {
    return value;
  }
  throw new Error('unsupported id');
}

function matches(row: StoredTask, filter: Record<string, unknown>): boolean {
  if (filter.userId !== undefined && row.userId !== filter.userId) {
    return false;
  }
  if (filter.status !== undefined && row.status !== filter.status) {
    return false;
  }
  if (filter._id !== undefined && asId(row._id) !== asId(filter._id)) {
    return false;
  }
  return true;
}

function createInMemoryTaskModel(seed: StoredTask[] = []) {
  const docs = seed.map((row) => ({ ...row }));

  return {
    find(filter: Record<string, unknown>) {
      return {
        sort(sortSpec: { updatedAt?: number }) {
          return {
            exec() {
              const direction = sortSpec.updatedAt ?? 1;
              return Promise.resolve(
                docs
                  .filter((row) => matches(row, filter))
                  .sort(
                    (a, b) =>
                      direction *
                      (a.updatedAt.getTime() - b.updatedAt.getTime()),
                  )
                  .map(toDoc),
              );
            },
          };
        },
      };
    },
    findOne(filter: Record<string, unknown>) {
      return {
        exec() {
          const row = docs.find((item) => matches(item, filter));
          return Promise.resolve(row ? toDoc(row) : null);
        },
      };
    },
    create(input: {
      title: string;
      description: string | null;
      status: string;
      userId: string;
    }) {
      const row: StoredTask = {
        _id: new Types.ObjectId(),
        title: input.title,
        description: input.description,
        status: input.status,
        userId: input.userId,
        createdAt: CREATE_STAMP,
        updatedAt: CREATE_STAMP,
      };
      docs.push(row);
      return Promise.resolve(toDoc(row));
    },
    findOneAndUpdate(
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
    ) {
      return {
        exec() {
          const row = docs.find((item) => matches(item, filter));
          if (!row) {
            return Promise.resolve(null);
          }
          Object.assign(row, update);
          row.updatedAt = UPDATE_STAMP;
          return Promise.resolve(toDoc(row));
        },
      };
    },
    findOneAndDelete(filter: Record<string, unknown>) {
      return {
        exec() {
          const index = docs.findIndex((item) => matches(item, filter));
          if (index === -1) {
            return Promise.resolve(null);
          }
          const [row] = docs.splice(index, 1);
          return Promise.resolve(toDoc(row));
        },
      };
    },
  };
}

function createLogger() {
  return {
    setContext: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}

function createService(seed: StoredTask[] = []) {
  const model = createInMemoryTaskModel(seed);
  const logger = createLogger();
  const service = new TasksService(
    model as unknown as Model<TaskDocument>,
    logger as unknown as PinoLogger,
  );
  return { service, logger };
}

function seedTask(
  overrides: Partial<StoredTask> & { userId: string },
): StoredTask {
  return {
    _id: overrides._id ?? new Types.ObjectId(),
    title: overrides.title ?? 'Task',
    description: overrides.description ?? null,
    status: overrides.status ?? 'todo',
    userId: overrides.userId,
    createdAt: overrides.createdAt ?? CREATED_AT,
    updatedAt: overrides.updatedAt ?? UPDATED_OLDER,
  };
}

describe('TasksService', () => {
  const userId = 'user-1';
  const otherUserId = 'user-2';

  it('lists only the caller’s tasks, newest updated first', async () => {
    const mineOlder = seedTask({
      userId,
      title: 'Older',
      updatedAt: UPDATED_OLDER,
    });
    const mineNewer = seedTask({
      userId,
      title: 'Newer',
      updatedAt: UPDATED_NEWER,
    });
    const other = seedTask({
      userId: otherUserId,
      title: 'Other',
      updatedAt: UPDATED_NEWER,
    });
    const { service } = createService([mineOlder, mineNewer, other]);

    const result = await service.list(userId);

    expect(result.map((task) => task.title)).toEqual(['Newer', 'Older']);
    expect(result.every((task) => task.userId === userId)).toBe(true);
  });

  it('filters list by status when provided', async () => {
    const todo = seedTask({ userId, title: 'Todo', status: 'todo' });
    const done = seedTask({ userId, title: 'Done', status: 'done' });
    const { service } = createService([todo, done]);

    const result = await service.list(userId, 'done');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Done');
    expect(result[0].status).toBe('done');
  });

  it('returns a DTO with string id and ISO timestamps', async () => {
    const id = new Types.ObjectId();
    const stored = seedTask({
      _id: id,
      userId,
      title: 'Mapped',
      description: 'Notes',
      status: 'in_progress',
    });
    const { service } = createService([stored]);

    const result = await service.getById(userId, String(id));

    expect(result).toEqual({
      id: String(id),
      title: 'Mapped',
      description: 'Notes',
      status: 'in_progress',
      userId,
      createdAt: CREATED_AT.toISOString(),
      updatedAt: UPDATED_OLDER.toISOString(),
    });
  });

  it('treats another user’s task as not found', async () => {
    const id = new Types.ObjectId();
    const { service, logger } = createService([
      seedTask({ _id: id, userId: otherUserId }),
    ]);

    await expect(service.getById(userId, String(id))).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.getById(userId, String(id))).rejects.toThrow(
      'Task not found',
    );
    expect(logger.warn).toHaveBeenCalledWith(
      { userId, taskId: String(id) },
      'Task not found',
    );
  });

  it('treats an invalid id as not found', async () => {
    const { service, logger } = createService([]);

    await expect(service.getById(userId, 'not-an-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(logger.warn).toHaveBeenCalledWith(
      { userId, taskId: 'not-an-id' },
      'Task not found',
    );
  });

  it('creates a task with default status todo and null blank description', async () => {
    const { service, logger } = createService([]);

    const result = await service.create(userId, {
      title: 'New',
      description: '   ',
    });

    expect(result.title).toBe('New');
    expect(result.status).toBe('todo');
    expect(result.description).toBeNull();
    expect(result.userId).toBe(userId);
    expect(result.createdAt).toBe(CREATE_STAMP.toISOString());
    expect(logger.info).toHaveBeenCalledWith(
      { userId, taskId: result.id },
      'Task created',
    );
  });

  it('updates a owned task and logs the change', async () => {
    const id = new Types.ObjectId();
    const { service, logger } = createService([
      seedTask({ _id: id, userId, title: 'Before', description: 'Old' }),
    ]);

    const result = await service.update(userId, String(id), {
      title: 'After',
      description: null,
      status: 'done',
    });

    expect(result).toMatchObject({
      id: String(id),
      title: 'After',
      description: null,
      status: 'done',
      updatedAt: UPDATE_STAMP.toISOString(),
    });
    expect(logger.info).toHaveBeenCalledWith(
      { userId, taskId: String(id) },
      'Task updated',
    );
  });

  it('does not update another user’s task', async () => {
    const id = new Types.ObjectId();
    const { service } = createService([
      seedTask({ _id: id, userId: otherUserId, title: 'Secret' }),
    ]);

    await expect(
      service.update(userId, String(id), { title: 'Hijack' }),
    ).rejects.toThrow(NotFoundException);

    const stillThere = await service.getById(otherUserId, String(id));
    expect(stillThere.title).toBe('Secret');
  });

  it('removes a owned task and logs deletion', async () => {
    const id = new Types.ObjectId();
    const { service, logger } = createService([seedTask({ _id: id, userId })]);

    await expect(service.remove(userId, String(id))).resolves.toBeUndefined();
    await expect(service.getById(userId, String(id))).rejects.toThrow(
      NotFoundException,
    );
    expect(logger.info).toHaveBeenCalledWith(
      { userId, taskId: String(id) },
      'Task deleted',
    );
  });

  it('does not delete another user’s task', async () => {
    const id = new Types.ObjectId();
    const { service, logger } = createService([
      seedTask({ _id: id, userId: otherUserId }),
    ]);

    await expect(service.remove(userId, String(id))).rejects.toThrow(
      NotFoundException,
    );
    expect(logger.warn).toHaveBeenCalledWith(
      { userId, taskId: String(id) },
      'Task not found',
    );
  });
});
