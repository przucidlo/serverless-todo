import { IsString, ValidateNested } from "class-validator";
import { ProjectUser } from "../domain/project-user";

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
      this.created_at = dto.created_at;
    }
  }

  @ValidateNested()
  project!: ProjectDTO;

  created_at!: string;
}
