import { Entity, prefix, schema, Table, string } from "dynamodb-toolbox";
import { TaskStatus } from "../domain/task-status";
import { table } from "./table";

const taskSchema = schema({
  pk: string().transform(prefix("PROJECT")).key(),
  sk: string().transform(prefix("TASK")).key(),
  title: string().required(),
  description: string(),
  owner: string().optional(),
  status: string().enum(...Object.keys(TaskStatus)),
});

export const taskEntity = new Entity({
  table,
  name: "task",
  schema: taskSchema,
});
