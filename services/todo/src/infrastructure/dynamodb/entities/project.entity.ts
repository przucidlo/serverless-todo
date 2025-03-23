import { string } from 'dynamodb-toolbox/attributes/string';
import { table } from './table';
import { prefix } from 'dynamodb-toolbox/transformers/prefix';
import { schema } from 'dynamodb-toolbox/schema';
import { Entity } from 'dynamodb-toolbox/entity';

const projectSchema = schema({
  pk: string().transform(prefix('PROJECT')).key(),
  sk: string().transform(prefix('PROJECT')).key(),
  name: string().required(),
  owner: string().required(),
});

export const projectEntity = new Entity({
  table,
  name: 'project',
  schema: projectSchema,
});
