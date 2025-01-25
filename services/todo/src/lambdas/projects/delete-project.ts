import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { gatewayRequestContext } from '../../contexts/gateway-request.context';
import { HttpNotFoundError } from '../../errors/http.error';
import { logger } from '../../layers/logger.layer';
import { projectService } from '../../domain/services/project/project.service';
import { dynamodbProjectRepository } from '../../infrastructure/dynamodb/project/project.repository';

const service = projectService(dynamodbProjectRepository());

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
