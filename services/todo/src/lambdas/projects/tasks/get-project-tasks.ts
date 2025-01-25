import { Handler, APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { taskEntity } from "../../../infrastructure/dynamodb/entities/task.entity";
import { QueryCommand } from "dynamodb-toolbox";
import { table } from "../../../infrastructure/dynamodb/entities/table";
import { HttpNotFoundError } from "../../../errors/http.error";
import { TaskDTO } from "../../../dto/task-dto";
import { Task } from "../../../domain/task";
import { TaskStatus } from "../../../domain/task-status";
import { gatewayRequestContext } from "../../../contexts/gateway-request.context";

export async function getProjectTasks(projectId: string) {}

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async () => {
      if (event.pathParameters && event.pathParameters["projectId"]) {
        return getProjectTasks(event.pathParameters["projectId"]);
      }

      throw new HttpNotFoundError("Project not found");
    },
    { event, context, target: TaskDTO }
  );
};
