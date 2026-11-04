import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'AttachmentsBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const dbUri = new ssm.StringParameter(this, 'DbUriParameter', {
      parameterName: '/task-tracker/dev/mongodb-uri',
      stringValue: 'placeholder',
    });
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });
    new cdk.CfnOutput(this, 'BucketArn', {
      value: bucket.bucketArn,
    });
    new cdk.CfnOutput(this, 'ParameterName', {
      value: dbUri.parameterName,
    });

    const dlq = new sqs.Queue(this, 'TaskEventsDLQ', {
      queueName: 'task-queue-dlq',
      retentionPeriod: cdk.Duration.days(14),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const queue = new sqs.Queue(this, 'TaskEventsQueue', {
      queueName: 'task-events',
      visibilityTimeout: cdk.Duration.seconds(30),
      receiveMessageWaitTime: cdk.Duration.seconds(20),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 3,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const topic = new sns.Topic(this, 'TaskEventsTopic', {
      topicName: 'task-events',
    });
    topic.addSubscription(
      new subscriptions.SqsSubscription(queue, {
        rawMessageDelivery: true,
      }),
    );
    new cdk.CfnOutput(this, 'TaskEventsTopicArn', {
      value: topic.topicArn,
    });
    new cdk.CfnOutput(this, 'TaskEventsQueueUrl', {
      value: queue.queueUrl,
    });
  }
}
