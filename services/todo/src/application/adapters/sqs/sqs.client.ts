import { SQSClient } from '@aws-sdk/client-sqs';

export const sqsClient = new SQSClient();
export const sqsQueues = JSON.parse(process.env.SQS_QUEUES ?? '{}');
