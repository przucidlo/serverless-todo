import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { gatewayRequestContext } from '../../../contexts/gateway-request.context';
import { ProjectDTO } from '../../../dto/project-dto';
import { HttpNotFoundError } from '../../../contexts/errors/http.error';
import { projectService } from '../../../services/project/project.service';
import { dynamodbProjectRepository } from '../../../../infrastructure/dynamodb/project/project.repository';
import { logger } from '../../../../layers/logger.layer';

const service = projectService(dynamodbProjectRepository());

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ body, identity }) => {
      if (!event.pathParameters || !event.pathParameters['projectId']) {
        throw new HttpNotFoundError('Project not found');
      }

      const project = await service.updateProject(identity, {
        ...body,
        id: event.pathParameters['projectId'],
      });

      logger.info(project.toDTO(), 'Updated project');

      return project;
    },
    { target: ProjectDTO, event, context },
  );
};
