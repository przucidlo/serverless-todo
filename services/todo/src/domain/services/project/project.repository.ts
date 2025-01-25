import { Identity } from '../../identity';
import { Project } from '../../project';
import { ProjectUser } from '../../project-user';
import { Task } from '../../task';

export interface ProjectRepository {
  getProject: (projectId: string) => Promise<Project>;
  createProject: (
    project: Project,
    identity: Identity,
  ) => Promise<[Project, ProjectUser]>;
  updateProject: (project: Project) => Promise<Project>;
  deleteProject: (project: Project) => Promise<void>;

  getUserProjects: (identity: Identity) => Promise<ProjectUser>;

  getMember: (identity: Identity, projectId: string) => Promise<ProjectUser>;
  updateMembers: (project: Project) => Promise<void>;

  createTask: (task: Task) => Promise<Task>;
  getTasks: (projectId: string) => Promise<Task[]>;
}
