import {
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from 'dynamodb-toolbox';
import { taskEntity } from '../entities/task.entity';
import { TaskStatus } from '../../../domain/task-status';
import { Task } from '../../../domain/task';
import { table } from '../entities/table';

export const dynamodbTaskRepository = () => {
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

    return toTask(ToolboxItem);
  }

  async function getTasks(projectId: string): Promise<Task[]> {
    const query = await table
      .build(QueryCommand)
      .query({
        partition: `PROJECT#${projectId}`,
        range: { beginsWith: 'TASK#' },
      })
      .entities(taskEntity)
      .send();

    if (!query.Items) {
      return [];
    }

    return query.Items.map(toTask);
  }

  async function getTask(projectId: string, taskId: string): Promise<Task> {
    const { Item } = await taskEntity
      .build(GetItemCommand)
      .key({
        pk: projectId,
        sk: taskId,
      })
      .send();

    if (!Item) {
      throw new Error('Task not found');
    }

    return toTask(Item);
  }

  async function updateTask(task: Task): Promise<Task> {
    const { id, projectId, ...dto } = task.toDTO();

    const { Attributes } = await taskEntity
      .build(UpdateItemCommand)
      .item({
        pk: projectId,
        sk: id,
        ...dto,
      })
      .options({ returnValues: 'ALL_NEW' })
      .send();

    if (!Attributes) {
      throw new Error('Task not found');
    }

    return toTask(Attributes);
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

  return { createTask, getTasks, updateTask, getTask };
};
