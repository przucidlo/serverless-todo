export interface Entity {
  toDTO(): unknown;
}

export type EntityData<E extends Entity> = ReturnType<E["toDTO"]>;

export type PartialEntity<
  E extends Entity,
  I extends keyof EntityData<E>
> = Partial<EntityData<E>> & Pick<EntityData<E>, I>;
