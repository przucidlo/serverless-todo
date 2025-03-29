import { describe, it, expect, beforeEach, vi } from 'vitest';
import { projectService } from '../../../../src/application/services/project/project.service';
import { inMemoryProjectRepository } from '../../mocks/dynamodb/project.repository';
import { EventPublisher } from '../../../../src/application/interfaces/event-publisher.interface';
import { Identity } from '../../../../src/domain/identity';
import { Project } from '../../../../src/domain/project';
import { Task } from '../../../../src/domain/task';
import { ProjectRepository } from '../../../application/services/project/project.repository';
import { TaskStatus } from '../../../../src/domain/task-status';

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

    it('Should update project', async () => {
      const name = 'Mock name';

      const updatedProject = await service.updateProject(identity, {
        ...project.toDTO(),
        name,
      });

      expect(updatedProject.toDTO()).toMatchObject({ name });
    });

    it('Should not update if project did not change', async () => {
      const updateProjectSpy = vi.spyOn(repository, 'updateProject');

      await service.updateProject(identity, project.toDTO());

      expect(updateProjectSpy).not.toHaveBeenCalled();
    });

    it('Should publish an event when project name is updated', async () => {
      await service.updateProject(identity, {
        ...project.toDTO(),
        name: 'Updated Project',
      });

      expect(publisher.publish).toHaveBeenCalledWith(
        'update-project-members',
        expect.objectContaining({ name: 'Updated Project' }),
      );
    });

    it('Should throw an error when user is not the owner', async () => {
      const anotherIdentity = { username: 'user2' };

      await expect(
        service.updateProject(anotherIdentity, project.toDTO()),
      ).rejects.toThrow('Insufficient permissions.');
    });
  });

  describe('updateTask', () => {
    let task: Task;

    beforeEach(async () => {
      await repository.createProject(project, identity);

      task = new Task(
        'task-123',
        project.getId(),
        'title',
        'description',
        identity.username,
        TaskStatus.NEW,
      );

      await repository.createTask(task);
    });

    it('Should update task', async () => {
      const taskFields = {
        title: 'Updated Task',
        description: 'Updated description',
        status: TaskStatus.IN_PROGRESS,
      };

      const updatedTask = await service.updateTask(identity, {
        ...task.toDTO(),
        ...taskFields,
      });

      expect(updatedTask).toMatchObject(taskFields);
    });

    it('Should not update if task did not change', async () => {
      const updateTaskSpy = vi.spyOn(repository, 'updateTask');

      await service.updateTask(identity, task.toDTO());

      expect(updateTaskSpy).not.toHaveBeenCalled();
    });

    it('Should throw an error when user is not a member of the project', async () => {
      const nonMember = { username: 'non-member' };

      await expect(service.updateTask(nonMember, task.toDTO())).rejects.toThrow(
        'User is not the member of the project',
      );
    });
  });
});
