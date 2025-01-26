import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { gatewayRequestContext } from '../../../../contexts/gateway-request.context';
import { ProjectUserDTO } from '../../../../dto/member.dto';
import { projectService } from '../../../../services/project/project.service';
import { dynamodbProjectRepository } from '../../../../../infrastructure/dynamodb/project/project.repository';

const service = projectService(dynamodbProjectRepository());

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
