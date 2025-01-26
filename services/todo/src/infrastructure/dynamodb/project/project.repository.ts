import {
  DeletePartitionCommand,
  GetItemCommand,
  PutItemCommand,
  PutTransaction,
  QueryCommand,
  UpdateItemCommand,
  executeTransactWrite,
} from 'dynamodb-toolbox';
import { projectEntity } from '../entities/project.entity';
import { Project } from '../../../domain/project';
import { table } from '../entities/table';
import { taskEntity } from '../entities/task.entity';
import { Task } from '../../../domain/task';
import { TaskStatus } from '../../../domain/task-status';
import { ProjectUser } from '../../../domain/project-user';
import { memberEntity } from '../entities/member.entity';
import { ProjectRepository } from '../../../application/services/project/project.repository';
import { Identity } from '../../../domain/identity';

export const dynamodbProjectRepository: () => ProjectRepository = () => {
  async function getProject(projectId: string): Promise<Project> {
    const { Item } = await projectEntity
      .build(GetItemCommand)
      .key(getProjectKey(projectId))
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
      .item({ ...getProjectKey(id), ...dto });

    const projectUserTransaction = memberEntity.build(PutTransaction).item({
      pk: id,
      sk: username,
      GSI1PK: username,
      GSI1SK: id,
      projectName: dto.name,
    });

    const { ToolboxItems } = await executeTransactWrite(
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
      .query({ partition: `PROJECT#${id}` })
      .send();
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

  async function updateMembers(project: Project) {
    throw new Error('todo');
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

    return query.Items.map(
      (i) => new ProjectUser(i.pk, i.projectName, i.created),
    );
  }

  async function createTask(task: Task): Promise<Task> {
    const dto = task.toDTO();

    const { ToolboxItem } = await taskEntity
      .build(PutItemCommand)
      .item({
        ...dto,
        pk: dto.projectId,
        sk: dto.id,
        status: dto.status.toString(),
      })
      .send();

    return new Task(
      ToolboxItem.sk,
      ToolboxItem.pk,
      ToolboxItem.title,
      ToolboxItem.description,
      ToolboxItem.owner,
      TaskStatus[ToolboxItem.status as keyof typeof TaskStatus],
    );
  }

  async function getTasks(projectId: string): Promise<Task[]> {
    const query = await table
      .build(QueryCommand)
      .query({
        partition: `PROJECT#${projectId}`,
        range: { beginsWith: 'TASK' },
      })
      .entities(taskEntity)
      .send();

    if (!query.Items) {
      return [];
    }

    return query.Items.map((i) => toTask(i));
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

  function toMember(item: {
    pk: string;
    sk: string;
    projectName: string;
    created: string;
  }): ProjectUser {
    return new ProjectUser(item.pk, item.projectName, item.created);
  }

  function toTask(item: {
    sk: string;
    pk: string;
    title: string;
    description: string;
    status: string;
    owner?: string;
  }): Task {
    return new Task(
      item.sk,
      item.pk,
      item.title,
      item.description,
      item.owner,
      TaskStatus[item.status as keyof typeof TaskStatus],
    );
  }

  return {
    getProject,
    updateProject,
    createProject,
    deleteProject,
    updateMembers,
    getMember,
    createTask,
    getTasks,
    getUserProjects,
  };
};
