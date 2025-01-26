import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { Handler } from 'aws-lambda/handler';
import { userService } from '../../../services/user/user.service';
import { dynamodbUserRepository } from '../../../../infrastructure/dynamodb/user/user.repository';
import { User } from '../../../../domain/user';
import { logger } from '../../../../layers/logger.layer';

const service = userService(dynamodbUserRepository());

export const handler: Handler<
  PostConfirmationTriggerEvent,
  PostConfirmationTriggerEvent
> = async (event) => {
  const { email, name } = event.request.userAttributes;

  const user = await service.createUser(new User(event.userName, email, name));

  logger.info(user.toDTO(), 'Created user');

  return event;
};
