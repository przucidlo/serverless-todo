import { Context, SQSEvent, SQSHandler } from 'aws-lambda';
import { logger } from '../../../../layers/logger.layer';
import { ProjectDTO } from '../../../dto/project-dto';
import { projectService } from '../../../services/project/project.service';
import { dynamodbProjectRepository } from '../../../../infrastructure/dynamodb/project/project.repository';
import { sqsPublisher } from '../publisher/sqs.publisher';
import { sqsClient, sqsQueues } from '../sqs.client';
import { sqsRequestContext } from '../../../contexts/sqs-request.context';

const service = projectService(
  dynamodbProjectRepository(),
  sqsPublisher(sqsClient, sqsQueues),
);

export const handler: SQSHandler = async (
  event: SQSEvent,
  context: Context,
): Promise<void> => {
  await sqsRequestContext<ProjectDTO>(
    async ({ body }) => {
      if (!body.id) {
        throw new Error('Project ID is required');
      }

      await service.updateMembers(body.toEntity(body.id ?? '', body.owner));

      logger.info({ body }, 'Updated project members');
    },
    {
      context,
      event,
      target: ProjectDTO,
    },
  );
};
