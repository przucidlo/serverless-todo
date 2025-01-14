import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from "aws-lambda";
import {
  BatchPutRequest,
  BatchWriteCommand,
  executeBatchWrite,
  QueryCommand,
  UpdateItemCommand,
} from "dynamodb-toolbox";
import { logger } from "../../layers/logger.layer";
import { gatewayRequestContext } from "../../contexts/gateway-request.context";
import { Project } from "../../domain/project";
import { ProjectDTO } from "../../dto/project-dto";
import { memberEntity } from "../../db/member.entity";
import { HttpNotFoundError } from "../../errors/http.error";
import { projectEntity } from "../../db/project.entity";
import { table } from "../../db/table";

async function updateProject(project: Project) {
  const dto = project.toDTO();

  if (!dto.id) {
    throw new HttpNotFoundError("Project not found");
  }

  const { Attributes } = await projectEntity
    .build(UpdateItemCommand)
    .item({
      pk: `${dto.id}`,
      sk: `${dto.id}`,
      name: dto.name,
    })
    .options({
      returnValues: "ALL_OLD",
    })
    .send();

  logger.info({ projectId: dto.id }, "Updated project");

  if (typeof Attributes?.name === "string" && dto.name !== Attributes.name) {
    logger.info(
      { previous: Attributes.name, next: dto.name },
      "Project name changed"
    );

    const members = await table
      .build(QueryCommand)
      .query({
        partition: `PROJECT#${dto.id}`,
        range: {
          beginsWith: `USER#`,
        },
      })
      .entities(memberEntity)
      .send();

    if (members.Items) {
      const batchWrite = table.build(BatchWriteCommand).requests(
        ...members.Items.map((member) =>
          memberEntity.build(BatchPutRequest).item({
            ...member,
            projectName: dto.name,
          })
        )
      );

      await executeBatchWrite(batchWrite);

      logger.info({ projectId: dto.id }, "Updated project members");
    }
  }

  return new Project(dto.id, dto.name, dto.owner);
}

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ body, user }) => {
      if (!event.pathParameters || !event.pathParameters["projectId"]) {
        throw new HttpNotFoundError("Project not found");
      }

      return updateProject(
        body.toEntity(event.pathParameters["projectId"], user.username)
      );
    },
    { target: ProjectDTO, event, context }
  );
};
