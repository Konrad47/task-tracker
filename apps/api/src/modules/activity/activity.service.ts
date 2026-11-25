import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TaskActivity, TaskStatus } from '@task-tracker/shared';

type ActivityItem = {
  eventId: string;
  taskId: string;
  from: TaskStatus;
  to: TaskStatus;
  occurredAt: string;
};

@Injectable()
export class ActivityService {
  private readonly client: DynamoDBDocumentClient;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('AWS_ENDPOINT_URL');
    this.client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: this.config.get<string>('AWS_REGION'),
        endpoint: endpoint || undefined,
      }),
    );
  }

  async listForTask(userId: string, taskId: string): Promise<TaskActivity[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.config.getOrThrow<string>('TASK_ACTIVITY_TABLE'),
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'taskId = :taskId',
        ScanIndexForward: false,
        ExpressionAttributeValues: {
          ':userId': userId,
          ':taskId': taskId,
        },
      }),
    );
    const items = (result.Items ?? []) as ActivityItem[];
    return items.map((item) => ({
      eventId: item.eventId,
      taskId: item.taskId,
      from: item.from,
      to: item.to,
      at: item.occurredAt,
    }));
  }
}
