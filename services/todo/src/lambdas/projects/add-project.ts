import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from "aws-lambda";
import { PutItemCommand } from "dynamodb-toolbox";
import { v4 as uuid } from "uuid";
import { logger } from "../../layers/logger.layer";
import { gatewayRequestContext } from "../../contexts/gateway-request.context";
import { Project } from "../../domain/project";
import { projectEntity } from "../../db/project.entity";
import { ProjectDTO } from "../../dto/project-dto";
import { memberEntity } from "../../db/member.entity";

async function addProject(project: Project) {
  const dto = project.toDTO();

  const { ToolboxItem } = await projectEntity
    .build(PutItemCommand)
    .item({
      pk: dto.id,
      sk: dto.id,
      name: dto.name,
      owner: dto.owner,
    })
    .send();

  logger.info({ ownerId: dto.owner, projectId: dto.id }, "Created project");

  await memberEntity
    .build(PutItemCommand)
    .item({
      pk: dto.id,
      sk: dto.owner,
      GSI1PK: dto.owner,
      GSI1SK: dto.id,
      projectName: dto.name,
    })
    .send();

  logger.info(
    { memberId: dto.owner, projectId: dto.id },
    "Assigned user to project"
  );

  return new Project(ToolboxItem.pk, ToolboxItem.name, ToolboxItem.owner);
}

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    async ({ body, user }) => {
      return addProject(body.toEntity(uuid(), user.username));
    },
    { target: ProjectDTO, event, context }
  );
};
