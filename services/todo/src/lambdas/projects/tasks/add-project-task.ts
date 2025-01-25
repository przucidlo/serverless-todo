import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from "aws-lambda";
import { TaskDTO } from "../../../dto/task-dto";
import { HttpNotFoundError } from "../../../errors/http.error";
import { Task } from "../../../domain/task";
import { gatewayRequestContext } from "../../../contexts/gateway-request.context";
import { projectService } from "../../../domain/services/project/project.service";
import { dynamodbProjectRepository } from "../../../infrastructure/dynamodb/project/project.repository";

const service = projectService(dynamodbProjectRepository());

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ body, identity: user }) => {
      if (event.pathParameters && event.pathParameters["projectId"]) {
        const task = await service.(
          body.toEntity(
            undefined,
            event.pathParameters["projectId"],
            user.username
          )
        );

        logger.info(
          { projectId: dto.projectId, taskId: dto.id },
          "Created task"
        );
      }

      throw new HttpNotFoundError("Project not found");
    },
    { target: TaskDTO, event, context }
  );
};
