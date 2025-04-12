import { Identity } from '../../domain/identity';
import { ProjectUser } from '../../domain/project-user';
import { Task } from '../../domain/task';
import { FromApplication, isEntity } from '../../domain/types/entity.type';
import { ProjectRepository } from '../services/project/project.repository';

export const projectMemberGuard =
  (getMember: ProjectRepository['getMember']) =>
  <V extends [FromApplication<{ projectId: string }>, ...unknown[]], R = Task>(
    f: (member: ProjectUser, ...values: V) => Promise<R>,
  ) =>
  async (identity: Identity, ...values: V) => {
    const value = values[0];

    const projectId = isEntity(value)
      ? value.toDTO().projectId
      : value.projectId;

    const member = await getMember(identity, projectId);

    if (member?.isMember(projectId)) {
      return f(member, ...values);
    }

    throw new Error('User is not the member of the project');
  };
