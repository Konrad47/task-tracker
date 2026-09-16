import { BadRequestException } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  const user = { id: 'user-1' };

  function createController() {
    const tasksService = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const controller = new TasksController(
      tasksService as unknown as TasksService,
    );
    return { controller, tasksService };
  }

  it('lists without a status filter when status is omitted', async () => {
    const { controller, tasksService } = createController();
    tasksService.list.mockResolvedValue([]);

    await controller.list(user);

    expect(tasksService.list).toHaveBeenCalledWith(user.id);
  });

  it('forwards a valid status filter', async () => {
    const { controller, tasksService } = createController();
    tasksService.list.mockResolvedValue([]);

    await controller.list(user, 'in_progress');

    expect(tasksService.list).toHaveBeenCalledWith(user.id, 'in_progress');
  });

  it('rejects an invalid status with validation issues', () => {
    const { controller, tasksService } = createController();

    expect(() => {
      void controller.list(user, 'nope');
    }).toThrow(BadRequestException);

    try {
      void controller.list(user, 'nope');
    } catch (error) {
      const response = (error as BadRequestException).getResponse() as {
        message: string;
        issues: unknown;
      };
      expect(response.message).toBe('Validation failed');
      expect(response.issues).toBeDefined();
    }

    expect(tasksService.list).not.toHaveBeenCalled();
  });

  it('passes user id and body through on create', async () => {
    const { controller, tasksService } = createController();
    const body = { title: 'New' };
    tasksService.create.mockResolvedValue({ id: '1' });

    await controller.create(user, body);

    expect(tasksService.create).toHaveBeenCalledWith(user.id, body);
  });

  it('passes user id, task id, and body through on update', async () => {
    const { controller, tasksService } = createController();
    const body = { title: 'Updated' };
    tasksService.update.mockResolvedValue({ id: 'abc' });

    await controller.update(user, 'abc', body);

    expect(tasksService.update).toHaveBeenCalledWith(user.id, 'abc', body);
  });

  it('passes user id and task id through on get and delete', async () => {
    const { controller, tasksService } = createController();
    tasksService.getById.mockResolvedValue({ id: 'abc' });
    tasksService.remove.mockResolvedValue(undefined);

    await controller.getById(user, 'abc');
    await controller.remove(user, 'abc');

    expect(tasksService.getById).toHaveBeenCalledWith(user.id, 'abc');
    expect(tasksService.remove).toHaveBeenCalledWith(user.id, 'abc');
  });
});
