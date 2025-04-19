import { IsString, ValidateNested } from 'class-validator';
import { ProjectUser } from '../../domain/project-user';

class ProjectDTO {
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  @IsString()
  id: string;

  name: string;
}

export class ProjectUserDTO {
  constructor(entity?: ProjectUser) {
    if (entity) {
      const dto = entity.toDTO();

      this.project = new ProjectDTO(dto.project.id, dto.project.name);
      this.username = dto.username;
      this.created_at = dto.created_at;
    }
  }

  @ValidateNested()
  project!: ProjectDTO;

  username!: string;

  created_at!: string;

  public toEntity(
    projectId: string,
    projectName: string,
    username: string,
  ): ProjectUser {
    return new ProjectUser(
      projectId,
      projectName,
      username,
      new Date().toISOString(),
    );
  }
}
