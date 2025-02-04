import { Context, SQSEvent } from 'aws-lambda';
import { withRequest } from '../../layers/logger.layer';
import { queueRequestContext } from './request.context';
import { ClassConstructor } from 'class-transformer';

export interface SqsHandlerContext<TBody extends object> {
  body: TBody;
}

export async function sqsRequestContext<TBody extends object>(
  handler: (event: SqsHandlerContext<TBody>) => Promise<void>,
  options: {
    target?: ClassConstructor<TBody>;
    event: SQSEvent;
    context: Context;
  },
): Promise<void> {
  withRequest(options.event, options.context);

  for (const record of options.event.Records) {
    await queueRequestContext<TBody>(
      {
        body: record.body,
        bodyClass: options?.target,
      },
      (body) => handler({ body }),
    );
  }
}
