import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { TaskDTO, ValidationGroup } from '../../../../dto/task-dto';
import { HttpNotFoundError } from '../../../../contexts/errors/http.error';
import { gatewayRequestContext } from '../../../../contexts/gateway-request.context';
import { projectService } from '../../../../services/project/project.service';
import { dynamodbProjectRepository } from '../../../../../infrastructure/dynamodb/project/project.repository';
import { logger } from '../../../../../layers/logger.layer';
import { sqsPublisher } from '../../../sqs/publisher/sqs.publisher';
import { sqsClient, sqsQueues } from '../../../sqs/sqs.client';

const service = projectService(
  dynamodbProjectRepository(),
  sqsPublisher(sqsClient, sqsQueues),
);

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ body, identity }) => {
      if (
        event.pathParameters &&
        event.pathParameters['projectId'] &&
        event.pathParameters['taskId']
      ) {
        const task = await service.updateTask(identity, {
          ...body,
          id: event.pathParameters['taskId'],
          projectId: event.pathParameters['projectId'],
        });

        logger.info(
          { projectId: task.toDTO().projectId, taskId: task.toDTO().id, ...event, ...context},
          'Updated task',
        );

        return task;
      }

      throw new HttpNotFoundError('Task not found');
    },
    {
      target: TaskDTO,
      event,
      context,
      validatorOptions: { groups: [ValidationGroup.PATCH] },
    },
  );
};

export const updateProjectTaskHandler = handler;
