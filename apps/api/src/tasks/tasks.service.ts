import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type {
  CreateTaskInput,
  Task as TaskDto,
  TaskStatus,
  UpdateTaskInput,
} from '@task-tracker/shared';
import { Task, TaskDocument } from './task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {}

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
    this.assertId(id);
    const task = await this.taskModel.findOne({ _id: id, userId }).exec();
    if (!task) {
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
    return this.toDto(created);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateTaskInput,
  ): Promise<TaskDto> {
    this.assertId(id);
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
      throw new NotFoundException('Task not found');
    }
    return this.toDto(task);
  }

  async remove(userId: string, id: string): Promise<void> {
    this.assertId(id);
    const result = await this.taskModel
      .findOneAndDelete({ _id: id, userId })
      .exec();
    if (!result) {
      throw new NotFoundException('Task not found');
    }
  }

  private assertId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Task not found');
    }
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
