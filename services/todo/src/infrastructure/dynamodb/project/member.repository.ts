import { ProjectUser } from '../../../domain/project-user';
import { memberEntity } from '../entities/member.entity';
import { Identity } from '../../../domain/identity';
import { table } from '../entities/table';
import { Project } from '../../../domain/project';
import { QueryCommand } from 'dynamodb-toolbox/table/actions/query';
import {
  BatchWriteCommand,
  execute,
} from 'dynamodb-toolbox/table/actions/batchWrite';
import { BatchPutRequest } from 'dynamodb-toolbox/entity/actions/batchPut';
import { GetItemCommand } from 'dynamodb-toolbox/entity/actions/get';

export const dynamodbMemberRepository = () => {
  async function updateMembers(project: Project) {
    const { id, name } = project.toDTO();

    const { Items } = await table
      .build(QueryCommand)
      .query({ partition: `PROJECT#${id}`, range: { beginsWith: 'USER#' } })
      .entities(memberEntity)
      .send();

    if (!Items || (Array.isArray(Items) && Items.length === 0)) {
      return;
    }

    const cmd = table
      .build(BatchWriteCommand)
      .requests(
        ...Items.map((i) =>
          memberEntity.build(BatchPutRequest).item({ ...i, projectName: name }),
        ),
      );

    await execute(cmd);
  }

  async function createMember(): Promise<ProjectUser> {
    return member;
  }

  async function getMember(
    identity: Identity,
    projectId: string,
  ): Promise<ProjectUser> {
    const { Item } = await memberEntity
      .build(GetItemCommand)
      .key({
        pk: projectId,
        sk: identity.username,
      })
      .send();

    if (!Item) {
      throw new Error('Member not found');
    }

    return toMember(Item);
  }

  async function getUserProjects(identity: Identity) {
    const query = await table
      .build(QueryCommand)
      .query({
        partition: `USER#${identity.username}`,
        range: {
          beginsWith: 'PROJECT#',
        },
        index: 'GSI1',
      })
      .entities(memberEntity)
      .options({})
      .send();

    if (!query.Items) {
      return [];
    }

    return query.Items.map(toMember);
  }

  function toMember(item: {
    pk: string;
    sk: string;
    projectName: string;
    created: string;
  }): ProjectUser {
    return new ProjectUser(item.pk, item.projectName, item.sk, item.created);
  }

  return {
    toMember,
    updateMembers,
    getUserProjects,
    getMember,
  };
};
