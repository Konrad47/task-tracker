import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TASK_STATUSES, type TaskStatus } from '@task-tracker/shared';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, default: null })
  description: string | null;

  @Prop({ type: String, enum: TASK_STATUSES, default: 'todo' })
  status: TaskStatus;

  @Prop({ required: true, index: true })
  userId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ userId: 1, status: 1 });
