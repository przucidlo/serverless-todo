import { Identity } from '../../../domain/identity';
import { PartialProject, Project } from '../../../domain/project';
import { ProjectUser } from '../../../domain/project-user';
import { PartialTask, Task } from '../../../domain/task';
import { FromApplication, isEntity } from '../../../domain/types/entity.type';
import { ProjectDTO } from '../../dto/project-dto';
import { EventPublisher } from '../../interfaces/event-publisher.interface';
import { UpdateProjectMembersEvent } from '../../types/events.type';
import { ProjectRepository } from './project.repository';

export const projectService = (
  repository: ProjectRepository,
  publisher: EventPublisher,
) => {
  const executeAsOwner =
    <V extends FromApplication<{ id: string }>, R>(
      f: (project: Project, value: V) => Promise<R>,
    ) =>
    async (identity: Identity, value: V) => {
      const id = isEntity(value) ? value.toDTO().id : value.id;
      const project = await repository.getProject(id);

      if (!project.isOwner(identity)) {
        throw new Error('Insufficient permissions.');
      }

      return f(project, value);
    };

  const executeAsMember =
    <V extends FromApplication<{ projectId: string }>, R = Task>(
      f: (member: ProjectUser, value: V) => Promise<R>,
    ) =>
    async (identity: Identity, value: V) => {
      const projectId = isEntity(value)
        ? value.toDTO().projectId
        : value.projectId;

      const member = await repository.getMember(identity, projectId);

      if (!member) {
        throw new Error('User is not the member of the project');
      }

      return f(member, value);
    };

  async function updateProject(project: Project, value: PartialProject) {
    let requiresMembersUpdate = false;

    if (value.name && !project.compareNames(value.name)) {
      project.changeName(value.name);

      requiresMembersUpdate = true;
    }

    const entity = await repository.updateProject(project);

    if (requiresMembersUpdate) {
      await publisher.publish<UpdateProjectMembersEvent>(
        'update-project-members',
        new ProjectDTO(entity),
      );
    }

    return entity;
  }

  async function updateTask(member: ProjectUser, value: PartialTask) {
    const { project } = member.toDTO();

    const task = await repository.getTask(project.id, value.id);

    if (value.status) {
      task.transition(value.status);
    }

    return repository.updateTask(task);
  }

  return {
    addProject: repository.createProject,
    deleteProject: executeAsOwner(repository.deleteProject),
    updateProject: executeAsOwner(updateProject),
    getProjects: repository.getUserProjects,
    addTask: executeAsMember<Task, Task>((_, task) =>
      repository.createTask(task),
    ),
    getTasks: executeAsMember<{ projectId: string }, Task[]>((member) =>
      repository.getTasks(member.toDTO().project.id),
    ),
    updateTask: executeAsMember<PartialTask, Task>((member, value) =>
      updateTask(member, value),
    ),
    updateMembers: repository.updateMembers,
  };
};
