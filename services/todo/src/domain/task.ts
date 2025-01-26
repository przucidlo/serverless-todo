import { TaskStatus } from './task-status';
import { PartialEntity } from './types/entity.type';

export type PartialTask = PartialEntity<Task, 'id' | 'projectId'>;

export class Task {
  private id: string;
  private title: string;
  private description: string;
  private status: TaskStatus;
  private projectId: string;
  private owner?: string;

  constructor(
    id: string,
    projectId: string,
    title: string,
    description: string,
    owner: string | undefined,
    status: TaskStatus,
  ) {
    this.id = id;
    this.projectId = projectId;
    this.title = title;
    this.description = description;
    this.owner = owner;
    this.status = status;
  }

  toDTO() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      owner: this.owner,
      status: this.status,
      projectId: this.projectId,
    };
  }
}
