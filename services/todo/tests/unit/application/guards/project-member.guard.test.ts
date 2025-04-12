import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectMemberGuard } from '../../../../src/application/guards/project-member.guard';
import { Identity } from '../../../../src/domain/identity';
import { ProjectUser } from '../../../../src/domain/project-user';

describe('projectMemberGuard', () => {
  let identity: Identity;
  let projectId: string;
  let mockProjectUser: ProjectUser;

  let mockGetMember: typeof vi.fn;
  let mockFunction: typeof vi.fn;

  let guard: typeof projectMemberGuard;

  beforeEach(() => {
    mockGetMember = vi.fn();
    mockFunction = vi.fn();

    identity = { username: 'user' };
    projectId = 'project-1';
    mockProjectUser = new ProjectUser(
      projectId,
      'name',
      identity.username,
      new Date().toISOString(),
    );

    guard = projectMemberGuard(mockGetMember);
  });

  it('should call the wrapped function if the user is a project member', async () => {
    const value = true;

    mockGetMember.mockResolvedValue(mockProjectUser);
    mockFunction.mockResolvedValue(value);

    await expect(guard(mockFunction)(identity, { projectId })).resolves.toEqual(
      value,
    );
  });

  it('should throw an error if the user is not a project member', async () => {
    mockGetMember.mockResolvedValue(null);

    await expect(guard(mockFunction)(identity, { projectId })).rejects.toThrow(
      'User is not the member of the project',
    );
  });
});
