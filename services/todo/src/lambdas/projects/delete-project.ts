import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from "aws-lambda";
import { DeletePartitionCommand, GetItemCommand } from "dynamodb-toolbox";
import {
  gatewayRequestContext,
  GatewayUser,
} from "../../contexts/gateway-request.context";
import { Project } from "../../domain/project";
import { ProjectDTO } from "../../dto/project-dto";
import { HttpNotFoundError } from "../../errors/http.error";
import { table } from "../../db/table";
import { logger } from "../../layers/logger.layer";
import { projectEntity } from "../../db/project.entity";

async function deleteProject(projectId: string, user: GatewayUser) {
  const project = await projectEntity
    .build(GetItemCommand)
    .key({ pk: `PROJECT#${projectId}`, sk: `PROJECT#${projectId}` })
    .send();

  const dto = project.toDTO();

  await table
    .build(DeletePartitionCommand)
    .query({ partition: `PROJECT#${dto.id}` })
    .send();

  logger.info({ projectId: dto.id }, "Deleted project");
}

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ user }) => {
      if (!event.pathParameters || !event.pathParameters["projectId"]) {
        throw new HttpNotFoundError("Project not found");
      }

      return deleteProject(event.pathParameters["projectId"], user);
    },
    { target: ProjectDTO, event, context }
  );
};
