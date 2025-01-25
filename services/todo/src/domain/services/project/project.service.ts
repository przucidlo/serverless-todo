import { Identity } from '../../identity';
import { PartialProject, Project } from '../../project';
import { ProjectUser } from '../../project-user';
import { PartialTask, Task } from '../../task';
import { PartialEntity } from '../../types/entity.type';
import { ProjectRepository } from './project.repository';

export const projectService = (repository: ProjectRepository) => {
  const executeAsOwner =
    <R>(f: (project: Project, value: PartialProject) => Promise<R>) =>
    async (identity: Identity, value: PartialProject) => {
      const project = await repository.getProject(value.id);

      if (!project.isOwner(identity)) {
        throw new Error('Insufficient permissions.');
      }

      return f(project, value);
    };

  const executeAsMember =
    <V extends PartialTask | Task, R = Task>(
      f: (member: ProjectUser, value: V) => Promise<R>,
    ) =>
    async (identity: Identity, value: V) => {
      const id = value instanceof Task ? value.toDTO().id : value.id;

      const member = await repository.getMember(identity, id);

      if (!member) {
        throw new Error('User does not belong to the project');
      }

      return f(member, value);
    };

  async function updateProject(
    project: Project,
    value: PartialEntity<Project, 'id'>,
  ) {
    let requiresMembersUpdate = false;

    if (value.name && project.compareNames(value.name)) {
      project.changeName(value.name);

      requiresMembersUpdate = true;
    }

    const entity = await repository.updateProject(project);

    if (requiresMembersUpdate) {
      // Publish to sqs
    }

    return entity;
  }

  return {
    addProject: repository.createProject,
    addTask: executeAsMember<Task>((_, task) => repository.createTask(task)),
    deleteProject: executeAsOwner(repository.deleteProject),
    updateProject: executeAsOwner(updateProject),
    getTasks: executeAsMember((member) =>
      repository.getTasks(member.toDTO().project.id),
    ),
  };
};
