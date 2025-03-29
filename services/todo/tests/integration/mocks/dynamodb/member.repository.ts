import { ProjectUser } from '../../../../src/domain/project-user';
import { Identity } from '../../../../src/domain/identity';
import { Project } from '../../../../src/domain/project';

type InMemoryMember = ReturnType<ProjectUser['toDTO']>;

export const inMemoryMemberRepository = () => {
  const members: Array<InMemoryMember> = [];

  async function createMember(
    project: Project,
    username: string,
  ): Promise<ProjectUser> {
    const dto = project.toDTO();

    const member = new ProjectUser(
      dto.id,
      dto.name,
      username,
      new Date().toISOString(),
    );

    members.push(member.toDTO());

    return member;
  }

  async function updateMembers(project: Project) {
    const { id, name } = project.toDTO();

    members.forEach((member) => {
      if (member.project.id === id) {
        member.project.name = name;
      }
    });
  }

  async function getMember(
    identity: Identity,
    projectId: string,
  ): Promise<ProjectUser> {
    const member = members.find(
      (m) => m.project.id === projectId && m.username === identity.username,
    );

    if (!member) {
      throw new Error('Member not found');
    }

    return toMember(member);
  }

  async function getUserProjects(identity: Identity) {
    const userProjects = members.filter(
      (m) => m.username === identity.username,
    );

    return userProjects.map(toMember);
  }

  function toMember(item: InMemoryMember): ProjectUser {
    return new ProjectUser(
      item.project.id,
      item.project.name,
      item.username,
      item.created_at,
    );
  }

  return {
    toMember,
    createMember,
    updateMembers,
    getUserProjects,
    getMember,
  };
};
