import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { TaskStatus } from '@task-tracker/shared';

export type TaskStatusChangedEvent = {
  eventId: string;
  userId: string;
  taskId: string;
  from: TaskStatus;
  to: TaskStatus;
  at: string;
};

@Injectable()
export class TaskEventsPublisher {
  private readonly client: SNSClient;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('AWS_ENDPOINT_URL');
    this.client = new SNSClient({
      region: this.config.get<string>('AWS_REGION'),
      endpoint: endpoint || undefined,
    });
  }

  async publishStatusChange(event: TaskStatusChangedEvent): Promise<void> {
    await this.client.send(
      new PublishCommand({
        TargetArn: this.config.get<string>('TAKS_EVENTS_TOPIC_ARN'),
        Message: JSON.stringify(event),
      }),
    );
  }
}
