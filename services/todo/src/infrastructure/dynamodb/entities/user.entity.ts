import { string } from 'dynamodb-toolbox/attributes/string';
import { table } from './table';
import { schema } from 'dynamodb-toolbox/schema';
import { prefix } from 'dynamodb-toolbox/transformers/prefix';
import { Entity } from 'dynamodb-toolbox/entity';

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
