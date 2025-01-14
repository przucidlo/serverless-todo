import { APIGatewayEvent, APIGatewayProxyResultV2, Handler } from "aws-lambda";
import { table } from "../../../db/table";
import { QueryCommand } from "dynamodb-toolbox";
import {
  gatewayRequestContext,
  GatewayUser,
} from "../../../contexts/gateway-request.context";
import { memberEntity } from "../../../db/member.entity";
import { ProjectUserDTO } from "../../../dto/member.dto";
import { ProjectUser } from "../../../domain/project-user";

async function getUserProjects(user: GatewayUser) {
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
    ({ user }) => {
      return getUserProjects(user);
    },
    {
      context,
      event,
      target: ProjectUserDTO,
    }
  );
};
