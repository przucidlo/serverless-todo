import { Identity } from "../../identity";
import { Project } from "../../project";
import { ProjectUser } from "../../project-user";

export interface ProjectRepository {
  getProject: (projectId: string) => Promise<Project>;
  createProject: (
    project: Project,
    identity: Identity
  ) => Promise<[Project, ProjectUser]>;
  updateProject: (project: Project) => Promise<Project>;
  deleteProject: (project: Project) => Promise<void>;
  updateProjectMembers: (project: Project) => Promise<void>;
}
