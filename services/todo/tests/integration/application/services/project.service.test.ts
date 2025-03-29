import { describe, it, expect, beforeEach, vi } from 'vitest';
import { projectService } from '../../../../src/application/services/project/project.service';
import { inMemoryProjectRepository } from '../../mocks/dynamodb/project.repository';
import { EventPublisher } from '../../../../src/application/interfaces/event-publisher.interface';
import { Identity } from '../../../../src/domain/identity';
import { Project } from '../../../../src/domain/project';
import { Task } from '../../../../src/domain/task';
import { ProjectRepository } from '../../../application/services/project/project.repository';

describe('Project Service', () => {
  let repository: ProjectRepository;
  let publisher: EventPublisher;
  let service: ReturnType<typeof projectService>;

  let identity: Identity;
  let project: Project;

  beforeEach(() => {
    repository = inMemoryProjectRepository();
    publisher = {
      publish: vi.fn().mockResolvedValue(undefined),
    };
    service = projectService(repository, publisher);
    identity = { username: 'user' };
    project = new Project('project-123', 'Test Project', identity.username);
  });

  describe('updateProject', () => {
    beforeEach(async () => {
      await repository.createProject(project, identity);
    });

    it('should update project when user is the owner', async () => {
      const name = 'Mock name';

      const updatedProject = await service.updateProject(identity, {
        id: project.getId(),
        name,
      });

      expect(updatedProject.toDTO()).toMatchObject({ name: name });
    });

    it('should not update if no changes are needed', async () => {
      const updateProjectSpy = vi.spyOn(repository, 'updateProject');

      await service.updateProject(identity, {
        id: project.getId(),
        name: project.toDTO().name,
      });

      // Verify that the repository was still called (although no change to name)
      expect(updateProjectSpy).toHaveBeenCalled();
      // Verify that no event was published since no changes occurred
      expect(publisher.publish).not.toHaveBeenCalled();
    });

    it('should publish an event when project name is updated', async () => {
      await service.updateProject(identity, {
        id: project.getId(),
        name: 'Updated Project',
      });

      expect(publisher.publish).toHaveBeenCalledWith(
        'update-project-members',
        expect.objectContaining({ name: 'Updated Project' }),
      );
    });

    it('should throw an error when user is not the owner', async () => {
      const nonOwner = new Identity('user2', 'User Two');

      await expect(
        service.updateProject(nonOwner, {
          id: project.getId(),
          name: 'Updated Project',
        }),
      ).rejects.toThrow('Insufficient permissions.');
    });
  });

  describe('updateTask', () => {
    let task: Task;

    beforeEach(async () => {
      await repository.createProject(project, identity);
      task = new Task('task-123', 'Test Task', '', project.getId(), 'user1');
      await repository.createTask(task);
    });

    it('should update task title', async () => {
      const updatedTask = await service.updateTask(identity, {
        id: task.getId(),
        projectId: project.getId(),
        title: 'Updated Task',
      });

      expect(updatedTask.getTitle()).toBe('Updated Task');
    });

    it('should update task description', async () => {
      const updatedTask = await service.updateTask(identity, {
        id: task.getId(),
        projectId: project.getId(),
        description: 'Updated description',
      });

      expect(updatedTask.getDescription()).toBe('Updated description');
    });

    it('should update task owner', async () => {
      const updatedTask = await service.updateTask(identity, {
        id: task.getId(),
        projectId: project.getId(),
        owner: 'user2',
      });

      expect(updatedTask.getOwner()).toBe('user2');
    });

    it('should update task status', async () => {
      const updatedTask = await service.updateTask(identity, {
        id: task.getId(),
        projectId: project.getId(),
        status: 'IN_PROGRESS',
      });

      expect(updatedTask.getStatus()).toBe('IN_PROGRESS');
    });

    it('should not update task if no changes are detected', async () => {
      const updateTaskSpy = vi.spyOn(repository, 'updateTask');

      await service.updateTask(identity, {
        id: task.getId(),
        projectId: project.getId(),
        title: 'Test Task', // Same title as before
      });

      expect(updateTaskSpy).not.toHaveBeenCalled();
    });

    it('should throw an error when user is not a member of the project', async () => {
      const nonMember = new Identity('user2', 'User Two');

      await expect(
        service.updateTask(nonMember, {
          id: task.getId(),
          projectId: project.getId(),
          title: 'Updated Task',
        }),
      ).rejects.toThrow('User is not the member of the project');
    });

    it('should apply multiple updates at once', async () => {
      const updatedTask = await service.updateTask(identity, {
        id: task.getId(),
        projectId: project.getId(),
        title: 'Updated Task',
        description: 'Updated description',
        status: 'DONE',
      });

      expect(updatedTask.getTitle()).toBe('Updated Task');
      expect(updatedTask.getDescription()).toBe('Updated description');
      expect(updatedTask.getStatus()).toBe('DONE');
    });
  });
});
