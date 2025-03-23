import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { gatewayRequestContext } from '../../../../contexts/gateway-request.context';
import { ProjectUserDTO } from '../../../../dto/member.dto';
import { projectService } from '../../../../services/project/project.service';
import { dynamodbProjectRepository } from '../../../../../infrastructure/dynamodb/project/project.repository';
import { sqsPublisher } from '../../../sqs/publisher/sqs.publisher';
import { sqsClient, sqsQueues } from '../../../sqs/sqs.client';

const service = projectService(dynamodbProjectRepository(), sqsPublisher(sqsClient, sqsQueues));

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    ({ identity }) => {
      return service.getProjects(identity);
    },
    {
      context,
      event,
      target: ProjectUserDTO,
    },
  );
};

export const getUserProjectsHandler = handler;