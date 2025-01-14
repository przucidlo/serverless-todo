import {
  DeletePartitionCommand,
  GetItemCommand,
  PutItemCommand,
  PutTransaction,
  QueryCommand,
  UpdateItemCommand,
} from "dynamodb-toolbox";
import { projectEntity } from "../../db/project.entity";
import { Project } from "../../domain/project";
import { table } from "../../db/table";
import { taskEntity } from "../../db/task.entity";
import { Task } from "../../domain/task";
import { TaskStatus } from "../../domain/task-status";
import { ProjectUser } from "../../domain/project-user";
import { memberEntity } from "../../db/member.entity";
import { User } from "../../domain/user";
import { execute } from "dynamodb-toolbox/dist/esm/entity/actions/transactWrite";



async function getProject(projectId: string): Promise<Project> {
  const { Item } = await projectEntity
    .build(GetItemCommand)
    .key(getProjectKey(projectId))
    .send();

  if (!Item) {
    throw new Error("Project not found");
  }

  return new Project(Item.pk, Item.name, Item.owner);
}

async function createProject(
  project: Project,
  user: User
): Promise<[Project, ProjectUser]> {
  const { id, ...dto } = project.toDTO();
  const { username } = user.toDTO();

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

  const { ToolboxItems } = await execute(
    projectTransaction,
    projectUserTransaction
  );

  return [
    toolboxItemToProject(ToolboxItems[0]),
    toolboxItemToProjectMember(ToolboxItems[1]),
  ];
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
      returnValues: "ALL_NEW",
    })
    .send();

  if (!Attributes) {
    throw new Error("Project not found");
  }

  return new Project(Attributes.pk, Attributes.name, Attributes.owner);
}

async function deleteProject(project: Project) {
  const { id } = project.toDTO();

  await table
    .build(DeletePartitionCommand)
    .query({ partition: `PROJECT#${id}` })
    .send();
}

async function getProjectTasks(project: Project) {
  const { id } = project.toDTO();

  const { Items } = await table
    .build(QueryCommand)
    .entities(taskEntity)
    .query({
      partition: `PROJECT#${id}`,
      range: {
        beginsWith: `TASK#`,
      },
    })
    .send();

  if (!Items) {
    return [];
  }

  return Items.map(
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

function getProjectKey(projectId: string) {
  return {
    pk: `PROJECT#${projectId}`,
    sk: `PROJECT#${projectId}`,
  };
}

function toolboxItemToProject(item: {
  pk: string;
  name: string;
  owner: string;
}): Project {
  return new Project(item.pk, item.name, item.owner);
}

function toolboxItemToProjectMember(item: {
  pk: string;
  sk: string;
  projectName: string;
  created: string;
}): ProjectUser {
  return new ProjectUser(item.pk, item.projectName, item.created);
}

export { getProject, updateProject, deleteProject, getProjectTasks };
