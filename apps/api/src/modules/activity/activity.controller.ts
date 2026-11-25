import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DevAuthGuard } from '../auth/dev-auth.guard';
import { ActivityService } from './activity.service';
import type { TaskActivity } from '@task-tracker/shared';
import type { CurrentUser } from '../auth/current-user';
import { CurrentUserParam } from '../auth/current-user.decorator';

@Controller('tasks')
@UseGuards(DevAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get(':id/activity')
  listForTask(
    @CurrentUserParam() user: CurrentUser,
    @Param('id') id: string,
  ): Promise<TaskActivity[]> {
    return this.activityService.listForTask(user.id, id);
  }
}
