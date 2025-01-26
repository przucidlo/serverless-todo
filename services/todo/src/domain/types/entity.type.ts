export interface Entity {
  toDTO(): unknown;
}

export function isEntity(arg: Entity | unknown): arg is Entity {
  return typeof (<Entity>arg)?.toDTO === 'function';
}

export type FromApplication<E> = E | { toDTO: () => E };

export type EntityData<E extends Entity> = ReturnType<E['toDTO']>;

export type PartialEntity<
  E extends Entity,
  I extends keyof EntityData<E>,
> = Partial<EntityData<E>> & Pick<EntityData<E>, I>;
