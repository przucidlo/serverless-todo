import { PostConfirmationTriggerEvent } from "aws-lambda";
import { Handler } from "aws-lambda/handler";
import { User } from "../../domain/user";
import { userEntity } from "../../db/user.entity";
import { logger } from "../../layers/logger.layer";
import { PutItemCommand } from "dynamodb-toolbox";

async function addUser(username: string, email: string, fullname: string) {
  const { ToolboxItem } = await userEntity
    .build(PutItemCommand)
    .item({
      pk: username,
      sk: username,
      email: email,
      fullname: fullname,
      username: username,
    })
    .send();

  logger.info({ username }, "Created user");

  return new User(
    ToolboxItem.username,
    ToolboxItem.fullname,
    ToolboxItem.email
  );
}

export const handler: Handler<
  PostConfirmationTriggerEvent,
  PostConfirmationTriggerEvent
> = async (event) => {
  const { email, name } = event.request.userAttributes;

  await addUser(event.userName, email, name);

  return event;
};
