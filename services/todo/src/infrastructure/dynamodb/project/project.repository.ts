import { projectEntity } from '../entities/project.entity';
import { Project } from '../../../domain/project';
import { table } from '../entities/table';
import { ProjectUser } from '../../../domain/project-user';
import { memberEntity } from '../entities/member.entity';
import { ProjectRepository } from '../../../application/services/project/project.repository';
import { Identity } from '../../../domain/identity';
import { dynamodbTaskRepository } from './task.repository';
import { dynamodbMemberRepository } from './member.repository';
import { GetItemCommand } from 'dynamodb-toolbox/entity/actions/get';
import { UpdateItemCommand } from 'dynamodb-toolbox/entity/actions/update';
import { DeletePartitionCommand } from 'dynamodb-toolbox/table/actions/deletePartition';
import { execute } from 'dynamodb-toolbox/entity/actions/transactWrite'
import { PutTransaction } from 'dynamodb-toolbox/entity/actions/transactPut'

export const dynamodbProjectRepository: () => ProjectRepository = () => {
  const { toMember, ...memberRepository } = dynamodbMemberRepository();
  const taskRepositry = dynamodbTaskRepository();

  async function getProject(projectId: string): Promise<Project> {
    const { Item } = await projectEntity
      .build(GetItemCommand)
      .key({ pk: projectId, sk: projectId })
      .send();

    if (!Item) {
      throw new Error('Project not found');
    }

    return toProject(Item);
  }

  async function createProject(
    project: Project,
    identity: Identity,
  ): Promise<[Project, ProjectUser]> {
    const { id, ...dto } = project.toDTO();
    const { username } = identity;

    const projectTransaction = projectEntity
      .build(PutTransaction)
      .item({ pk: id, sk: id, ...dto });

    const projectUserTransaction = memberEntity.build(PutTransaction).item({
      pk: id,
      sk: username,
      GSI1PK: username,
      GSI1SK: id,
      projectName: dto.name,
    });

    const { ToolboxItems } = await execute(
      projectTransaction,
      projectUserTransaction,
    );

    return [toProject(ToolboxItems[0]), toMember(ToolboxItems[1])];
  }

  async function updateProject(project: Project) {
    const { id, ...dto } = project.toDTO();

    const { Attributes } = await projectEntity
      .build(UpdateItemCommand)
      .item({
        pk: `${id}`,
        sk: `${id}`,
        ...dto,
      })
      .options({
        returnValues: 'ALL_NEW',
      })
      .send();

    if (!Attributes) {
      throw new Error('Project not found');
    }

    return toProject(Attributes);
  }

  async function deleteProject(project: Project) {
    const { id } = project.toDTO();

    await table
      .build(DeletePartitionCommand)
      .query({ partition: getProjectKey(id).pk })
      .entities(projectEntity, memberEntity)
      .send();
  }

  function getProjectKey(projectId: string) {
    return {
      pk: `PROJECT#${projectId}`,
      sk: `PROJECT#${projectId}`,
    };
  }

  function toProject(item: {
    pk: string;
    name: string;
    owner: string;
  }): Project {
    return new Project(item.pk, item.name, item.owner);
  }

  return {
    getProject,
    updateProject,
    createProject,
    deleteProject,
    ...memberRepository,
    ...taskRepositry,
  };
};
