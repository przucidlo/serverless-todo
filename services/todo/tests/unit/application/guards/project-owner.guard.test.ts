import { describe, it, expect, beforeEach } from 'vitest';
import { projectOwnerGuard } from '../../../../src/application/guards/project-owner.guard';
import { Identity } from '../../../../src/domain/identity';
import { Project } from '../../../../src/domain/project';

describe('projectOwnerGuard', () => {
  let identity: Identity;
  let projectId: string;

  let mockGetProject: () => Promise<Project>;

  beforeEach(() => {
    identity = { username: 'owner' };
    projectId = 'project-1';

    mockGetProject = async () =>
      new Project(projectId, 'name', identity.username);
  });

  it('should call the wrapped function if the user is the project owner', async () => {
    await expect(
      projectOwnerGuard(mockGetProject)(async () => true)(identity, {
        id: projectId,
      }),
    ).resolves.toEqual(true);
  });

  it('should throw an error if the user is not the project owner', async () => {
    mockGetProject = async () => new Project(projectId, 'name', 'other-owner');

    await expect(
      projectOwnerGuard(mockGetProject)(async () => true)(identity, {
        id: projectId,
      }),
    ).rejects.toThrow('Insufficient permissions.');
  });
});
