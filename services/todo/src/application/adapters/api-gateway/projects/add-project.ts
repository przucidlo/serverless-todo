import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { logger } from '../../../../layers/logger.layer';
import { gatewayRequestContext } from '../../../contexts/gateway-request.context';
import { ProjectDTO } from '../../../dto/project-dto';
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
    async ({ body, identity }) => {
      const [project, member] = await service.addProject(
        body.toEntity(uuid(), identity.username),
        identity,
      );

      logger.info(
        { project: project.toDTO(), member: member.toDTO() },
        'Created project',
      );

      return project;
    },
    { target: ProjectDTO, event, context },
  );
};

export const addProjectHandler = handler;
