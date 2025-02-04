import { logger } from '../../../../layers/logger.layer';
import { EventPublisher } from '../../../interfaces/event-publisher.interface';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

type QueuesRecord = Record<string, { url: string }>;

export function sqsPublisher(client: SQSClient): EventPublisher {
  const queues: QueuesRecord = JSON.parse(process.env.SQS_QUEUES ?? '{}');

  async function publish(event: string, payload: unknown) {
    if (!queues?.[event]) {
      throw new Error(`Queue ${event} not found`);
    }

    logger.info({ event, payload, queues: queues[event] }, 'Publishing event');

    await client.send(
      new SendMessageCommand({
        MessageBody: JSON.stringify(payload),
        QueueUrl: event,
      }),
    );
  }

  return {
    publish,
  };
}
