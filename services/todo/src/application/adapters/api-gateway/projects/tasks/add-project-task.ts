import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { TaskDTO } from '../../../../dto/task-dto';
import { HttpNotFoundError } from '../../../../contexts/errors/http.error';
import { v4 as uuid } from 'uuid';
import { gatewayRequestContext } from '../../../../contexts/gateway-request.context';
import { projectService } from '../../../../services/project/project.service';
import { dynamodbProjectRepository } from '../../../../../infrastructure/dynamodb/project/project.repository';
import { logger } from '../../../../../layers/logger.layer';

const service = projectService(dynamodbProjectRepository());

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ body, identity }) => {
      if (event.pathParameters && event.pathParameters['projectId']) {
        const task = await service.addTask(
          identity,
          body.toEntity(
            uuid(),
            event.pathParameters['projectId'],
            identity.username,
          ),
        );

        logger.info(
          { projectId: task.toDTO().projectId, taskId: task.toDTO().id },
          'Created task',
        );

        return task;
      }

      throw new HttpNotFoundError('Project not found');
    },
    { target: TaskDTO, event, context },
  );
};
