import { Identity } from '../../../domain/identity';
import { Project } from '../../../domain/project';
import { ProjectUser } from '../../../domain/project-user';
import { Task } from '../../../domain/task';

export interface ProjectRepository {
  getProject: (projectId: string) => Promise<Project>;
  createProject: (
    project: Project,
    identity: Identity,
  ) => Promise<[Project, ProjectUser]>;
  updateProject: (project: Project) => Promise<Project>;
  deleteProject: (project: Project) => Promise<void>;

  getUserProjects: (identity: Identity) => Promise<ProjectUser[]>;

  getMember: (identity: Identity, projectId: string) => Promise<ProjectUser>;
  updateMembers: (project: Project) => Promise<void>;

  createTask: (task: Task) => Promise<Task>;
  updateTask: (task: Task) => Promise<Task>;
  getTasks: (projectId: string) => Promise<Task[]>;
  getTask: (projectId: string, taskId: string) => Promise<Task>;
}
