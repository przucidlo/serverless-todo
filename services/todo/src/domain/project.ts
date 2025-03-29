import { Identity } from './identity';
import { Entity, PartialEntity } from './types/entity.type';

export type PartialProject = PartialEntity<Project, 'id'>;

export class Project implements Entity {
  private id: string;
  private name: string;
  private owner: string;

  constructor(id: string, name: string, owner: string) {
    this.id = id;
    this.name = name;
    this.owner = owner;
  }

  changeName(name: string): void {
    this.name = name;
  }

  compareNames(name: string): boolean {
    return this.name === name;
  }

  isOwner(identity: Identity): boolean {
    return this.owner === identity.username;
  }

  getId() {
    return this.id;
  }

  hasChanges(value: PartialProject): boolean {
    return Object.entries(value).some(
      ([key, val]) => this[key as keyof PartialProject] !== val,
    );
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      owner: this.owner,
    };
  }
}
