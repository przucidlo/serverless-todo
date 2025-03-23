import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { gatewayRequestContext } from '../../../contexts/gateway-request.context';
import { HttpNotFoundError } from '../../../contexts/errors/http.error';
import { logger } from '../../../../layers/logger.layer';
import { projectService } from '../../../services/project/project.service';
import { dynamodbProjectRepository } from '../../../../infrastructure/dynamodb/project/project.repository';
import { sqsPublisher } from '../../sqs/publisher/sqs.publisher';
import { sqsClient, sqsQueues } from '../../sqs/sqs.client';

const service = projectService(
  dynamodbProjectRepository(),
  sqsPublisher(sqsClient, sqsQueues),
);

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ identity }) => {
      if (!event.pathParameters || !event.pathParameters['projectId']) {
        throw new HttpNotFoundError('Project not found');
      }

      await service.deleteProject(identity, {
        id: event.pathParameters['projectId'],
      });

      logger.info(
        { projectId: event.pathParameters['projectId'] },
        'Deleted project',
      );
    },
    { event, context },
  );
};

export const deleteProjectHandler = handler;