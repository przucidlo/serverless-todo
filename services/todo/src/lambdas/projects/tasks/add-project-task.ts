import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from "aws-lambda";
import { PutItemCommand } from "dynamodb-toolbox";
import { taskEntity } from "../../../db/task.entity";
import { TaskDTO } from "../../../dto/task-dto";
import { HttpNotFoundError } from "../../../errors/http.error";
import { Task } from "../../../domain/task";
import { v4 as uuid } from "uuid";
import { TaskStatus } from "../../../domain/task-status";
import { logger } from "../../../layers/logger.layer";
import { gatewayRequestContext } from "../../../contexts/gateway-request.context";

async function addUserTask(task: Task) {
  const dto = task.toDTO();
  dto.id = uuid();

  const { ToolboxItem } = await taskEntity
    .build(PutItemCommand)
    .item({
      ...dto,
      pk: dto.projectId,
      sk: dto.id,
      status: dto.status.toString(),
    })
    .send();

  logger.info({ projectId: dto.projectId, taskId: dto.id }, "Created task");

  return new Task(
    ToolboxItem.sk,
    ToolboxItem.pk,
    ToolboxItem.title,
    ToolboxItem.description,
    ToolboxItem.owner,
    TaskStatus[ToolboxItem.status as keyof typeof TaskStatus]
  );
}

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ body, user }) => {
      if (event.pathParameters && event.pathParameters["projectId"]) {
        return addUserTask(
          body.toEntity(
            undefined,
            event.pathParameters["projectId"],
            user.username
          )
        );
      }

      throw new HttpNotFoundError("Project not found");
    },
    { target: TaskDTO, event, context }
  );
};
