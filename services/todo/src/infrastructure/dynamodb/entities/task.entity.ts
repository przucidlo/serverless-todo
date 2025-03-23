import { schema } from 'dynamodb-toolbox/schema';
import { TaskStatus } from '../../../domain/task-status';
import { table } from './table';
import { prefix } from 'dynamodb-toolbox/transformers/prefix';
import { string } from 'dynamodb-toolbox/attributes/string';
import { Entity } from 'dynamodb-toolbox/entity';

const taskSchema = schema({
  pk: string().transform(prefix('PROJECT')).key(),
  sk: string().transform(prefix('TASK')).key(),
  title: string().required(),
  description: string(),
  owner: string().optional(),
  status: string().enum(...Object.keys(TaskStatus)),
});

export const taskEntity = new Entity({
  table,
  name: 'task',
  schema: taskSchema,
});
