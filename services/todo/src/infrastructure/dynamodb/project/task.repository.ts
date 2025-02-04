import { PutItemCommand, QueryCommand } from 'dynamodb-toolbox';
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

  return { createTask, getTasks };
};
