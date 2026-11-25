const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT_URL,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
    },
  }),
);

exports.handler = async (event) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    const message = body.Message ? JSON.parse(body.Message) : body;

    try {
      await client.send(
        new PutCommand({
          TableName: process.env.TABLE_NAME || 'TaskActivity',
          Item: {
            userId: message.userId,
            occurredAt: message.at,
            taskId: message.taskId,
            from: message.from,
            to: message.to,
            eventId: message.eventId,
          },
          ConditionExpression: 'attribute_not_exists(userId) AND attribute_not_exists(occurredAt)',
        }),
      );
    } catch (error) {
      if (error.name !== 'ConditionalCheckFailedException') {
        throw error;
      }
    }
  }
};
