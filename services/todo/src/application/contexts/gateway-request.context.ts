import { APIGatewayEvent, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { ClassConstructor } from 'class-transformer';
import { withRequest } from '../../layers/logger.layer';
import { httpRequestContext } from './request.context';
import { HttpUnauthorizedError } from './errors/http.error';
import { Identity } from '../../domain/identity';

export type GatewayIdentity = Identity;

export interface GatewayHandlerContext<TBody extends object> {
  body: TBody;
  identity: GatewayIdentity;
}

export async function gatewayRequestContext<TBody extends object>(
  handler: (context: GatewayHandlerContext<TBody>) => Promise<unknown>,
  options: {
    target?: ClassConstructor<TBody>;
    event: APIGatewayEvent;
    context: Context;
  },
): Promise<APIGatewayProxyResultV2> {
  withRequest(options.event, options.context);

  const { body, statusCode } = await httpRequestContext<TBody>(
    {
      body: options.event.body,
      method: options.event.httpMethod,
      bodyClass: options?.target,
    },
    (body) => {
      const authorizer = options.event.requestContext.authorizer;

      if (!authorizer) {
        throw new HttpUnauthorizedError();
      }

      return handler({
        body,
        identity: {
          username: authorizer.claims.username,
        },
      });
    },
  );

  return {
    body,
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  };
}
