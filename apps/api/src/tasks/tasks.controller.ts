import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  createTaskSchema,
  type CreateTaskInput,
  taskStatusSchema,
  type UpdateTaskInput,
  updateTaskSchema,
} from '@task-tracker/shared';
import { CurrentUserParam } from '../auth/current-user.decorator';
import type { CurrentUser } from '../auth/current-user';
import { DevAuthGuard } from '../auth/dev-auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(DevAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  list(
    @CurrentUserParam() user: CurrentUser,
    @Query('status') status?: string,
  ) {
    if (!status) {
      return this.tasksService.list(user.id);
    }
    const parsed = taskStatusSchema.safeParse(status);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        issues: parsed.error.flatten(),
      });
    }
    return this.tasksService.list(user.id, parsed.data);
  }

  @Get(':id')
  getById(@CurrentUserParam() user: CurrentUser, @Param('id') id: string) {
    return this.tasksService.getById(user.id, id);
  }

  @Post()
  create(
    @CurrentUserParam() user: CurrentUser,
    @Body(new ZodValidationPipe(createTaskSchema)) body: CreateTaskInput,
  ) {
    return this.tasksService.create(user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUserParam() user: CurrentUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) body: UpdateTaskInput,
  ) {
    return this.tasksService.update(user.id, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUserParam() user: CurrentUser, @Param('id') id: string) {
    return this.tasksService.remove(user.id, id);
  }
}
