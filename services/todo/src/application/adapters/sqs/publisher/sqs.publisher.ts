import { logger } from '../../../../layers/logger.layer';
import { EventPublisher } from '../../../interfaces/event-publisher.interface';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

type QueuesRecord = Record<string, { url: string }>;

export function sqsPublisher(
  client: SQSClient,
  queues: QueuesRecord,
): EventPublisher {
  async function publish(event: string, payload: unknown) {
    if (!queues?.[event]) {
      throw new Error(`Queue ${event} not found`);
    }

    await client.send(
      new SendMessageCommand({
        MessageBody: JSON.stringify(payload),
        QueueUrl: event,
      }),
    );

    logger.info({ event, payload }, 'Published event');
  }

  return {
    publish,
  };
}
