import { describe, it, expect, vi, Mock } from 'vitest';
import { projectMemberGuard } from '../../../../src/application/guards/project-member.guard';
import { Identity } from '../../../../src/domain/identity';
import { ProjectUser } from '../../../../src/domain/project-user';
import { ProjectRepository } from '../../../../src/application/services/project/project.repository';

describe('projectMemberGuard', () => {
  let mockRepository;

  const mockIdentity: Identity = { username: 'user-1' };
  const mockProjectUser: ProjectUser = {
    id: 'member-1',
    projectId: 'project-1',
  };

  const mockFunction = vi.fn(async (member: ProjectUser, ...args: any[]) => {
    return { success: true };
  });

  const guard = projectMemberGuard(mockRepository);

  it('should call the wrapped function if the user is a project member', async () => {
    mockRepository.getMember.mockResolvedValue(mockProjectUser);

    const result = await guard(mockFunction)(mockIdentity, {
      projectId: 'project-1',
    });

    expect(mockRepository.getMember).toHaveBeenCalledWith(
      mockIdentity,
      'project-1',
    );
    expect(mockFunction).toHaveBeenCalledWith(mockProjectUser, {
      projectId: 'project-1',
    });
    expect(result).toEqual({ success: true });
  });

  it('should throw an error if the user is not a project member', async () => {
    mockRepository.getMember.mockRejectedValue(new Error('Not a member'));

    await expect(
      guard(mockFunction)(mockIdentity, { projectId: 'project-1' }),
    ).rejects.toThrow('User is not the member of the project');
  });
});
