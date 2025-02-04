import { Handler, APIGatewayEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { HttpNotFoundError } from '../../../../contexts/errors/http.error';
import { TaskDTO } from '../../../../dto/task-dto';
import { gatewayRequestContext } from '../../../../contexts/gateway-request.context';
import { projectService } from '../../../../services/project/project.service';
import { dynamodbProjectRepository } from '../../../../../infrastructure/dynamodb/project/project.repository';
import { sqsPublisher } from '../../../sqs/publisher/sqs.publisher';
import { sqsClient } from '../../../sqs/sqs.client';

const service = projectService(
  dynamodbProjectRepository(),
  sqsPublisher(sqsClient),
);

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ identity }) => {
      if (event.pathParameters && event.pathParameters['projectId']) {
        return service.getTasks(identity, {
          projectId: event.pathParameters['projectId'],
        });
      }

      throw new HttpNotFoundError('Project not found');
    },
    { event, context, target: TaskDTO },
  );
};
