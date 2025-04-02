import { Identity } from '../../../domain/identity';
import { PartialProject, Project } from '../../../domain/project';
import { ProjectUser } from '../../../domain/project-user';
import { PartialTask, Task } from '../../../domain/task';
import { ProjectDTO } from '../../dto/project-dto';
import { projectMemberGuard } from '../../guards/project-member.guard';
import { projectOwnerGuard } from '../../guards/project-owner.guard';
import { EventPublisher } from '../../interfaces/event-publisher.interface';
import { UpdateProjectMembersEvent } from '../../types/events.type';
import { ProjectRepository } from './project.repository';

export const projectService = (
  repository: ProjectRepository,
  publisher: EventPublisher,
) => {
  const asOwner = projectOwnerGuard(repository);
  const asMember = (identity: Identity, projectId: string) =>
    repository
      .getMember(identity, projectId)
      .then((member) => projectMemberGuard(member));

  async function updateProject(project: Project, value: PartialProject) {
    let requiresMembersUpdate = false;

    if (!project.hasChanges(value)) {
      return project;
    }

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
    const task = await repository.getTask(member.toDTO().project.id, value.id);

    if (!task.hasChanges(value)) {
      return task;
    }

    if (value.title) {
      task.updateTitle(value.title);
    }

    if (value.description) {
      task.updateDescription(value.description);
    }

    if (value.owner !== undefined) {
      task.updateOwner(value.owner);
    }

    if (value.status) {
      task.transition(value.status);
    }

    return repository.updateTask(task);
  }

  return {
    addProject: repository.createProject,
    deleteProject: asOwner(repository.deleteProject),
    updateProject: asOwner(updateProject),
    getProjects: repository.getUserProjects,

    addTask: asMember<[Task], Task>((_, task) => repository.createTask(task)),
    getTasks: asMember<[{ projectId: string }], Task[]>((member) =>
      repository.getTasks(member.toDTO().project.id),
    ),
    updateTask: asMember<[PartialTask, Project]>((member, value) =>
      updateTask(member, value),
    ),
  };
};
