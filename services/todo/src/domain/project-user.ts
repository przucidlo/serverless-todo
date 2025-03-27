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
  private username: string;
  private createdAt: string;

  private project: Project;

  constructor(id: string, name: string, username: string, createdAt: string) {
    this.project = new Project(id, name);
    this.username = username;
    this.createdAt = createdAt;
  }

  toDTO() {
    return {
      username: this.username,
      created_at: this.createdAt,
      project: this.project.toDTO(),
    };
  }
}
