import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from "aws-lambda";
import { table } from "../../../infrastructure/dynamodb/entities/table";
import { QueryCommand } from "dynamodb-toolbox";
import {
  gatewayRequestContext,
  GatewayIdentity,
} from "../../../contexts/gateway-request.context";
import { memberEntity } from "../../../infrastructure/dynamodb/entities/member.entity";
import { ProjectUserDTO } from "../../../dto/member.dto";
import { ProjectUser } from "../../../domain/project-user";

async function getUserProjects(user: GatewayIdentity) {
  const query = await table
    .build(QueryCommand)
    .query({
      partition: `USER#${user.username}`,
      range: {
        beginsWith: "PROJECT#",
      },
      index: "GSI1",
    })
    .entities(memberEntity)
    .options({})
    .send();

  if (!query.Items) {
    return [];
  }

  return query.Items.map(
    (i) => new ProjectUser(i.pk, i.projectName, i.created)
  );
}

export const handler: Handler<
  APIGatewayEvent,
  APIGatewayProxyResultV2
> = async (event, context) => {
  return gatewayRequestContext(
    ({ identity: user }) => {
      return getUserProjects(user);
    },
    {
      context,
      event,
      target: ProjectUserDTO,
    }
  );
};
