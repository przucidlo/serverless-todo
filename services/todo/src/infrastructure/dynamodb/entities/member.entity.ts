import { schema } from 'dynamodb-toolbox/schema';
import { table } from './table';
import { prefix } from 'dynamodb-toolbox/transformers/prefix';
import { string } from 'dynamodb-toolbox/attributes/string';
import { Entity } from 'dynamodb-toolbox/entity';

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
