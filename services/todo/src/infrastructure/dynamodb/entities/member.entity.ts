import { Entity, prefix, schema, string } from 'dynamodb-toolbox';
import { table } from './table';

const memberSchema = schema({
  pk: string().transform(prefix('PROJECT')).key(),
  sk: string().transform(prefix('USER')).key(),
  GSI1PK: string().transform(prefix('USER')),
  GSI1SK: string().transform(prefix('PROJECT')),
  projectName: string(),
});

export const memberEntity = new Entity({
  table,
  name: 'member',
  schema: memberSchema,
});
