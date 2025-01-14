import { Handler, APIGatewayEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { taskEntity } from "../../../db/task.entity";
import { QueryCommand } from "dynamodb-toolbox";
import { table } from "../../../db/table";
import { HttpNotFoundError } from "../../../errors/http.error";
import { TaskDTO } from "../../../dto/task-dto";
import { Task } from "../../../domain/task";
import { TaskStatus } from "../../../domain/task-status";
import { gatewayRequestContext } from "../../../contexts/gateway-request.context";

export async function getProjectTasks(projectId: string) {
  const query = await table
    .build(QueryCommand)
    .query({ partition: `PROJECT#${projectId}`, range: { beginsWith: "TASK" } })
    .entities(taskEntity)
    .send();

  if (!query.Items) {
    return [];
  }

  return query.Items.map(
    (i) =>
      new Task(
        i.sk,
        i.pk,
        i.title,
        i.description,
        i.owner,
        TaskStatus[i.status as keyof typeof TaskStatus]
      )
  );
}

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
