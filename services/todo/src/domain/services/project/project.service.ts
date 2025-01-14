import { Identity } from "../../identity";
import { Project } from "../../project";
import { UpdateEntity } from "../../types/entity.type";
import { ProjectRepository } from "./project.repository";

export const projectService = (repository: ProjectRepository) => {
  function addProject(project: Project, identity: Identity) {
    return repository.createProject(project, identity);
  }

  async function deleteProject(projectId: string, identity: Identity) {
    const project = await repository.getProject(projectId);

    if (!project.isOwner(identity)) {
      throw new Error("Insufficient permissions.");
    }

    return repository.deleteProject(project);
  }

  async function updateProject(
    entity: UpdateEntity<Project, "id">,
    identity: Identity
  ) {
    const project = await repository.getProject(entity.id);

    if (!project.isOwner(identity)) {
      throw new Error("Insufficient permissions.");
    }

    if (entity.name && project.compareNames(entity.name)) {
      project.changeName(entity.name);
    }

    return repository.updateProject(project);
  }

  return { addProject, deleteProject, updateProject };
};
