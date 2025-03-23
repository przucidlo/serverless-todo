import { TaskStatus } from "./taskStatus";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  owner: string | undefined;
}
