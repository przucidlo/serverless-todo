import { IsEmpty, IsOptional, IsString } from 'class-validator';
import { Project } from '../../domain/project';
import { ValidationGroup } from './task-dto';

export class ProjectDTO {
  constructor(entity?: Project) {
    if (entity) {
      const dto = entity.toDTO();

      this.id = dto.id;
      this.name = dto.name;
      this.owner = dto.owner;
    }
  }

  @IsEmpty()
  public id?: string;

  @IsString()
  @IsOptional({ groups: [ValidationGroup.PATCH] })
  public name!: string;

  @IsString()
  @IsOptional()
  public owner!: string;

  public toEntity(id: string, owner: string): Project {
    return new Project(id, this.name, owner);
  }
}
