import { Entity, prefix, schema, string } from "dynamodb-toolbox";
import { table } from "./table";

const projectSchema = schema({
  pk: string().transform(prefix("PROJECT")).key(),
  sk: string().transform(prefix("PROJECT")).key(),
  name: string().required(),
  owner: string().required(),
});

export const projectEntity = new Entity({
  table,
  name: "project",
  schema: projectSchema,
});
