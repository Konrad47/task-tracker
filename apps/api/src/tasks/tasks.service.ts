import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  CreateTaskInput,
  Task as TaskDto,
  TaskStatus,
  UpdateTaskInput,
} from '@task-tracker/shared';
import { Model, Types } from 'mongoose';
import { PinoLogger } from 'nestjs-pino';
import { Task, TaskDocument } from './task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(TasksService.name);
  }

  async list(userId: string, status?: TaskStatus): Promise<TaskDto[]> {
    const filter: { userId: string; status?: TaskStatus } = { userId };
    if (status) {
      filter.status = status;
    }
    const tasks = await this.taskModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .exec();
    return tasks.map((task) => this.toDto(task));
  }

  async getById(userId: string, id: string): Promise<TaskDto> {
    this.assertId(userId, id);
    const task = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!task) {
      this.logNotFound(userId, id);
      throw new NotFoundException('Task not found');
    }
    return this.toDto(task);
  }

  async create(userId: string, input: CreateTaskInput): Promise<TaskDto> {
    const created = await this.taskModel.create({
      title: input.title,
      description: this.normalizeDescription(input.description),
      status: input.status ?? 'todo',
      userId,
    });
    const dto = this.toDto(created);
    this.logger.info({ userId, taskId: dto.id }, 'Task created');
    return dto;
  }

  async update(
    userId: string,
    id: string,
    input: UpdateTaskInput,
  ): Promise<TaskDto> {
    this.assertId(userId, id);
    const update: Record<string, unknown> = {};
    if (input.title !== undefined) {
      update.title = input.title;
    }
    if (input.description !== undefined) {
      update.description = this.normalizeDescription(input.description);
    }
    if (input.status !== undefined) {
      update.status = input.status;
    }

    const task = await this.taskModel
      .findOneAndUpdate({ _id: id, userId }, update, { new: true })
      .exec();
    if (!task) {
      this.logNotFound(userId, id);
      throw new NotFoundException('Task not found');
    }
    const dto = this.toDto(task);
    this.logger.info({ userId, taskId: dto.id }, 'Task updated');
    return dto;
  }

  async remove(userId: string, id: string): Promise<void> {
    this.assertId(userId, id);
    const result = await this.taskModel
      .findOneAndDelete({ _id: id, userId })
      .exec();
    if (!result) {
      this.logNotFound(userId, id);
      throw new NotFoundException('Task not found');
    }
    this.logger.info({ userId, taskId: id }, 'Task deleted');
  }

  private assertId(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      this.logNotFound(userId, id);
      throw new NotFoundException('Task not found');
    }
  }

  private logNotFound(userId: string, taskId: string) {
    this.logger.warn({ userId, taskId }, 'Task not found');
  }

  private normalizeDescription(value?: string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  private toDto(task: TaskDocument): TaskDto {
    return {
      id: String(task._id),
      title: task.title,
      description: task.description ?? null,
      status: task.status,
      userId: task.userId,
      createdAt: (task.get('createdAt') as Date).toISOString(),
      updatedAt: (task.get('updatedAt') as Date).toISOString(),
    };
  }
}
