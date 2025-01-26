import { Entity, prefix, schema, string } from 'dynamodb-toolbox';
import { table } from './table';

const userSchema = schema({
  pk: string().transform(prefix('USER')).key(),
  sk: string().transform(prefix('USER')).key(),
  username: string().required(),
  fullname: string().required(),
  email: string().required(),
});

export const userEntity = new Entity({
  table,
  name: 'user',
  schema: userSchema,
});
