import { ActivityController } from './activity.controller';
import { type ActivityService } from './activity.service';

describe('ActivityController', () => {
  it('forwards the user id and task id', async () => {
    const activityService = {
      listForTask: jest.fn().mockResolvedValue([]),
    };
    const controller = new ActivityController(activityService as unknown as ActivityService);

    await controller.listForTask({ id: 'user-1' }, 'task-1');

    expect(activityService.listForTask).toHaveBeenCalledWith('user-1', 'task-1');
  });
});
