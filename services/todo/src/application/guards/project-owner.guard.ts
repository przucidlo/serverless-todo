import { Identity } from '../../domain/identity';
import { Project } from '../../domain/project';
import { FromApplication, isEntity } from '../../domain/types/entity.type';
import { ProjectRepository } from '../services/project/project.repository';

export const projectOwnerGuard =
  (getProject: ProjectRepository['getProject']) =>
  <V extends FromApplication<{ id: string }>, R>(
    f: (project: Project, value: V) => Promise<R>,
  ) =>
  async (identity: Identity, value: V) => {
    const id = isEntity(value) ? value.toDTO().id : value.id;
    const project = await getProject(id);

    if (!project.isOwner(identity)) {
      throw new Error('Insufficient permissions.');
    }

    return f(project, value);
  };
