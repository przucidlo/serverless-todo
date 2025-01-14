class Project {
  private id: string;
  private name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
    };
  }
}

export class ProjectUser {
  private project: Project;
  private createdAt: string;

  constructor(id: string, name: string, createdAt: string) {
    this.project = new Project(id, name);
    this.createdAt = createdAt;
  }

  toDTO() {
    return {
      project: this.project.toDTO(),
      created_at: this.createdAt,
    };
  }
}
