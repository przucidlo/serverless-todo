import { GetItemCommand, QueryCommand } from 'dynamodb-toolbox';
import { ProjectUser } from '../../../domain/project-user';
import { memberEntity } from '../entities/member.entity';
import { Identity } from '../../../domain/identity';
import { table } from '../entities/table';

export const dynamodbMemberRepository = () => {
  async function updateMembers(project: Project) {
    throw new Error('todo');
  }

  async function getMember(
    identity: Identity,
    projectId: string,
  ): Promise<ProjectUser> {
    const { Item } = await memberEntity
      .build(GetItemCommand)
      .key({
        pk: `PROJECT#${projectId}`,
        sk: `USER#${identity.username}`,
      })
      .send();

    if (!Item) {
      throw new Error('Project not found');
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
    return new ProjectUser(item.pk, item.projectName, item.created);
  }

  return {
    toMember,
    updateMembers,
    getUserProjects,
    getMember,
  };
};
