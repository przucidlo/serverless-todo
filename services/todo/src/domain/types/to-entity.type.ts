import { Entity } from './entity.type';

export type ToEntity<E extends Entity> = ReturnType<E['toDTO']> & {
  toEntity: (...args: any[]) => E;
};
