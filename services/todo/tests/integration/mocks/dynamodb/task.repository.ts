import { Task } from '../../../../src/domain/task';
import { TaskStatus } from '../../../../src/domain/task-status';

type InMemoryTask = ReturnType<Task['toDTO']>;

export const inMemoryTaskRepository = () => {
  const tasksStore: InMemoryTask[] = [];

  async function createTask(task: Task): Promise<Task> {
    const dto = task.toDTO();
    tasksStore.push(dto);
    return toTask(dto);
  }

  async function getTasks(projectId: string): Promise<Task[]> {
    return tasksStore
      .filter((task) => task.projectId === projectId)
      .map(toTask);
  }

  async function getTask(projectId: string, id: string): Promise<Task> {
    const task = tasksStore.find(
      (task) => task.projectId === projectId && task.id === id,
    );

    if (!task) {
      throw new Error('Task not found');
    }

    return toTask(task);
  }

  async function updateTask(task: Task): Promise<Task> {
    const dto = task.toDTO();
    const index = tasksStore.findIndex(
      (task) => task.projectId === dto.projectId && task.id === dto.id,
    );

    if (index === -1) {
      throw new Error('Task not found');
    }

    tasksStore[index] = {
      ...tasksStore[index],
      title: dto.title,
      description: dto.description,
      status: dto.status,
      owner: dto.owner,
    };

    return toTask(tasksStore[index]);
  }

  function toTask(item: InMemoryTask): Task {
    return new Task(
      item.id,
      item.projectId,
      item.title,
      item.description,
      item.owner,
      TaskStatus[item.status as keyof typeof TaskStatus],
    );
  }

  return { createTask, getTasks, updateTask, getTask };
};
