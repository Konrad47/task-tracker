import { ScanCommand as DynamoScanCommand } from '@aws-sdk/client-dynamodb';
import { QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { ConfigService } from '@nestjs/config';
import { ActivityService } from './activity.service';

const send = jest.fn<Promise<unknown>, [unknown]>();

jest.mock('@aws-sdk/lib-dynamodb', () => {
  const actual: unknown = jest.requireActual('@aws-sdk/lib-dynamodb');
  if (typeof actual !== 'object' || actual === null) {
    throw new Error('Expected @aws-sdk/lib-dynamodb module');
  }
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: () => ({ send }),
    },
  };
});

function createService() {
  const config = {
    get: (key: string) => {
      if (key === 'AWS_REGION') {
        return 'eu-central-1';
      }
      if (key === 'AWS_ENDPOINT_URL') {
        return undefined;
      }
      return undefined;
    },
    getOrThrow: (key: string) => {
      if (key === 'TASK_ACTIVITY_TABLE') {
        return 'task-activity';
      }
      throw new Error(key);
    },
  } as unknown as ConfigService;
  return new ActivityService(config);
}

describe('ActivityService', () => {
  beforeEach(() => {
    send.mockReset();
  });

  it('queries by userId with a taskId filter and maps occurredAt to at', async () => {
    send.mockResolvedValue({
      Items: [
        {
          eventId: 'event-1',
          taskId: 'task-1',
          from: 'todo',
          to: 'in_progress',
          occurredAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    });

    const result = await createService().listForTask('user-1', 'task-1');

    expect(send).toHaveBeenCalledTimes(1);
    const command: unknown = send.mock.calls[0][0];
    expect(command).toBeInstanceOf(QueryCommand);
    expect(command).not.toBeInstanceOf(ScanCommand);
    expect(command).not.toBeInstanceOf(DynamoScanCommand);
    const input = (command as QueryCommand).input;
    expect(input.KeyConditionExpression).toContain('userId');
    expect(input.FilterExpression).toBe('taskId = :taskId');
    expect(input.ExpressionAttributeValues).toEqual({
      ':userId': 'user-1',
      ':taskId': 'task-1',
    });
    expect(result).toEqual([
      {
        eventId: 'event-1',
        taskId: 'task-1',
        from: 'todo',
        to: 'in_progress',
        at: '2026-01-02T00:00:00.000Z',
      },
    ]);
  });
});
