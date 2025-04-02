import { ProjectUser } from '../../domain/project-user';
import { Task } from '../../domain/task';
import { FromApplication, isEntity } from '../../domain/types/entity.type';

const dump =
  <R>(f: (member: ProjectUser, ...args: unknown[]) => Promise<R>) =>
  async (member: ProjectUser | undefined) => {
    const value = args[0];

    const projectId = isEntity(value)
      ? value.toDTO().projectId
      : value.projectId;

    if (member?.isMember(projectId)) {
      return f(member, ...args);
    }

    throw new Error('User is not the member of the project');
  };

export const projectMemberGuard =
  <
    A extends [FromApplication<{ projectId: string }>, ...rest: unknown[]],
    R = Task,
  >(
    f: (member: ProjectUser, ...args: A) => Promise<R>,
  ) =>
  async (member: ProjectUser | undefined) =>
  async (args: A) => {
    const value = args[0];

    const projectId = isEntity(value)
      ? value.toDTO().projectId
      : value.projectId;

    if (member?.isMember(projectId)) {
      return f(member, ...args);
    }

    throw new Error('User is not the member of the project');
  };
