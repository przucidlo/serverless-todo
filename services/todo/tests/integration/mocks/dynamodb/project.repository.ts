import { Project } from '../../../../src/domain/project';
import { Identity } from '../../../../src/domain/identity';
import { ProjectUser } from '../../../../src/domain/project-user';
import { ProjectRepository } from '../../../../src/application/services/project/project.repository';
import { inMemoryMemberRepository } from './member.repository';
import { inMemoryTaskRepository } from './task.repository';

type InMemoryProject = ReturnType<Project['toDTO']>;

export const inMemoryProjectRepository = (): ProjectRepository => {
  const memberRepository = inMemoryMemberRepository();
  const taskRepository = inMemoryTaskRepository();

  const projectsStore: InMemoryProject[] = [];

  async function getProject(projectId: string): Promise<Project> {
    const project = projectsStore.find((p) => p.id === projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    return toProject(project);
  }

  async function createProject(
    project: Project,
    identity: Identity,
  ): Promise<[Project, ProjectUser]> {
    const dto = project.toDTO();

    projectsStore.push(dto);

    const member = await memberRepository.createMember(
      project,
      identity.username,
    );

    return [toProject(dto), member];
  }

  async function updateProject(project: Project): Promise<Project> {
    const dto = project.toDTO();
    const index = projectsStore.findIndex((p) => p.id === dto.id);

    if (index === -1) {
      throw new Error('Project not found');
    }

    projectsStore[index] = {
      ...projectsStore[index],
      name: dto.name,
    };

    await memberRepository.updateMembers(project);

    return toProject(projectsStore[index]);
  }

  async function deleteProject(project: Project): Promise<void> {
    const projectId = project.getId();
    const index = projectsStore.findIndex((p) => p.id === projectId);

    if (index !== -1) {
      projectsStore.splice(index, 1);
    }
  }

  function toProject(item: InMemoryProject): Project {
    return new Project(item.id, item.name, item.owner);
  }

  return {
    getProject,
    updateProject,
    createProject,
    deleteProject,
    ...memberRepository,
    ...taskRepository,
  };
};
