import { Identity } from "./identity";
import { Entity } from "./types/entity.type";

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

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      owner: this.owner,
    };
  }
}
