import { IsEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { Task } from '../../domain/task';
import { TaskStatus } from '../../domain/task-status';

export enum ValidationGroup {
  PATCH = 'PATCH',
  QUEUE = 'QUEUE',
}

export class TaskDTO {
  constructor(entity?: Task) {
    if (entity) {
      const task = entity.toDTO();

      this.id = task.id;
      this.title = task.title;
      this.description = task.description;
      this.status = task.status;
      this.owner = task.owner;
    }
  }

  @IsEmpty()
  public id?: string;

  @IsString()
  @IsOptional({ groups: [ValidationGroup.PATCH] })
  public title!: string;

  @IsString()
  @IsOptional({ groups: [ValidationGroup.PATCH] })
  public description!: string;

  @IsEnum(TaskStatus)
  @IsOptional({ groups: [ValidationGroup.PATCH] })
  public status!: TaskStatus;

  @IsOptional()
  public owner!: string | undefined;

  public toEntity(
    id: string | undefined,
    projectId: string,
    owner: string,
  ): Task {
    return new Task(
      id,
      projectId,
      this.title,
      this.description,
      owner,
      this.status,
    );
  }
}
